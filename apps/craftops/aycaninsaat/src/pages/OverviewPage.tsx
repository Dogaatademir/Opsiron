import { useMemo, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  ArrowRight, 
  Calendar,
  AlertTriangle,
  Building2 
} from "lucide-react";
import { useData } from "../context/DataContext";
import { Link } from "react-router-dom";
import { CustomSelect } from "../components/CustomSelect";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function OverviewPage() {
  const { islemler, kisiler, projeler } = useData();
  const [selectedProjeId, setSelectedProjeId] = useState<string>("all");

  // --- SEÇENEKLERİ HAZIRLA (CustomSelect İçin) ---
  const projeOptions = useMemo(() => {
    return [
      { value: "all", label: "TÜM ŞANTİYELER (TOPLAM)" },
      ...projeler.map((p) => ({ value: p.id, label: p.ad }))
    ];
  }, [projeler]);

  // --- FILTRELEME ---
  const filteredIslemler = useMemo(() => {
    if (selectedProjeId === "all") return islemler;
    return islemler.filter(i => i.proje_id === selectedProjeId);
  }, [islemler, selectedProjeId]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next10Days = new Date(today);
    next10Days.setDate(today.getDate() + 10);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 1. GENEL KASA DURUMU (Nakit Akışı)
    const tahsilat = filteredIslemler
      .filter((i) => i.tip === "tahsilat")
      .reduce((acc, curr) => acc + curr.tutar, 0);

    const odeme = filteredIslemler
      .filter((i) => i.tip === "odeme" || (i.tip === "cek" && i.is_bitiminde === 1))
      .reduce((acc, curr) => acc + curr.tutar, 0);

    const netDurum = tahsilat - odeme;

    // --- YENİ EKLENEN KISIM: ÖDENMEMİŞ ÇEKLER TOPLAMI ---
    // Şirketin yazdığı ama henüz bankadan çıkmamış çekler (Gelecek Yükümlülük)
    const odenmemisCeklerTotal = filteredIslemler
      .filter(i => i.tip === "cek" && i.is_bitiminde === 0)
      .reduce((acc, curr) => acc + curr.tutar, 0);

    // 2. CARİ HESAPLAR (AÇIK HESAP BORÇ/ALACAK)
    let totalKalanBorc = 0;
    let totalKalanAlacak = 0;

    kisiler.forEach((kisi) => {
      const kisiIslemleri = filteredIslemler.filter((t) => t.kisi_id === kisi.id);

      const topOdenecek = kisiIslemleri.filter((t) => t.tip === "odenecek").reduce((sum, t) => sum + t.tutar, 0);
      // Not: Çek verildiğinde cari borç düşer, ama toplam borç yükümlülüğüne (yukarıdaki çek toplamına) geçer.
      const topOdeme = kisiIslemleri.filter((t) => t.tip === "odeme" || t.tip === "cek").reduce((sum, t) => sum + t.tutar, 0);
      
      const topAlacak = kisiIslemleri.filter((t) => t.tip === "alacak").reduce((sum, t) => sum + t.tutar, 0);
      const topTahsilat = kisiIslemleri.filter((t) => t.tip === "tahsilat").reduce((sum, t) => sum + t.tutar, 0);

      totalKalanBorc += Math.max(0, topOdenecek - topOdeme);
      totalKalanAlacak += Math.max(0, topAlacak - topTahsilat);
    });

    // 3. YAKLAŞAN VADELER (10 GÜN)
    const yaklasanIslemler = filteredIslemler.filter(i => {
      if (!i.tarih) return false;
      const islemTarihi = new Date(i.tarih);
      return islemTarihi >= today && islemTarihi <= next10Days;
    });

    const yaklasanBorc = yaklasanIslemler
      .filter(i => i.tip === "odenecek" || (i.tip === "cek" && i.is_bitiminde === 0))
      .reduce((acc, curr) => ({ count: acc.count + 1, total: acc.total + curr.tutar }), { count: 0, total: 0 });
    
    const yaklasanAlacak = yaklasanIslemler
      .filter(i => i.tip === "alacak")
      .reduce((acc, curr) => ({ count: acc.count + 1, total: acc.total + curr.tutar }), { count: 0, total: 0 });

    // 4. BU AY ÖZETİ
    const buAyIslemler = filteredIslemler.filter(i => {
      if (!i.tarih) return false;
      const d = new Date(i.tarih);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const buAyTahsilat = buAyIslemler
      .filter(i => i.tip === "tahsilat")
      .reduce((acc, curr) => acc + curr.tutar, 0);
    
    const buAyOdeme = buAyIslemler
      .filter(i => i.tip === "odeme" || (i.tip === "cek" && i.is_bitiminde === 1))
      .reduce((acc, curr) => acc + curr.tutar, 0);

    return { 
      tahsilat, 
      odeme, 
      netDurum, 
      // TOPLAM YÜKÜMLÜLÜK: Cari Borçlar + Ödenmemiş Çekler
      odenecek: totalKalanBorc + odenmemisCeklerTotal, 
      alacak: totalKalanAlacak,
      yaklasan: { borc: yaklasanBorc, alacak: yaklasanAlacak },
      buAy: { tahsilat: buAyTahsilat, odeme: buAyOdeme, net: buAyTahsilat - buAyOdeme }
    };
  }, [filteredIslemler, kisiler]);

  // Son 5 İşlem
  const sonIslemler = useMemo(() => {
    return [...filteredIslemler]
      .sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""))
      .slice(0, 5);
  }, [filteredIslemler]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">
              GENEL BAKIŞ
            </h1>
            <p className="text-neutral-500 mt-1 font-light">
              {new Date().toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })} itibarıyla durum.
            </p>
          </div>

          {/* ŞANTİYE FİLTRESİ */}
          <div className="w-full md:w-80">
             <CustomSelect 
                label="GÖRÜNÜM / ŞANTİYE"
                value={selectedProjeId}
                onChange={(val) => setSelectedProjeId(val)}
                options={projeOptions}
                placeholder="Seçiniz"
                icon={Building2}
             />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* --- 1. FİNANSAL KARTLAR --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">NET NAKİT DURUMU</span>
              <div className={`p-2 rounded-full ${stats.netDurum >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <Wallet size={20} />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-light ${stats.netDurum >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(stats.netDurum)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">Kasa ve Banka Mevcudu</p>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">TOPLAM GİRİŞ</span>
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-light text-neutral-900">
                {formatCurrency(stats.tahsilat)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">Toplam yapılan tahsilat</p>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">TOPLAM ÇIKIŞ</span>
              <div className="p-2 rounded-full bg-orange-50 text-orange-600">
                <TrendingDown size={20} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-light text-neutral-900">
                {formatCurrency(stats.odeme)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">Nakit + Ödenen Çekler</p>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">TOPLAM YÜKÜMLÜLÜK</span>
              <div className="p-2 rounded-full bg-red-50 text-red-600">
                <AlertCircle size={20} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-light text-neutral-900">
                {formatCurrency(stats.odenecek)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">Cari Borçlar + Ödenmemiş Çekler</p>
            </div>
          </div>
        </div>

        {/* --- 2. ALT BÖLÜM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL KOLON: SON İŞLEMLER */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 shadow-sm">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-light text-neutral-900">Son Hareketler</h2>
              <Link to="/islemler" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
                TÜMÜNÜ GÖR <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-xs text-neutral-500 font-medium">
                  <tr>
                    <th className="px-6 py-3 tracking-wider">TARİH</th>
                    <th className="px-6 py-3 tracking-wider text-center">ŞANTİYE</th>
                    <th className="px-6 py-3 tracking-wider">AÇIKLAMA</th>
                    <th className="px-6 py-3 tracking-wider text-right">TUTAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sonIslemler.map((islem) => (
                    <tr key={islem.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-neutral-600 font-light whitespace-nowrap">
                        {islem.tip === 'cek' ? (
                          <div className="flex flex-col">
                             <span>{islem.tarih ? islem.tarih.split('-').reverse().join('.') : '-'}</span>
                             <span className={`text-[9px] px-1.5 py-0.5 rounded w-fit mt-1 ${islem.is_bitiminde ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                               {islem.is_bitiminde ? 'ÇEK ÖDENDİ' : 'ÇEK BEKLİYOR'}
                             </span>
                          </div>
                        ) : (
                          islem.tarih ? islem.tarih.split('-').reverse().join('.') : (islem.is_bitiminde ? 'İŞ BİTİMİ' : '-')
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase">
                            {projeler.find(p => p.id === islem.proje_id)?.ad || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-800 font-light truncate max-w-xs">
                        {islem.aciklama}
                        <div className="text-[10px] text-neutral-400 uppercase tracking-wide mt-0.5">
                           {kisiler.find(k => k.id === islem.kisi_id)?.ad}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <span className={
                          islem.tip === 'tahsilat' ? 'text-green-600' :
                          (islem.tip === 'odeme' || islem.tip === 'cek') ? 'text-red-600' :
                          'text-neutral-600'
                        }>
                          {(islem.tip === 'odeme' || islem.tip === 'cek') ? '-' : islem.tip === 'tahsilat' ? '+' : ''}
                          {formatCurrency(islem.tutar)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sonIslemler.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-neutral-400 text-sm">Henüz işlem yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAĞ KOLON */}
          <div className="space-y-6">
            
            <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
               <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-center gap-2 text-orange-800">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-bold tracking-wider uppercase">YAKLAŞAN (10 GÜN)</span>
               </div>
               <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                     <span className="text-sm text-neutral-600">Ödenecekler <br/><span className="text-[10px] text-neutral-400">(Borçlar + Çekler)</span></span>
                     <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">{formatCurrency(stats.yaklasan.borc.total)}</div>
                        <div className="text-[10px] text-neutral-400">{stats.yaklasan.borc.count} adet işlem</div>
                     </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-neutral-600">Alacaklar</span>
                     <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">{formatCurrency(stats.yaklasan.alacak.total)}</div>
                        <div className="text-[10px] text-neutral-400">{stats.yaklasan.alacak.count} adet işlem</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-neutral-200 shadow-sm p-6 relative">
              <div className="absolute top-4 right-4 text-neutral-100">
                <Calendar size={60} />
              </div>
              <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-4 relative z-10">
                BU AYIN ÖZETİ ({new Date().toLocaleDateString('tr-TR', { month: 'long' })})
              </h3>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-neutral-500">Aylık Tahsilat</span>
                  <span className="text-sm font-medium text-neutral-800">{formatCurrency(stats.buAy.tahsilat)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-neutral-500">Aylık Ödeme</span>
                  <span className="text-sm font-medium text-neutral-800">{formatCurrency(stats.buAy.odeme)}</span>
                </div>
                <div className="w-full border-t border-neutral-100 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-neutral-600">AYLIK NET</span>
                  <span className={`text-base font-bold ${stats.buAy.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.buAy.net > 0 ? '+' : ''}{formatCurrency(stats.buAy.net)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-400 tracking-wider uppercase mb-2">BEKLENEN ALACAKLAR</h3>
              <div className="text-3xl font-light text-neutral-800 mb-1">
                {formatCurrency(stats.alacak)}
              </div>
              <p className="text-xs text-neutral-500 font-light mb-4">
                Tahsil edilmemiş toplam net alacak bakiyesi.
              </p>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-2/3 opacity-50"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}