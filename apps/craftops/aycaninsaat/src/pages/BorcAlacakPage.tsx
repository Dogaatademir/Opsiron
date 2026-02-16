import { useMemo } from "react";
import { 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2,
  CalendarClock,
  Wallet,
  FileText} from "lucide-react";
import { useData } from "../context/DataContext";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BorcAlacakPage() {
  const { islemler, kisiler } = useData();

  const report = useMemo(() => {
    // 1. ÖDENMEMİŞ ÇEKLERİ HESAPLA
    const odenmemisCekler = islemler
      .filter(t => t.tip === 'cek' && t.is_bitiminde === 0)
      .sort((a, b) => (a.tarih || '').localeCompare(b.tarih || ''));

    const totalOdenmemisCek = odenmemisCekler.reduce((sum, t) => sum + t.tutar, 0);

    // 2. KİŞİ BAKİYELERİNİ HESAPLA
    const kisiBakiyeleri = kisiler.map(kisi => {
      const personTransactions = islemler.filter(t => t.kisi_id === kisi.id);

      const topOdenecek = personTransactions
        .filter(t => t.tip === 'odenecek')
        .reduce((sum, t) => sum + t.tutar, 0);

      const topOdeme = personTransactions
        .filter(t => t.tip === 'odeme' || t.tip === 'cek')
        .reduce((sum, t) => sum + t.tutar, 0);

      const topAlacak = personTransactions
        .filter(t => t.tip === 'alacak')
        .reduce((sum, t) => sum + t.tutar, 0);
      
      const topTahsilat = personTransactions
        .filter(t => t.tip === 'tahsilat')
        .reduce((sum, t) => sum + t.tutar, 0);

      const kalanBorc = Math.max(0, topOdenecek - topOdeme);
      const kalanAlacak = Math.max(0, topAlacak - topTahsilat);

      const dates = personTransactions
        .filter(t => (t.tip === 'odenecek' || t.tip === 'alacak') && t.tarih)
        .map(t => t.tarih as string)
        .sort();
      
      const sonVade = dates.length > 0 ? dates[dates.length - 1] : null;

      return {
        kisi,
        topOdenecek,
        topOdeme,
        kalanBorc,
        topAlacak,
        topTahsilat,
        kalanAlacak,
        sonVade
      };
    });

    const borcluListesi = kisiBakiyeleri
      .filter(k => k.kalanBorc > 0)
      .sort((a, b) => b.kalanBorc - a.kalanBorc);

    const alacakliListesi = kisiBakiyeleri
      .filter(k => k.kalanAlacak > 0)
      .sort((a, b) => b.kalanAlacak - a.kalanAlacak);

    const totalKalanBorc = borcluListesi.reduce((sum, k) => sum + k.kalanBorc, 0);
    const totalKalanAlacak = alacakliListesi.reduce((sum, k) => sum + k.kalanAlacak, 0);
    
    // Net Beklenti Hesabı
    const netBeklenti = totalKalanAlacak - totalKalanBorc - totalOdenmemisCek;

    return { 
        borcluListesi, 
        alacakliListesi, 
        totalKalanBorc, 
        totalKalanAlacak, 
        netBeklenti,
        odenmemisCekler,
        totalOdenmemisCek
    };
  }, [kisiler, islemler]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-light tracking-tight text-neutral-900">
            BORÇ & ALACAK
          </h1>
          <p className="text-neutral-500 mt-1 font-light">
            Cari hesap bakiyeleri ve bekleyen çek ödemeleri.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* NET BEKLENTİ KARTI (Tasarım sadeleştirildi) */}
        <div className="mb-8 bg-white p-8 border border-neutral-200 shadow-sm flex items-center justify-between">
            <div>
                <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">GENEL NET POZİSYON</span>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-4xl font-light tracking-tight ${report.netBeklenti >= 0 ? 'text-neutral-900' : 'text-red-600'}`}>
                        {report.netBeklenti > 0 ? '+' : ''}{formatCurrency(report.netBeklenti)}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-2 font-light">
                    (Alacaklar) - (Cari Borçlar) - (Ödenmemiş Çekler)
                </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
                <Wallet className="text-white" size={28} strokeWidth={1.5} />
            </div>
        </div>

        {/* --- ÖDENMEMİŞ ÇEKLER (Tasarım diğer kartlarla eşitlendi) --- */}
        <div className="mb-8 bg-white border border-neutral-200 shadow-sm">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <FileText size={14} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">ÖDENMEMİŞ ÇEKLER</h2>
                        <p className="text-xs text-neutral-500 font-light mt-0.5">Vadesi gelmemiş veya tahsil edilmemiş çekler</p>
                    </div>
                </div>
                <div className="text-xl font-light text-neutral-900">
                    {formatCurrency(report.totalOdenmemisCek)}
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-white border-b border-neutral-100 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">VADE TARİHİ</th>
                            <th className="px-6 py-4 font-medium">ALACAKLI</th>
                            <th className="px-6 py-4 font-medium">AÇIKLAMA</th>
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
                                <td className="px-6 py-4 text-sm text-neutral-500 font-light truncate max-w-xs">
                                    {cek.aciklama || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right">
                                    {formatCurrency(cek.tutar)}
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
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp size={14} className="text-green-600" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">CARİ ALACAKLAR</h2>
                    <p className="text-xs text-neutral-500 font-light mt-0.5">Tahsil edilecekler</p>
                </div>
              </div>
              <div className="text-xl font-light text-green-600">
                {formatCurrency(report.totalKalanAlacak)}
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
                    <tr key={row.kisi.id} className="hover:bg-neutral-50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs font-bold group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                                {row.kisi.ad.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-neutral-900">{row.kisi.ad}</div>
                                <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
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
                            {formatCurrency(row.kalanAlacak)}
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
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingDown size={14} className="text-red-600" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-neutral-900 tracking-wider uppercase">CARİ BORÇLAR</h2>
                    <p className="text-xs text-neutral-500 font-light mt-0.5">Ödenecek bakiyeler</p>
                </div>
              </div>
              <div className="text-xl font-light text-red-600">
                {formatCurrency(report.totalKalanBorc)}
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
                    <tr key={row.kisi.id} className="hover:bg-neutral-50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs font-bold group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                                {row.kisi.ad.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-neutral-900">{row.kisi.ad}</div>
                                <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
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
                            {formatCurrency(row.kalanBorc)}
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