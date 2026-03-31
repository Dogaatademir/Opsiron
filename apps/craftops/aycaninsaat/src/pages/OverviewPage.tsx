import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  ArrowRight,
  Calendar,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { Link } from "react-router-dom";
import { CustomSelect } from "../components/CustomSelect";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (tarih?: string | null) =>
  tarih ? tarih.split("-").reverse().join(".") : "—";

export default function OverviewPage() {
  const { islemler, kisiler, projeler } = useData();
  const [selectedProjeId, setSelectedProjeId] = useState<string>("all");

  const projeOptions = useMemo(() => [
    { value: "all", label: "TÜM ŞANTİYELER (TOPLAM)" },
    ...projeler.map((p) => ({ value: p.id, label: p.ad })),
  ], [projeler]);

  const filteredIslemler = useMemo(() => {
    if (selectedProjeId === "all") return islemler;
    return islemler.filter((i) => i.proje_id === selectedProjeId);
  }, [islemler, selectedProjeId]);

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

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next10Days = new Date(today);
    next10Days.setDate(today.getDate() + 10);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const tahsilat = filteredIslemler
      .filter((i) => i.tip === "tahsilat")
      .reduce((acc, curr) => acc + curr.tutar, 0);

    const odeme = filteredIslemler
      .filter((i) => i.tip === "odeme" || (i.tip === "cek" && i.is_bitiminde === 1))
      .reduce((acc, curr) => acc + curr.tutar, 0);

    const netDurum = tahsilat - odeme;

    let toplamYukumlulukGuncelTL = 0;
    let toplamAlacakGuncelTL = 0;

    filteredIslemler
      .filter((i) => i.tip === "cek" && i.is_bitiminde === 0)
      .forEach((cek) => {
        const dvz = cek.doviz || "TRY";
        const rawAmt = Number(cek.tutar_raw ?? cek.tutar);
        toplamYukumlulukGuncelTL += rawAmt * (currentRates[dvz as keyof typeof currentRates] || 1);
      });

    kisiler.forEach((kisi) => {
      const kisiIslemleri = filteredIslemler.filter((t) => t.kisi_id === kisi.id);
      if (!kisiIslemleri.length) return;
      const dovizler = Array.from(new Set(kisiIslemleri.map((t) => t.doviz || "TRY")));
      dovizler.forEach((dvz) => {
        const dvzI = kisiIslemleri.filter((t) => (t.doviz || "TRY") === dvz);
        const getRaw = (t: any) => Number(t.tutar_raw ?? t.tutar);
        const kalanBorc = Math.max(
          0,
          dvzI.filter((t) => t.tip === "odenecek").reduce((s, t) => s + getRaw(t), 0) -
          dvzI.filter((t) => t.tip === "odeme" || t.tip === "cek").reduce((s, t) => s + getRaw(t), 0)
        );
        if (kalanBorc > 0) toplamYukumlulukGuncelTL += kalanBorc * (currentRates[dvz as keyof typeof currentRates] || 1);
        const kalanAlacak = Math.max(
          0,
          dvzI.filter((t) => t.tip === "alacak").reduce((s, t) => s + getRaw(t), 0) -
          dvzI.filter((t) => t.tip === "tahsilat").reduce((s, t) => s + getRaw(t), 0)
        );
        if (kalanAlacak > 0) toplamAlacakGuncelTL += kalanAlacak * (currentRates[dvz as keyof typeof currentRates] || 1);
      });
    });

    const yaklasanIslemler = filteredIslemler.filter((i) => {
      if (!i.tarih) return false;
      const d = new Date(i.tarih);
      return d >= today && d <= next10Days;
    });

    const yaklasanBorc = yaklasanIslemler
      .filter((i) => i.tip === "odenecek" || (i.tip === "cek" && i.is_bitiminde === 0))
      .reduce((acc, curr) => ({ count: acc.count + 1, total: acc.total + curr.tutar }), { count: 0, total: 0 });

    const yaklasanAlacak = yaklasanIslemler
      .filter((i) => i.tip === "alacak")
      .reduce((acc, curr) => ({ count: acc.count + 1, total: acc.total + curr.tutar }), { count: 0, total: 0 });

    const buAyIslemler = filteredIslemler.filter((i) => {
      if (!i.tarih) return false;
      const d = new Date(i.tarih);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const buAyTahsilat = buAyIslemler.filter((i) => i.tip === "tahsilat").reduce((acc, curr) => acc + curr.tutar, 0);
    const buAyOdeme = buAyIslemler
      .filter((i) => i.tip === "odeme" || (i.tip === "cek" && i.is_bitiminde === 1))
      .reduce((acc, curr) => acc + curr.tutar, 0);

    // Şantiye bazlı net durum (tüm islemler üzerinden)
    const santiyeOzet = projeler.map((p) => {
      const pI = islemler.filter((i) => i.proje_id === p.id);
      const pTahsilat = pI.filter((i) => i.tip === "tahsilat").reduce((s, i) => s + i.tutar, 0);
      const pOdeme = pI
        .filter((i) => i.tip === "odeme" || (i.tip === "cek" && i.is_bitiminde === 1))
        .reduce((s, i) => s + i.tutar, 0);
      return { id: p.id, ad: p.ad, net: pTahsilat - pOdeme };
    });

    const acikCekSayisi = filteredIslemler.filter(
      (i) => i.tip === "cek" && i.is_bitiminde === 0
    ).length;

    return {
      tahsilat, odeme, netDurum,
      odenecek: toplamYukumlulukGuncelTL,
      alacak: toplamAlacakGuncelTL,
      yaklasan: { borc: yaklasanBorc, alacak: yaklasanAlacak },
      buAy: { tahsilat: buAyTahsilat, odeme: buAyOdeme, net: buAyTahsilat - buAyOdeme },
      santiyeOzet,
      acikCekSayisi,
    };
  }, [filteredIslemler, kisiler, projeler, islemler, currentRates]);

  const sonIslemler = useMemo(() =>
    [...filteredIslemler]
      .sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""))
      .slice(0, 6),
    [filteredIslemler]
  );

  const tipRenk: Record<string, string> = {
    tahsilat: "text-green-600",
    odeme:    "text-red-600",
    cek:      "text-orange-600",
    alacak:   "text-blue-600",
    odenecek: "text-red-600",
  };
  const tipLabel: Record<string, string> = {
    tahsilat: "TAHSİLAT",
    odeme:    "ÖDEME",
    cek:      "ÇEK",
    alacak:   "ALACAK",
    odenecek: "ÖDENECEk",
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">GENEL BAKIŞ</h1>
              <p className="text-neutral-500 mt-1 font-light">
                {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} itibarıyla durum
              </p>
            </div>
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
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── BÖLÜM 1 · 5 KPI KARTI ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

          {/* NET NAKİT */}
          <div className={`bg-white border border-neutral-200 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden
            ${stats.netDurum >= 0 ? "border-t-2 border-t-green-500" : "border-t-2 border-t-red-500"}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Net Kasa</span>
              <div className={`p-2 rounded-full ${stats.netDurum >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                <Wallet size={18} />
              </div>
            </div>
            <div className={`text-2xl font-light ${stats.netDurum >= 0 ? "text-green-700" : "text-red-700"}`}>
              {formatCurrency(stats.netDurum)}
            </div>
            <p className="text-xs text-neutral-400 mt-2 font-light">Tahsilat − Ödemeler</p>
          </div>

          {/* TOPLAM GİRİŞ */}
          <div className="bg-white border border-neutral-200 border-t-2 border-t-blue-400 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Toplam Giriş</span>
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-2xl font-light text-neutral-900">{formatCurrency(stats.tahsilat)}</div>
            <p className="text-xs text-neutral-400 mt-2 font-light">Toplam tahsilat</p>
          </div>

          {/* TOPLAM ÇIKIŞ */}
          <div className="bg-white border border-neutral-200 border-t-2 border-t-orange-400 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Toplam Çıkış</span>
              <div className="p-2 rounded-full bg-orange-50 text-orange-600">
                <TrendingDown size={18} />
              </div>
            </div>
            <div className="text-2xl font-light text-neutral-900">{formatCurrency(stats.odeme)}</div>
            <p className="text-xs text-neutral-400 mt-2 font-light">Nakit + ödenen çekler</p>
          </div>

          {/* YÜKÜMLÜLÜK */}
          <div className="bg-white border border-neutral-200 border-t-2 border-t-red-500 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Yükümlülük</span>
              <div className="p-2 rounded-full bg-red-50 text-red-600">
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="text-2xl font-light text-neutral-900">{formatCurrency(stats.odenecek)}</div>
            <p className="text-xs text-neutral-400 mt-2 font-light leading-relaxed">
              Cari borçlar + açık çekler
              {stats.acikCekSayisi > 0 && (
                <span className="block text-orange-500">({stats.acikCekSayisi} açık çek)</span>
              )}
            </p>
          </div>

          {/* BEKLENEN ALACAKLAR */}
          <div className="bg-white border border-neutral-200 border-t-2 border-t-green-500 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Alacaklar</span>
              <div className="p-2 rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-2xl font-light text-neutral-900">{formatCurrency(stats.alacak)}</div>
            <p className="text-xs text-neutral-400 mt-2 font-light">Tahsil edilmemiş bakiye</p>
          </div>

        </div>

        {/* ── BÖLÜM 2 · ANA İÇERİK ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* SOL: Son Hareketler */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 shadow-sm">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-light text-neutral-900">Son Hareketler</h2>
              <Link
                to="/islemler"
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
              >
                TÜMÜNÜ GÖR <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">TARİH</th>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">TİP</th>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider">AÇIKLAMA / KİŞİ</th>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider">ŞANTİYE</th>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider text-right whitespace-nowrap">TUTAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sonIslemler.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500 font-light">
                        Henüz işlem yok.
                      </td>
                    </tr>
                  )}
                  {sonIslemler.map((islem) => (
                    <tr key={islem.id} className="hover:bg-neutral-50 transition-colors">
                      {/* Tarih */}
                      <td className="px-6 py-5 font-light text-neutral-600 whitespace-nowrap">
                        {formatDate(islem.tarih)}
                        {islem.tip === "cek" && (
                          <div className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 w-fit tracking-wide
                            ${islem.is_bitiminde ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {islem.is_bitiminde ? "ÖDENDİ" : "BEKLİYOR"}
                          </div>
                        )}
                      </td>
                      {/* Tip */}
                      <td className="px-6 py-5">
                        <span className={`text-xs font-bold tracking-wider ${tipRenk[islem.tip] || "text-neutral-500"}`}>
                          {tipLabel[islem.tip] || islem.tip.toUpperCase()}
                        </span>
                      </td>
                      {/* Açıklama */}
                      <td className="px-6 py-5 max-w-[200px]">
                        <div className="text-sm font-light text-neutral-800 truncate">
                          {islem.aciklama || "—"}
                        </div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5 truncate">
                          {kisiler.find((k) => k.id === islem.kisi_id)?.ad}
                        </div>
                      </td>
                      {/* Şantiye */}
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block truncate max-w-[120px]">
                          {projeler.find((p) => p.id === islem.proje_id)?.ad || "—"}
                        </span>
                      </td>
                      {/* Tutar */}
                      <td className={`px-6 py-5 text-sm font-medium text-right whitespace-nowrap ${tipRenk[islem.tip] || "text-neutral-700"}`}>
                        {(islem.tip === "odeme" || islem.tip === "cek") ? "−"
                          : islem.tip === "tahsilat" ? "+" : ""}
                        {formatCurrency(islem.tutar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAĞ KOLON */}
          <div className="space-y-6">

            {/* Yaklaşan Vadeler */}
            <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
              <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-center gap-2 text-orange-800">
                <AlertTriangle size={15} />
                <span className="text-xs font-medium tracking-wider uppercase">Yaklaşan Vadeler · 10 Gün</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start pb-5 border-b border-neutral-100">
                  <div>
                    <p className="text-sm font-light text-neutral-700">Ödenecekler</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Borçlar + Çekler</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">{formatCurrency(stats.yaklasan.borc.total)}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{stats.yaklasan.borc.count} işlem</div>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-light text-neutral-700">Tahsil Edilecek</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Alacaklar</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{formatCurrency(stats.yaklasan.alacak.total)}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{stats.yaklasan.alacak.count} işlem</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bu Ay Özeti */}
            <div className="bg-white border border-neutral-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-neutral-100">
                <Calendar size={56} />
              </div>
              <h3 className="text-xs font-medium text-neutral-500 tracking-wider uppercase mb-5 relative z-10">
                Bu Ay · {new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 inline-block flex-shrink-0" />
                    Aylık Tahsilat
                  </span>
                  <span className="text-sm font-light text-neutral-800">{formatCurrency(stats.buAy.tahsilat)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 inline-block flex-shrink-0" />
                    Aylık Ödeme
                  </span>
                  <span className="text-sm font-light text-neutral-800">{formatCurrency(stats.buAy.odeme)}</span>
                </div>
                {(stats.buAy.tahsilat + stats.buAy.odeme) > 0 && (
                  <div className="flex h-1 bg-neutral-100 overflow-hidden">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${Math.round((stats.buAy.tahsilat / (stats.buAy.tahsilat + stats.buAy.odeme)) * 100)}%` }}
                    />
                    <div className="bg-red-400 flex-1" />
                  </div>
                )}
                <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Aylık Net</span>
                  <span className={`text-xl font-light ${stats.buAy.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.buAy.net > 0 ? "+" : ""}{formatCurrency(stats.buAy.net)}
                  </span>
                </div>
              </div>
            </div>

            {/* Şantiye Bazlı Net */}
            {stats.santiyeOzet.length > 0 && (
              <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <Building2 size={14} className="text-neutral-400" />
                  <h3 className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Şantiye Bazlı Net</h3>
                </div>
                <div className="divide-y divide-neutral-100">
                  {stats.santiyeOzet.map((s) => (
                    <div key={s.id} className="px-6 py-4 flex justify-between items-center hover:bg-neutral-50 transition-colors">
                      <span className="text-sm font-light text-neutral-700 truncate max-w-[160px]">{s.ad}</span>
                      <span className={`text-sm font-medium whitespace-nowrap ml-2 ${s.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {s.net > 0 ? "+" : ""}{formatCurrency(s.net)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Açık Çek Uyarısı */}
            {stats.acikCekSayisi > 0 && (
              <div className="bg-white border border-neutral-200 shadow-sm p-6 flex items-start gap-4">
                <div className="p-2 bg-orange-50 text-orange-600 flex-shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 tracking-wider uppercase">Açık Çekler</p>
                  <p className="text-sm font-light text-orange-600 mt-1">
                    {stats.acikCekSayisi} adet çek vadesi bekleniyor
                  </p>
                  <Link
                    to="/islemler"
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 mt-2 transition-colors"
                  >
                    Detaya git <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}