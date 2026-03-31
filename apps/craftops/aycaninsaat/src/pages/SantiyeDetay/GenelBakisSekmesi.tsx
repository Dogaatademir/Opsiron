import { useMemo } from "react";
import { BarChart2, TrendingUp, TrendingDown, Wallet, FileText } from "lucide-react";
import { useData, type Daire } from "../../context/DataContext";
import { formatCurrency, formatDate, DURUM_CONFIG, SOZLESME_TURU, KATEGORI_CONFIG } from "./santiye-ortak";

export default function GenelBakisSekmesi({ projeId }: { projeId: string }) {
  const { daireler, belgeler, islemler, kisiler } = useData();

  const projeDaireler = daireler.filter((d) => d.proje_id === projeId);
  const projeBelgeler = belgeler.filter((b) => b.proje_id === projeId);
  const projeIslemler = islemler.filter((i) => i.proje_id === projeId);

  const projeSozlesmeler = projeBelgeler.filter((b) => b.kategori === "sozlesme");
  const sonBelgeler = projeBelgeler.filter((b) => b.kategori !== "sozlesme").slice(0, 5);

  const daireOzet = useMemo(() => ({
    toplam: projeDaireler.length,
    musait: projeDaireler.filter((d) => d.durum === "musait").length,
    rezerve: projeDaireler.filter((d) => d.durum === "rezerve").length,
    satildi: projeDaireler.filter((d) => d.durum === "satildi").length,
    arsa_sahibi: projeDaireler.filter((d) => d.durum === "arsa_sahibi").length,
  }), [projeDaireler]);

  const finansOzet = useMemo(() => {
    const tahsilat = projeIslemler.filter((i) => i.tip === "tahsilat").reduce((s, i) => s + i.tutar, 0);
    const odeme = projeIslemler.filter((i) => i.tip === "odeme" || (i.tip === "cek" && i.is_bitiminde === 1)).reduce((s, i) => s + i.tutar, 0);
    let kalanBorc = 0, kalanAlacak = 0;
    kisiler.forEach((k) => {
      const ki = projeIslemler.filter((i) => i.kisi_id === k.id);
      kalanBorc += Math.max(0, ki.filter((i) => i.tip === "odenecek").reduce((s, i) => s + i.tutar, 0) - ki.filter((i) => i.tip === "odeme" || i.tip === "cek").reduce((s, i) => s + i.tutar, 0));
      kalanAlacak += Math.max(0, ki.filter((i) => i.tip === "alacak").reduce((s, i) => s + i.tutar, 0) - ki.filter((i) => i.tip === "tahsilat").reduce((s, i) => s + i.tutar, 0));
    });
    return { tahsilat, odeme, net: tahsilat - odeme, kalanBorc, kalanAlacak };
  }, [projeIslemler, kisiler]);

  return (
    <div className="space-y-8">
      {/* Daire Özeti */}
      <div>
        <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-4">DAİRE DURUMU</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["musait", "rezerve", "satildi", "arsa_sahibi"] as Daire["durum"][]).map((durum) => {
            const cfg = DURUM_CONFIG[durum];
            const count = daireOzet[durum];
            const pct = daireOzet.toplam > 0 ? Math.round((count / daireOzet.toplam) * 100) : 0;
            return (
              <div key={durum} className={`p-4 border ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
                  <span className={`text-xs font-bold tracking-wider uppercase ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className={`text-3xl font-light ${cfg.color}`}>{count}</div>
                <div className="text-xs text-neutral-400 mt-1">%{pct} · {daireOzet.toplam} toplam</div>
              </div>
            );
          })}
        </div>
        {daireOzet.toplam > 0 && (
          <div className="mt-3 flex h-2 overflow-hidden bg-neutral-100">
            {(["satildi", "rezerve", "arsa_sahibi", "musait"] as Daire["durum"][]).map((durum) => {
              const pct = (daireOzet[durum] / daireOzet.toplam) * 100;
              const colors = { satildi: "bg-red-500", rezerve: "bg-yellow-400", arsa_sahibi: "bg-purple-500", musait: "bg-green-500" };
              return pct > 0 ? <div key={durum} style={{ width: `${pct}%` }} className={`${colors[durum]} transition-all`}></div> : null;
            })}
          </div>
        )}
      </div>

      {/* Finansal Özet */}
      <div>
        <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-4">FİNANSAL ÖZET</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Net Nakit", value: finansOzet.net, icon: Wallet, color: finansOzet.net >= 0 ? "text-green-600" : "text-red-600" },
            { label: "Toplam Tahsilat", value: finansOzet.tahsilat, icon: TrendingUp, color: "text-blue-600" },
            { label: "Toplam Ödeme", value: finansOzet.odeme, icon: TrendingDown, color: "text-orange-600" },
            { label: "Kalan Alacak", value: finansOzet.kalanAlacak, icon: BarChart2, color: "text-neutral-700" },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">{item.label}</span>
                <item.icon size={16} className={item.color} />
              </div>
              <div className={`text-xl font-light ${item.color}`}>{formatCurrency(item.value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200">
          <div className="px-5 py-4 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">SÖZLEŞMELER</span>
          </div>
          <div className="divide-y divide-neutral-50">
            {projeSozlesmeler.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 text-sm">Sözleşme yüklenmemiş.</div>
            ) : projeSozlesmeler.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-neutral-900">{s.baslik}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {/* @ts-ignore */}
                    {s.sozlesme_turu ? SOZLESME_TURU[s.sozlesme_turu] : "Sözleşme"} · {formatDate(s.created_at?.slice(0, 10) ?? null)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200">
          <div className="px-5 py-4 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">SON YÜKLENEN BELGELER</span>
          </div>
          <div className="divide-y divide-neutral-50">
            {sonBelgeler.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 text-sm">Belge yok.</div>
            ) : sonBelgeler.map((b) => {
              const kat = KATEGORI_CONFIG[b.kategori];
              return (
                <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={14} className="text-neutral-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-neutral-800 truncate">{b.baslik}</div>
                      <div className="text-xs text-neutral-400">{formatDate(b.created_at?.slice(0, 10) ?? null)}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shrink-0 ${kat.color}`}>{kat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}