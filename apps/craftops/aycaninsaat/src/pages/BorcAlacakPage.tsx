import { useMemo, useState } from "react";
import { 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2,
  CalendarClock,
  Wallet,
  FileText,
  Building2} from "lucide-react";
import { useData } from "../context/DataContext";
import { CustomSelect } from "../components/CustomSelect";

// DÖVİZ SEMBOLLERİ
const DOVIZ_SEMBOL: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", ALTIN: "gr" };

// PARA FORMATLAYICI (Tablolardaki döviz cinsiyle gösterim için)
const formatMoney = (amount: number, dvz: string = "TRY") => {
  const symbol = DOVIZ_SEMBOL[dvz] || dvz;
  return amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + symbol;
};

// TEKİL TL FORMATLAYICI (Tepe özetleri için)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BorcAlacakPage() {
  const { islemler, kisiler, projeler } = useData();
  const [selectedProjeId, setSelectedProjeId] = useState<string>("all");

  const projeOptions = useMemo(() => {
    return [
      { value: "all", label: "TÜM ŞANTİYELER (GENEL DURUM)" },
      ...projeler.map((p) => ({ value: p.id, label: p.ad }))
    ];
  }, [projeler]);

  const filteredIslemler = useMemo(() => {
    if (selectedProjeId === "all") return islemler;
    return islemler.filter(i => i.proje_id === selectedProjeId);
  }, [islemler, selectedProjeId]);

  // LOCALSTORAGE'DAN GÜNCEL KURLARI ÇEK
  const currentRates = useMemo(() => {
    const saved = localStorage.getItem("guncel_kurlar");
    const parsed = saved ? JSON.parse(saved) : {};
    return {
       TRY: 1,
       USD: parseFloat(parsed.USD) || 1,
       EUR: parseFloat(parsed.EUR) || 1,
       ALTIN: parseFloat(parsed.ALTIN) || 1,
    };
  }, []);

  const report = useMemo(() => {
    // 1. ÖDENMEMİŞ ÇEKLER
    const odenmemisCekler = filteredIslemler
      .filter(t => t.tip === 'cek' && t.is_bitiminde === 0)
      .sort((a, b) => (a.tarih || '').localeCompare(b.tarih || ''));

    // 2. KİŞİ BAKİYELERİNİ DÖVİZ BAZLI HESAPLA
    const bakiyeListesi: any[] = [];

    kisiler.forEach(kisi => {
      const personTransactions = filteredIslemler.filter(t => t.kisi_id === kisi.id);
      if (personTransactions.length === 0) return;

      const dovizler = Array.from(new Set(personTransactions.map(t => t.doviz || "TRY")));

      dovizler.forEach(dvz => {
        const dvzIslemler = personTransactions.filter(t => (t.doviz || "TRY") === dvz);
        const getAmount = (t: any) => Number(t.tutar_raw ? t.tutar_raw : t.tutar);

        const topOdenecek = dvzIslemler.filter(t => t.tip === 'odenecek').reduce((sum, t) => sum + getAmount(t), 0);
        const topOdeme = dvzIslemler.filter(t => t.tip === 'odeme' || t.tip === 'cek').reduce((sum, t) => sum + getAmount(t), 0);
        const topAlacak = dvzIslemler.filter(t => t.tip === 'alacak').reduce((sum, t) => sum + getAmount(t), 0);
        const topTahsilat = dvzIslemler.filter(t => t.tip === 'tahsilat').reduce((sum, t) => sum + getAmount(t), 0);

        const kalanBorc = Math.max(0, topOdenecek - topOdeme);
        const kalanAlacak = Math.max(0, topAlacak - topTahsilat);

        const dates = dvzIslemler
          .filter(t => (t.tip === 'odenecek' || t.tip === 'alacak') && t.tarih)
          .map(t => t.tarih as string)
          .sort();
        
        const sonVade = dates.length > 0 ? dates[dates.length - 1] : null;

        if (kalanBorc > 0 || kalanAlacak > 0) {
          bakiyeListesi.push({
            kisi,
            doviz: dvz,
            topOdenecek,
            topOdeme,
            kalanBorc,
            topAlacak,
            topTahsilat,
            kalanAlacak,
            sonVade
          });
        }
      });
    });

    const borcluListesi = bakiyeListesi
      .filter(k => k.kalanBorc > 0)
      .sort((a, b) => b.kalanBorc - a.kalanBorc);

    const alacakliListesi = bakiyeListesi
      .filter(k => k.kalanAlacak > 0)
      .sort((a, b) => b.kalanAlacak - a.kalanAlacak);

    // 3. GENEL TOPLAMLARI DÖVİZ BAZLI GRUPLA
    const genelOzet: Record<string, { odenmemisCek: number, kalanBorc: number, kalanAlacak: number, netBeklenti: number }> = {};
    
    odenmemisCekler.forEach(cek => {
        const dvz = cek.doviz || "TRY";
        if (!genelOzet[dvz]) genelOzet[dvz] = { odenmemisCek: 0, kalanBorc: 0, kalanAlacak: 0, netBeklenti: 0 };
        genelOzet[dvz].odenmemisCek += Number(cek.tutar_raw ? cek.tutar_raw : cek.tutar);
    });

    bakiyeListesi.forEach(b => {
        const dvz = b.doviz;
        if (!genelOzet[dvz]) genelOzet[dvz] = { odenmemisCek: 0, kalanBorc: 0, kalanAlacak: 0, netBeklenti: 0 };
        genelOzet[dvz].kalanBorc += b.kalanBorc;
        genelOzet[dvz].kalanAlacak += b.kalanAlacak;
    });

    Object.keys(genelOzet).forEach(dvz => {
        genelOzet[dvz].netBeklenti = genelOzet[dvz].kalanAlacak - genelOzet[dvz].kalanBorc - genelOzet[dvz].odenmemisCek;
    });

    return { 
        borcluListesi, 
        alacakliListesi, 
        odenmemisCekler,
        genelOzet
    };
  }, [kisiler, filteredIslemler]);

  // GÜNCEL KURLAR İLE TEKİL TL TOPLAMLARI
  const totalsInTL = useMemo(() => {
    let netBeklentiTL = 0;
    let kalanAlacakTL = 0;
    let kalanBorcTL = 0;
    let odenmemisCekTL = 0;

    Object.entries(report.genelOzet).forEach(([dvz, ozet]) => {
      const rate = currentRates[dvz as keyof typeof currentRates] || 1;
      netBeklentiTL += ozet.netBeklenti * rate;
      kalanAlacakTL += ozet.kalanAlacak * rate;
      kalanBorcTL += ozet.kalanBorc * rate;
      odenmemisCekTL += ozet.odenmemisCek * rate;
    });

    return { netBeklentiTL, kalanAlacakTL, kalanBorcTL, odenmemisCekTL };
  }, [report.genelOzet, currentRates]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">
              BORÇ & ALACAK
            </h1>
            <p className="text-neutral-500 mt-1 font-light">
              Cari hesap bakiyeleri ve bekleyen çek ödemeleri.
            </p>
          </div>
          <div className="w-full md:w-80">
             <CustomSelect 
                label="ŞANTİYE FİLTRESİ"
                value={selectedProjeId}
                onChange={(val) => setSelectedProjeId(val)}
                options={projeOptions}
                placeholder="Seçiniz"
                icon={Building2}
             />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* NET BEKLENTİ KARTI (Güncel Kur TL Karşılığı) */}
        <div className="mb-8 bg-white p-8 border border-neutral-200 shadow-sm flex items-start justify-between">
            <div>
                <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">GENEL NET POZİSYON {selectedProjeId !== 'all' && `(${projeler.find(p=>p.id === selectedProjeId)?.ad})`}</span>
                
                <div className="flex items-baseline gap-2 mt-4">
                  <span className={`text-4xl font-light tracking-tight ${totalsInTL.netBeklentiTL >= 0 ? 'text-neutral-900' : 'text-red-600'}`}>
                    {totalsInTL.netBeklentiTL > 0 ? '+' : ''}{formatCurrency(totalsInTL.netBeklentiTL)}
                  </span>
                </div>
                
                <p className="text-[11px] text-neutral-400 mt-4 font-light">
                    (Alacaklar) - (Cari Borçlar) - (Ödenmemiş Çekler) <br/><span className="italic opacity-80">(Dövizler ayarlardaki güncel kur üzerinden TL'ye çevrilmiştir)</span>
                </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                <Wallet className="text-white" size={28} strokeWidth={1.5} />
            </div>
        </div>

        {/* --- ÖDENMEMİŞ ÇEKLER --- */}
        <div className="mb-8 bg-white border border-neutral-200 shadow-sm">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <FileText size={14} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">ÖDENMEMİŞ ÇEKLER</h2>
                        <p className="text-[10px] text-neutral-500 font-light mt-0.5">Vadesi gelmemiş çeklerin güncel TL karşılığı</p>
                    </div>
                </div>
                <div className="text-xl font-light text-neutral-900 flex gap-4">
                    <span>{formatCurrency(totalsInTL.odenmemisCekTL)}</span>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-white border-b border-neutral-100 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">VADE TARİHİ</th>
                            <th className="px-6 py-4 font-medium">ALACAKLI</th>
                            <th className="px-6 py-4 font-medium">ŞANTİYE</th>
                            <th className="px-6 py-4 font-medium text-right">TUTAR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {report.odenmemisCekler.map((cek) => (
                            <tr key={cek.id} className="hover:bg-neutral-50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-sm text-neutral-600 group-hover:text-neutral-900">
                                    {cek.tarih ? cek.tarih.split('-').reverse().join('.') : '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-600 font-light group-hover:text-neutral-900">
                                    {kisiler.find(k => k.id === cek.kisi_id)?.ad || 'Bilinmiyor'}
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase">
                                    {projeler.find(p => p.id === cek.proje_id)?.ad || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right whitespace-nowrap">
                                    {formatMoney(Number(cek.tutar_raw ? cek.tutar_raw : cek.tutar), cek.doviz || "TRY")}
                                </td>
                            </tr>
                        ))}
                        {report.odenmemisCekler.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-neutral-400 text-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle2 size={24} className="text-neutral-200" />
                                        <span>Ödenmemiş çek bulunmuyor.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- SOL KOLON: ALACAKLAR --- */}
          <div className="bg-white border border-neutral-200 shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp size={14} className="text-green-600" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">CARİ ALACAKLAR</h2>
                    <p className="text-[10px] text-neutral-500 font-light mt-0.5">Toplam alacakların güncel TL karşılığı</p>
                </div>
              </div>
              <div className="text-xl font-light text-green-600 flex gap-4">
                  <span>{formatCurrency(totalsInTL.kalanAlacakTL)}</span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[500px]">
                <thead className="bg-white border-b border-neutral-100 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                    <tr>
                    <th className="px-6 py-4 font-medium">KİŞİ / KURUM</th>
                    <th className="px-6 py-4 font-medium text-center">DURUM</th>
                    <th className="px-6 py-4 font-medium text-right">KALAN</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                    {report.alacakliListesi.map((row) => (
                    <tr key={`${row.kisi.id}-${row.doviz}`} className="hover:bg-neutral-50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs font-bold group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0">
                                {row.kisi.ad.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                                  {row.kisi.ad}
                                  {row.doviz !== 'TRY' && <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded font-bold">{row.doviz}</span>}
                                </div>
                                <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono mt-0.5">
                                    <CalendarClock size={10} /> {row.sonVade ? row.sonVade.split('-').reverse().join('.') : '-'}
                                </div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                            <div className="text-[10px] text-neutral-400 whitespace-nowrap">
                                %{Math.round((row.topTahsilat / row.topAlacak) * 100)} Tahsilat
                            </div>
                            <div className="w-16 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${Math.min(100, (row.topTahsilat / row.topAlacak) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-neutral-900 whitespace-nowrap">
                            {formatMoney(row.kalanAlacak, row.doviz)}
                        </div>
                        </td>
                    </tr>
                    ))}
                    {report.alacakliListesi.length === 0 && (
                    <tr><td colSpan={3} className="p-8 text-center text-neutral-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 size={24} className="text-neutral-200" />
                            <span>Alacak kaydı yok.</span>
                        </div>
                    </td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

          {/* --- SAĞ KOLON: BORÇLAR --- */}
          <div className="bg-white border border-neutral-200 shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingDown size={14} className="text-red-600" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">CARİ BORÇLAR</h2>
                    <p className="text-[10px] text-neutral-500 font-light mt-0.5">Toplam borçların güncel TL karşılığı</p>
                </div>
              </div>
              <div className="text-xl font-light text-red-600 flex gap-4">
                  <span>{formatCurrency(totalsInTL.kalanBorcTL)}</span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[500px]">
                <thead className="bg-white border-b border-neutral-100 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                    <tr>
                    <th className="px-6 py-4 font-medium">KİŞİ / KURUM</th>
                    <th className="px-6 py-4 font-medium text-center">DURUM</th>
                    <th className="px-6 py-4 font-medium text-right">KALAN</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                    {report.borcluListesi.map((row) => (
                    <tr key={`${row.kisi.id}-${row.doviz}`} className="hover:bg-neutral-50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs font-bold group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0">
                                {row.kisi.ad.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-neutral-900 flex items-center gap-2">
                                  {row.kisi.ad}
                                  {row.doviz !== 'TRY' && <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded font-bold">{row.doviz}</span>}
                                </div>
                                <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono mt-0.5">
                                    <CalendarClock size={10} /> {row.sonVade ? row.sonVade.split('-').reverse().join('.') : '-'}
                                </div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                            <div className="text-[10px] text-neutral-400 whitespace-nowrap">
                                %{Math.round((row.topOdeme / row.topOdenecek) * 100)} Ödeme
                            </div>
                            <div className="w-16 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-red-500" 
                                    style={{ width: `${Math.min(100, (row.topOdeme / row.topOdenecek) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-neutral-900 whitespace-nowrap">
                            {formatMoney(row.kalanBorc, row.doviz)}
                        </div>
                        </td>
                    </tr>
                    ))}
                    {report.borcluListesi.length === 0 && (
                    <tr><td colSpan={3} className="p-8 text-center text-neutral-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 size={24} className="text-neutral-200" />
                            <span>Borç kaydı yok.</span>
                        </div>
                    </td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}