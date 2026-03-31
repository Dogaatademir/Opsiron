import { useState, useMemo } from "react";
import { Home, Grid3X3, List, Layers, Plus, CheckCircle2, Info, FileCheck, Pencil, Trash2, User, AlertCircle, DollarSign } from "lucide-react";
import { useData, type Daire } from "../../context/DataContext";
import { CustomSelect } from "../../components/CustomSelect";
import { formatCurrency, formatDate, DURUM_CONFIG, INITIAL_DAIRE, Modal, FieldLabel, TextInput } from "./santiye-ortak";

const DOVIZ_SEMBOL: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", ALTIN: "gr" };
const DOVIZ_OPTIONS = [
  { value: "TRY", label: "TL (₺)" },
  { value: "USD", label: "Dolar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "ALTIN", label: "Altın (gr)" }
];

export default function DairelerSekmesi({ projeId }: { projeId: string }) {
  const { daireler, addDaire, addDairelerToplu, updateDaire, removeDaire, kisiler, kisiProjeler, islemler, addIslem } = useData();
  const projeDaireler = daireler.filter((d) => d.proje_id === projeId);

  const [gorunum, setGorunum] = useState<"tablo" | "grid">("tablo");
  const [modal, setModal] = useState<null | "ekle" | "toplu" | "duzenle" | "satis" | "tapu" | "info">(null);
  const [seciliDaire, setSeciliDaire] = useState<Daire | null>(null);
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Daire, "id" | "created_at">>({ ...INITIAL_DAIRE, proje_id: projeId });
  const [filterDurum, setFilterDurum] = useState<string>("hepsi");
  const [saving, setSaving] = useState(false);
  const [tapuTarihi, setTapuTarihi] = useState("");

  const [topluBlok, setTopluBlok] = useState("A");
  const [topluBaslangic, setTopluBaslangic] = useState(1);
  const [topluBitis, setTopluBitis] = useState(10);
  const [topluTip, setTopluTip] = useState("2+1");
  const [topluDurum, setTopluDurum] = useState<Daire["durum"]>("musait");
  const [topluKat, setTopluKat] = useState<number | null>(null);
  const [topluMetrekare, setTopluMetrekare] = useState<number | null>(null);
  const [topluFiyat, setTopluFiyat] = useState<number | null>(null);

  const [satisForm, setSatisForm] = useState({
    kisi_id: "",
    doviz: "TRY" as "TRY" | "USD" | "EUR" | "ALTIN", // TYPESCRIPT HATASI BURADA ÇÖZÜLDÜ
    kur: "1",
    fiyat: "",
    pesinat: "",
    taksitSayisi: "0",
    baslangicTarihi: new Date().toISOString().slice(0, 10),
    ozelTaksit: false,
    taksitler: [] as { tarih: string, tutar: string }[],
    komisyonVar: false,
    emlakci_id: "",
    komisyonTutari: ""
  });

  const filtrelenmis = (filterDurum === "hepsi" ? projeDaireler : projeDaireler.filter((d) => d.durum === filterDurum))
    .sort((a, b) => {
      const blokA = a.blok || "";
      const blokB = b.blok || "";
      const blokKarsilastirma = blokA.localeCompare(blokB, "tr");
      if (blokKarsilastirma !== 0) return blokKarsilastirma;
      return a.daire_no.localeCompare(b.daire_no, undefined, { numeric: true, sensitivity: 'base' });
    });

  const durumOzet = useMemo(() => {
    const ozet = { musait: 0, rezerve: 0, satildi: 0, arsa_sahibi: 0 };
    projeDaireler.forEach((d) => ozet[d.durum]++);
    return ozet;
  }, [projeDaireler]);

  const kisiOptions = useMemo(() => {
    return kisiler
      .filter((k) => k.rol === "musteri" && kisiProjeler.some((kp) => kp.kisi_id === k.id && kp.proje_id === projeId))
      .map((k) => ({ value: k.id, label: k.ad }));
  }, [kisiler, kisiProjeler, projeId]);

  const emlakciOptions = useMemo(() => {
    return kisiler
      .filter((k) => k.rol === "emlakci" && kisiProjeler.some((kp) => kp.kisi_id === k.id && kp.proje_id === projeId))
      .map((k) => ({ value: k.id, label: k.ad }));
  }, [kisiler, kisiProjeler, projeId]);

  const getSatisDetay = (d: Daire) => {
    if (d.durum !== "satildi") return null;

    let aliciAd = "Bilinmiyor";
    if (d.alici_id) {
      const alici = kisiler.find(k => k.id === d.alici_id);
      if (alici) aliciAd = alici.ad;
    } else {
      const notAliciMatch = d.notlar?.match(/Alıcı: (.*)/);
      if (notAliciMatch) aliciAd = notAliciMatch[1].trim();
    }

    let satisFiyati = null;
    const fiyatMatch = d.notlar?.match(/Fiyat: ([^\n]+)/);
    if (fiyatMatch) {
      satisFiyati = fiyatMatch[1].split('(')[0].trim();
    }
    
    // @ts-ignore
    const tapu = d.tapu_tarihi;
    return { aliciAd, tapu, satisFiyati };
  };

  const acModal = (tip: "ekle" | "toplu") => {
    setForm({ ...INITIAL_DAIRE, proje_id: projeId });
    setModal(tip);
  };

  const acDuzenle = (d: Daire) => {
    setSeciliDaire(d);
    setForm({ proje_id: d.proje_id, blok: d.blok || "", daire_no: d.daire_no, kat: d.kat, metrekare: d.metrekare, tip: d.tip || "", durum: d.durum, fiyat: d.fiyat, arsa_sahibi_payi: d.arsa_sahibi_payi, notlar: d.notlar || "", alici_id: d.alici_id });
    setModal("duzenle");
  };

  const acSatis = (d: Daire) => {
    setSeciliDaire(d);
    setSatisForm({
      kisi_id: "",
      doviz: "TRY",
      kur: "1",
      fiyat: d.fiyat?.toString() || "",
      pesinat: "",
      taksitSayisi: "0",
      baslangicTarihi: new Date().toISOString().slice(0, 10),
      ozelTaksit: false,
      taksitler: [],
      komisyonVar: false,
      emlakci_id: "",
      komisyonTutari: ""
    });
    setModal("satis");
  };

  const acTapu = (d: Daire) => {
    setSeciliDaire(d);
    // @ts-ignore
    setTapuTarihi(d.tapu_tarihi || new Date().toISOString().slice(0, 10));
    setModal("tapu");
  };

  const acInfo = (d: Daire) => {
    setSeciliDaire(d);
    setModal("info");
  };

  const kaydet = async () => {
    if (!form.daire_no.trim()) return alert("Daire no zorunludur.");
    setSaving(true);
    try {
      if (modal === "ekle") await addDaire(form);
      else if (modal === "duzenle" && seciliDaire) await updateDaire(seciliDaire.id, form);
      setModal(null);
    } catch (e: any) { alert("Hata: " + e.message); }
    finally { setSaving(false); }
  };

  const kaydetTapu = async () => {
    if (!seciliDaire) return;
    setSaving(true);
    try {
      // @ts-ignore
      await updateDaire(seciliDaire.id, { tapu_tarihi: tapuTarihi });
      setModal(null);
    } catch (e: any) { alert("Hata: " + e.message); }
    finally { setSaving(false); }
  };

  const topluEkle = async () => {
    if (topluBaslangic > topluBitis) return alert("Başlangıç numarası bitiş numarasından büyük olamaz.");
    const yeniDaireler = Array.from({ length: topluBitis - topluBaslangic + 1 }, (_, i) => ({
      proje_id: projeId,
      blok: topluBlok || null,
      daire_no: String(topluBaslangic + i),
      kat: topluKat,
      metrekare: topluMetrekare,
      tip: topluTip || null,
      durum: topluDurum,
      fiyat: topluFiyat,
      arsa_sahibi_payi: false,
      notlar: null,
      alici_id: null,
    }));
    setSaving(true);
    try {
      await addDairelerToplu(yeniDaireler);
      setModal(null);
    } catch (e: any) { alert("Hata: " + e.message); }
    finally { setSaving(false); }
  };

  const formatPara = (tutar: number, doviz: string) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tutar) + " " + (DOVIZ_SEMBOL[doviz] || doviz);
  };

  const satisYap = async () => {
    if (!satisForm.kisi_id) return alert("Lütfen satın alan kişiyi seçiniz.");
    if (!satisForm.fiyat || parseFloat(satisForm.fiyat) <= 0) return alert("Geçerli bir satış fiyatı giriniz.");
    if (satisForm.doviz !== "TRY" && (!satisForm.kur || parseFloat(satisForm.kur) <= 0)) return alert("Geçerli bir döviz kuru giriniz.");
    
    if (satisForm.komisyonVar) {
      if (!satisForm.emlakci_id) return alert("Lütfen komisyon verilecek emlakçıyı seçiniz.");
      if (!satisForm.komisyonTutari || parseFloat(satisForm.komisyonTutari) <= 0) return alert("Geçerli bir komisyon tutarı giriniz.");
    }

    if (!seciliDaire) return;

    const kur = satisForm.doviz === "TRY" ? 1 : parseFloat(satisForm.kur);
    const fiyatRaw = parseFloat(satisForm.fiyat);
    const pesinatRaw = parseFloat(satisForm.pesinat) || 0;
    const taksitSayisi = parseInt(satisForm.taksitSayisi) || 0;
    const kalanRaw = fiyatRaw - pesinatRaw;
    const komisyonRaw = satisForm.komisyonVar ? parseFloat(satisForm.komisyonTutari) || 0 : 0;

    const fiyatTL = Number((fiyatRaw * kur).toFixed(2));
    const pesinatTL = Number((pesinatRaw * kur).toFixed(2));
    const kalanTL = Number((kalanRaw * kur).toFixed(2));
    const komisyonTL = Number((komisyonRaw * kur).toFixed(2));

    if (pesinatRaw > fiyatRaw) return alert("Peşinat tutarı toplam satış fiyatından büyük olamaz.");

    if (satisForm.ozelTaksit && taksitSayisi > 0) {
      if (satisForm.taksitler.some(t => !t.tarih || !t.tutar)) {
        return alert("Lütfen tüm özel taksitlerin tarih ve tutarlarını eksiksiz doldurunuz.");
      }
      const toplamTaksitGirdisi = satisForm.taksitler.reduce((acc, curr) => acc + (parseFloat(curr.tutar) || 0), 0);
      if (Math.abs(toplamTaksitGirdisi - kalanRaw) > 0.1) {
        return alert(`Girdiğiniz taksitlerin toplamı (${formatPara(toplamTaksitGirdisi, satisForm.doviz)}), kalan bakiyeye (${formatPara(kalanRaw, satisForm.doviz)}) eşit olmalıdır!`);
      }
    }

    setSaving(true);
    try {
      const satinalanKisi = kisiler.find(k => k.id === satisForm.kisi_id)?.ad || "Bilinmeyen Kişi";
      const ozelPlanNotu = satisForm.ozelTaksit ? " (Özel Plan)" : "";
      
      const emlakciAd = satisForm.komisyonVar ? (kisiler.find(k => k.id === satisForm.emlakci_id)?.ad || "Bilinmeyen Emlakçı") : "";
      const kurNotu = satisForm.doviz !== "TRY" ? ` (Kur: ${kur} ₺)` : "";
      const komisyonNotu = satisForm.komisyonVar ? `\nEmlakçı Komisyonu: ${emlakciAd} - ${formatPara(komisyonRaw, satisForm.doviz)}` : "";

      const eklenecekNot = `\n-- SATIŞ BİLGİSİ --\nAlıcı: ${satinalanKisi}\nFiyat: ${formatPara(fiyatRaw, satisForm.doviz)}${kurNotu}\nPeşinat: ${formatPara(pesinatRaw, satisForm.doviz)}${taksitSayisi > 0 ? `\nTaksit: ${taksitSayisi} Ay${ozelPlanNotu}` : ""}${komisyonNotu}`;
      
      await updateDaire(seciliDaire.id, {
        durum: "satildi",
        fiyat: fiyatTL, 
        notlar: (seciliDaire.notlar || "") + eklenecekNot,
        alici_id: satisForm.kisi_id,
      });

      const daireIsim = `${seciliDaire.blok ? seciliDaire.blok + ' Blok ' : ''}Daire ${seciliDaire.daire_no}`;
      const islemTarihi = satisForm.baslangicTarihi;

      if (satisForm.komisyonVar && komisyonRaw > 0) {
         await addIslem({
            id: crypto.randomUUID(),
            proje_id: projeId,
            kisi_id: satisForm.emlakci_id,
            tip: "odenecek", 
            tutar_raw: komisyonRaw,
            tutar: komisyonTL,
            doviz: satisForm.doviz,
            is_bitiminde: null,
            tarih: islemTarihi,
            aciklama: `${daireIsim} Satış Komisyonu (Alıcı: ${satinalanKisi})`
         });
      }

      if (pesinatRaw > 0) {
        await addIslem({
          id: crypto.randomUUID(),
          proje_id: projeId,
          kisi_id: satisForm.kisi_id,
          tip: "alacak",
          tutar_raw: pesinatRaw,
          tutar: pesinatTL,
          doviz: satisForm.doviz,
          is_bitiminde: null,
          tarih: islemTarihi,
          aciklama: `${daireIsim} Satışı (Peşinat Bedeli)`
        });
        await addIslem({
          id: crypto.randomUUID(),
          proje_id: projeId,
          kisi_id: satisForm.kisi_id,
          tip: "tahsilat",
          tutar_raw: pesinatRaw,
          tutar: pesinatTL,
          doviz: satisForm.doviz,
          is_bitiminde: null,
          tarih: islemTarihi,
          aciklama: `${daireIsim} Peşinat Ödemesi`
        });
      }

      if (kalanRaw > 0) {
        if (taksitSayisi > 0) {
          if (satisForm.ozelTaksit) {
            for (let i = 0; i < taksitSayisi; i++) {
              const tk = satisForm.taksitler[i];
              const tkTutarRaw = parseFloat(tk.tutar);
              const tkTutarTL = Number((tkTutarRaw * kur).toFixed(2));
              
              await addIslem({
                id: crypto.randomUUID(),
                proje_id: projeId,
                kisi_id: satisForm.kisi_id,
                tip: "alacak",
                tutar_raw: tkTutarRaw,
                tutar: tkTutarTL,
                doviz: satisForm.doviz,
                is_bitiminde: null,
                tarih: tk.tarih,
                aciklama: `${daireIsim} Taksit Ödemesi (${i + 1}/${taksitSayisi})`
              });
            }
          } else {
            const taksitTutariRaw = kalanRaw / taksitSayisi;
            const taksitTutariTL = Number((taksitTutariRaw * kur).toFixed(2));
            let currentDate = new Date(satisForm.baslangicTarihi);

            for (let i = 1; i <= taksitSayisi; i++) {
              await addIslem({
                id: crypto.randomUUID(),
                proje_id: projeId,
                kisi_id: satisForm.kisi_id,
                tip: "alacak",
                tutar_raw: Number(taksitTutariRaw.toFixed(2)),
                tutar: taksitTutariTL,
                doviz: satisForm.doviz,
                is_bitiminde: null,
                tarih: currentDate.toISOString().slice(0, 10),
                aciklama: `${daireIsim} Taksit Ödemesi (${i}/${taksitSayisi})`
              });
              currentDate.setMonth(currentDate.getMonth() + 1);
            }
          }
        } else {
          await addIslem({
            id: crypto.randomUUID(),
            proje_id: projeId,
            kisi_id: satisForm.kisi_id,
            tip: "alacak",
            tutar_raw: kalanRaw,
            tutar: kalanTL,
            doviz: satisForm.doviz,
            is_bitiminde: null,
            tarih: satisForm.baslangicTarihi,
            aciklama: `${daireIsim} Satışı (Kalan Bakiye)`
          });
        }
      }

      setModal(null);
    } catch (e: any) { alert("Satış işlemi sırasında bir hata oluştu: " + e.message); }
    finally { setSaving(false); }
  };

  const sil = async (id: string) => {
    try { await removeDaire(id); setSilOnay(null); }
    catch (e: any) { alert("Hata: " + e.message); }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(["hepsi", "musait", "rezerve", "satildi", "arsa_sahibi"] as const).map((d) => {
            const isAll = d === "hepsi";
            const cfg = isAll ? null : DURUM_CONFIG[d];
            const count = isAll ? projeDaireler.length : durumOzet[d];
            return (
              <button
                key={d}
                onClick={() => setFilterDurum(d)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider border transition-colors ${filterDurum === d ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"}`}
              >
                {cfg && <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></div>}
                {isAll ? "TÜMÜ" : cfg!.label.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGorunum("tablo")} className={`p-2 border transition-colors ${gorunum === "tablo" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"}`}><List size={16} /></button>
          <button onClick={() => setGorunum("grid")} className={`p-2 border transition-colors ${gorunum === "grid" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"}`}><Grid3X3 size={16} /></button>
          <button onClick={() => acModal("toplu")} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-xs font-bold tracking-wider hover:border-neutral-900 transition-colors">
            <Layers size={14} /> TOPLU EKLE
          </button>
          <button onClick={() => acModal("ekle")} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold tracking-wider hover:bg-neutral-800 transition-colors">
            <Plus size={14} /> DAİRE EKLE
          </button>
        </div>
      </div>

      {filtrelenmis.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-16 text-center">
          <Home size={32} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Daire bulunamadı.</p>
        </div>
      ) : gorunum === "tablo" ? (
        <div className="bg-white border border-neutral-200 overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-neutral-50 border-b border-neutral-100 text-xs text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Blok</th>
                <th className="px-5 py-3">Daire No</th>
                <th className="px-5 py-3">Kat</th>
                <th className="px-5 py-3">m²</th>
                <th className="px-5 py-3">Tip</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Müşteri / Tapu</th>
                <th className="px-5 py-3 text-right">Fiyat</th>
                <th className="px-5 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtrelenmis.map((d) => {
                const cfg = DURUM_CONFIG[d.durum];
                const detay = getSatisDetay(d);

                return (
                  <tr key={d.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-5 py-3 text-sm font-medium text-neutral-700">{d.blok || "-"}</td>
                    <td className="px-5 py-3 text-sm font-bold text-neutral-900">{d.daire_no}</td>
                    <td className="px-5 py-3 text-sm text-neutral-600">{d.kat ?? "-"}</td>
                    <td className="px-5 py-3 text-sm text-neutral-600">{d.metrekare ? `${d.metrekare} m²` : "-"}</td>
                    <td className="px-5 py-3 text-sm text-neutral-600">{d.tip || "-"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider border ${cfg.bg} ${cfg.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></div>
                        {cfg.label.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {detay ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-neutral-900 truncate max-w-[140px]" title={detay.aliciAd}>{detay.aliciAd}</span>
                          {detay.tapu ? (
                            <span className="text-[10px] text-green-600 flex items-center gap-1"><FileCheck size={10} /> Verildi</span>
                          ) : (
                            <span className="text-[10px] text-yellow-600 flex items-center gap-1"><AlertCircle size={10} /> Bekliyor</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-neutral-700">
                       {detay?.satisFiyati ? detay.satisFiyati : (d.fiyat ? formatCurrency(d.fiyat) : "-")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.durum !== 'satildi' && d.durum !== 'arsa_sahibi' && (
                          <button onClick={() => acSatis(d)} className="p-1.5 hover:bg-green-50 text-neutral-400 hover:text-green-600 transition-colors" title="Satış Yap"><CheckCircle2 size={15} /></button>
                        )}
                        {d.durum === 'satildi' && (
                          <>
                            <button onClick={() => acInfo(d)} className="p-1.5 hover:bg-blue-50 text-neutral-400 hover:text-blue-600 transition-colors" title="Satış Detayları"><Info size={15} /></button>
                            <button onClick={() => acTapu(d)} className="p-1.5 hover:bg-purple-50 text-neutral-400 hover:text-purple-600 transition-colors" title="Tapu Durumu"><FileCheck size={15} /></button>
                          </>
                        )}
                        <button onClick={() => acDuzenle(d)} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors" title="Düzenle"><Pencil size={13} /></button>
                        <button onClick={() => setSilOnay(d.id)} className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors" title="Sil"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtrelenmis.map((d) => {
            const cfg = DURUM_CONFIG[d.durum];
            const detay = getSatisDetay(d);

            return (
              <div key={d.id} className={`group relative border p-4 hover:shadow-md transition-shadow flex flex-col justify-between ${cfg.bg} min-h-[140px]`}>
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold text-neutral-900">{d.daire_no}</div>
                      {d.blok && <div className="text-xs text-neutral-500">Blok {d.blok}</div>}
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 ${cfg.dot}`}></div>
                  </div>
                  <div className="space-y-1">
                    {d.tip && <div className="text-xs text-neutral-600">{d.tip}</div>}
                    {d.metrekare && <div className="text-xs text-neutral-500">{d.metrekare} m²</div>}
                    {d.kat !== null && <div className="text-xs text-neutral-500">{d.kat}. Kat</div>}
                  </div>
                  <div className="mt-3">
                    <span className={`text-[9px] font-bold tracking-wider uppercase ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>

                {detay && (
                  <div className="mt-4 pt-3 border-t border-neutral-200/50">
                    <div className="text-xs font-medium text-neutral-800 truncate" title={detay.aliciAd}>{detay.aliciAd}</div>
                    <div className="mt-1">
                      {detay.tapu ? (
                        <span className="text-[10px] text-green-700 flex items-center gap-1"><FileCheck size={10} /> Tapu Verildi</span>
                      ) : (
                        <span className="text-[10px] text-yellow-700 flex items-center gap-1"><AlertCircle size={10} /> Tapu Bekliyor</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.durum !== 'satildi' && d.durum !== 'arsa_sahibi' && (
                    <button onClick={() => acSatis(d)} className="p-1 bg-white/80 hover:bg-green-50 text-neutral-600 hover:text-green-600 shadow-sm" title="Satış Yap"><CheckCircle2 size={11} /></button>
                  )}
                  {d.durum === 'satildi' && (
                    <>
                      <button onClick={() => acInfo(d)} className="p-1 bg-white/80 hover:bg-blue-50 text-neutral-600 hover:text-blue-600 shadow-sm" title="Satış Detayları"><Info size={11} /></button>
                      <button onClick={() => acTapu(d)} className="p-1 bg-white/80 hover:bg-purple-50 text-neutral-600 hover:text-purple-600 shadow-sm" title="Tapu Durumu"><FileCheck size={11} /></button>
                    </>
                  )}
                  <button onClick={() => acDuzenle(d)} className="p-1 bg-white/80 hover:bg-white text-neutral-600 shadow-sm"><Pencil size={11} /></button>
                  <button onClick={() => setSilOnay(d.id)} className="p-1 bg-white/80 hover:bg-red-50 text-neutral-600 hover:text-red-600 shadow-sm"><Trash2 size={11} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal === "tapu" && seciliDaire && (
        <Modal title={`Tapu Durumu: ${seciliDaire.blok ? seciliDaire.blok + ' Blok ' : ''}Daire ${seciliDaire.daire_no}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
             <div>
                <FieldLabel>Tapu Veriliş Tarihi</FieldLabel>
                <TextInput type="date" value={tapuTarihi} onChange={setTapuTarihi} />
             </div>
             <p className="text-xs text-neutral-500 italic">* Tapuyu verdiğinizi onaylamak ve sistemi güncellemek için tarih seçip kaydedin. İptal etmek için tarihi boş bırakarak kaydedin.</p>
             <div className="flex gap-3 pt-2">
               <button onClick={() => setModal(null)} className="flex-1 h-11 border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition-colors">İptal</button>
               <button onClick={kaydetTapu} disabled={saving} className="flex-1 h-11 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                 <FileCheck size={16} /> {saving ? "Kaydediliyor..." : "Tapuyu Onayla"}
               </button>
             </div>
          </div>
        </Modal>
      )}

      {modal === "info" && seciliDaire && (
        <Modal title={`Satış Detayları: ${seciliDaire.blok ? seciliDaire.blok + ' Blok ' : ''}Daire ${seciliDaire.daire_no}`} onClose={() => setModal(null)}>
          <div className="space-y-6">
            {(() => {
              const detay = getSatisDetay(seciliDaire);
              const daireIsim = `${seciliDaire.blok ? seciliDaire.blok + ' Blok ' : ''}Daire ${seciliDaire.daire_no}`;
              const ilgiliIslemler = islemler.filter(i => i.proje_id === projeId && i.aciklama?.includes(daireIsim));
              const taksitler = ilgiliIslemler.filter(i => i.tip === 'alacak' && i.aciklama?.includes('Taksit')).sort((a, b) => (a.tarih || "").localeCompare(b.tarih || ""));
              
              let aliciId = seciliDaire.alici_id;
              if (!aliciId && detay?.aliciAd) {
                  aliciId = kisiler.find(k => k.ad === detay.aliciAd)?.id;
              }
              
              let dovizBakiye: Record<string, number> = {};
              if (aliciId) {
                  const kisiProjeIslemleri = islemler.filter(i => i.kisi_id === aliciId && i.proje_id === projeId);
                  kisiProjeIslemleri.forEach(h => {
                      const dvz = h.doviz || "TRY";
                      const miktar = Number(h.tutar_raw || h.tutar || 0);
                      if (!dovizBakiye[dvz]) dovizBakiye[dvz] = 0;

                      if (h.tip === "alacak") dovizBakiye[dvz] += miktar;
                      else if (h.tip === "tahsilat") dovizBakiye[dvz] -= miktar;
                      else if (h.tip === "odenecek") dovizBakiye[dvz] -= miktar;
                      else if (h.tip === "odeme" || h.tip === "cek") dovizBakiye[dvz] += miktar;
                  });
              }
              const bakiyeListesi = Object.entries(dovizBakiye).filter(([_, miktar]) => Math.abs(miktar) > 0.01);

              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 border border-neutral-200 p-3">
                       <span className="block text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">MÜŞTERİ / ALICI</span>
                       <span className="text-sm font-medium text-neutral-900">{detay?.aliciAd}</span>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-3">
                       <span className="block text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">SATIŞ FİYATI</span>
                       <span className="text-sm font-medium text-neutral-900">
                         {detay?.satisFiyati ? detay.satisFiyati : formatCurrency(seciliDaire.fiyat)}
                       </span>
                    </div>
                  </div>

                  <div className={`p-4 border ${detay?.tapu ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                     <span className="block text-[10px] font-bold text-neutral-500 tracking-wider uppercase mb-1">TAPU DURUMU</span>
                     <div className="flex items-center gap-2">
                        {detay?.tapu ? (
                           <><FileCheck size={18} className="text-green-600" /> <span className="text-green-800 font-medium">{formatDate(detay.tapu)} (Verildi)</span></>
                        ) : (
                           <><AlertCircle size={18} className="text-yellow-600" /> <span className="text-yellow-800 font-medium">Henüz Verilmedi</span></>
                        )}
                     </div>
                  </div>

                  {seciliDaire.notlar && seciliDaire.notlar.trim() !== "" && (
                  <div>
                     <span className="block text-xs font-bold text-neutral-400 tracking-wider uppercase mb-3">SİSTEM NOTLARI & AÇIKLAMALAR</span>
                     <div className="p-4 bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                        {seciliDaire.notlar.trim()}
                     </div>
                  </div>
                  )}

                  <div>
                     <span className="block text-xs font-bold text-neutral-400 tracking-wider uppercase mb-3">TAKSİT PLANI & BAKİYE DURUMU</span>
                     {taksitler.length === 0 ? (
                        <div className="p-6 bg-neutral-50 border border-neutral-200 text-center flex flex-col items-center justify-center">
                            <span className="text-sm text-neutral-500 mb-4">Bu satış işlemi için özel bir taksit planı bulunmuyor.</span>
                        </div>
                     ) : (
                        <div className="border border-neutral-200 divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                           {taksitler.map((t, idx) => (
                              <div key={t.id} className="flex justify-between p-3 bg-white hover:bg-neutral-50 text-sm items-center">
                                 <span className="text-neutral-600">{idx + 1}. Taksit / {formatDate(t.tarih)}</span>
                                 <span className="font-medium text-neutral-900 text-right">
                                   {t.doviz && t.doviz !== "TRY" ? (
                                     <>
                                       {formatPara(Number(t.tutar_raw || t.tutar), t.doviz)}
                                       <span className="text-neutral-400 ml-2 text-xs">({formatCurrency(t.tutar)})</span>
                                     </>
                                   ) : (
                                     formatCurrency(t.tutar)
                                   )}
                                 </span>
                              </div>
                           ))}
                        </div>
                     )}

                     {bakiyeListesi.length === 0 ? (
                        <div className="text-xs font-medium text-green-600 bg-green-50 px-4 py-3 mt-4 text-center rounded border border-green-200">
                            Müşterinin bu şantiyede herhangi bir borcu veya alacağı bulunmamaktadır.
                        </div>
                     ) : (
                        <div className="flex flex-col gap-2 mt-4 items-center">
                            {bakiyeListesi.map(([dvz, miktar]) => (
                                miktar > 0 ? (
                                    <div key={dvz} className="bg-white border border-red-200 px-6 py-4 shadow-sm w-full">
                                        <span className="block text-[10px] font-bold text-red-400 tracking-wider uppercase mb-1">MÜŞTERİNİN ŞU ANKİ BORCU ({DOVIZ_SEMBOL[dvz] || dvz})</span>
                                        <span className="text-2xl font-light text-red-600">{formatPara(miktar, dvz)}</span>
                                    </div>
                                ) : (
                                    <div key={dvz} className="bg-white border border-green-200 px-6 py-4 shadow-sm w-full">
                                        <span className="block text-[10px] font-bold text-green-500 tracking-wider uppercase mb-1">MÜŞTERİNİN ALACAĞI ({DOVIZ_SEMBOL[dvz] || dvz})</span>
                                        <span className="text-2xl font-light text-green-600">{formatPara(Math.abs(miktar), dvz)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                     )}
                  </div>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      {modal === "satis" && seciliDaire && (
        <Modal title={`Satış İşlemi: ${seciliDaire.blok ? seciliDaire.blok + ' Blok ' : ''}Daire ${seciliDaire.daire_no}`} onClose={() => setModal(null)}>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-700 leading-relaxed">
              Bu ekran üzerinden yapılan satış, <strong>Cari Hesaplar</strong> tablosuna otomatik işlenir. Peşinat tutarı "Tahsilat" olarak, taksitler ise gelecek tarihli "Alacak" olarak kaydedilir. Dövizli işlemlerde arka planda orijinal döviz tutarı da korunur.
            </div>

            <div>
              <CustomSelect
                label="MÜŞTERİ / ALICI *"
                value={satisForm.kisi_id}
                onChange={(v) => setSatisForm({ ...satisForm, kisi_id: v })}
                options={kisiOptions}
                placeholder={kisiOptions.length === 0 ? "Bu şantiyede müşteri bulunmuyor!" : "Listeden alıcı seçin..."}
                icon={User}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <CustomSelect 
                  label="DÖVİZ TİPİ *" 
                  value={satisForm.doviz} 
                  onChange={(v) => setSatisForm({ ...satisForm, doviz: v as any, kur: v === "TRY" ? "1" : satisForm.kur })} 
                  options={DOVIZ_OPTIONS} 
                  icon={DollarSign}
                />
              </div>
              <div>
                <FieldLabel>Güncel Kur (1 {satisForm.doviz} = ? TL) {satisForm.doviz !== 'TRY' && '*'}</FieldLabel>
                <TextInput 
                  type="number" 
                  value={satisForm.kur} 
                  onChange={(v) => setSatisForm({ ...satisForm, kur: v })} 
                  disabled={satisForm.doviz === "TRY"} 
                  placeholder="Örn: 34.50" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Toplam Satış Fiyatı ({DOVIZ_SEMBOL[satisForm.doviz] || satisForm.doviz}) *</FieldLabel>
                <TextInput type="number" value={satisForm.fiyat} onChange={(v) => setSatisForm({ ...satisForm, fiyat: v })} placeholder={`Örn: 100000`} />
              </div>
              <div>
                <FieldLabel>Alınan Peşinat ({DOVIZ_SEMBOL[satisForm.doviz] || satisForm.doviz})</FieldLabel>
                <TextInput type="number" value={satisForm.pesinat} onChange={(v) => setSatisForm({ ...satisForm, pesinat: v })} placeholder="Yoksa boş bırakın" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Taksit Sayısı (Ay)</FieldLabel>
                <TextInput 
                  type="number" 
                  value={satisForm.taksitSayisi} 
                  onChange={(v) => {
                    const sayi = parseInt(v) || 0;
                    setSatisForm(prev => {
                      let nt = [...prev.taksitler];
                      if (prev.ozelTaksit) {
                        if (sayi > nt.length) {
                          for(let i = nt.length; i < sayi; i++) nt.push({tarih: "", tutar: ""});
                        } else {
                          nt = nt.slice(0, sayi);
                        }
                      }
                      return { ...prev, taksitSayisi: v, taksitler: nt };
                    });
                  }} 
                  placeholder="Peşin satış için boş bırakın" 
                />
              </div>
              <div>
                <FieldLabel>Satış / İşlem Tarihi</FieldLabel>
                <TextInput type="date" value={satisForm.baslangicTarihi} onChange={(v) => setSatisForm({ ...satisForm, baslangicTarihi: v })} />
              </div>
            </div>

            {parseInt(satisForm.taksitSayisi) > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-2 border border-neutral-200 p-3 bg-neutral-50 rounded">
                  <input
                    type="checkbox"
                    id="ozel_taksit"
                    className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                    checked={satisForm.ozelTaksit}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const sayi = parseInt(satisForm.taksitSayisi) || 0;
                      const kalan = (parseFloat(satisForm.fiyat) || 0) - (parseFloat(satisForm.pesinat) || 0);
                      
                      let yeniTaksitler = [...satisForm.taksitler];
                      
                      if (checked && sayi > 0) {
                        const taksitTutari = (kalan / sayi).toFixed(2);
                        let currentDate = new Date(satisForm.baslangicTarihi || new Date().toISOString().slice(0, 10));
                        yeniTaksitler = [];
                        
                        for (let i = 0; i < sayi; i++) {
                          yeniTaksitler.push({
                            tarih: currentDate.toISOString().slice(0, 10),
                            tutar: i === sayi - 1 ? (kalan - (parseFloat(taksitTutari) * (sayi - 1))).toFixed(2) : taksitTutari
                          });
                          currentDate.setMonth(currentDate.getMonth() + 1);
                        }
                      }
                      
                      setSatisForm({ ...satisForm, ozelTaksit: checked, taksitler: yeniTaksitler });
                    }}
                  />
                  <label htmlFor="ozel_taksit" className="text-sm font-medium text-neutral-700 cursor-pointer select-none">
                    Taksit günlerini ve tutarlarını kendim belirleyeceğim
                  </label>
                </div>

                {satisForm.ozelTaksit && (
                  <div className="bg-white p-4 border border-neutral-200 rounded max-h-64 overflow-y-auto space-y-4">
                    {satisForm.taksitler.map((t, idx) => (
                      <div key={idx} className="flex gap-4 items-end bg-neutral-50 p-3 border border-neutral-100">
                        <div className="flex-1">
                          <FieldLabel>{idx + 1}. Taksit Tarihi</FieldLabel>
                          <TextInput type="date" value={t.tarih} onChange={(val) => { const nt = [...satisForm.taksitler]; nt[idx].tarih = val; setSatisForm({ ...satisForm, taksitler: nt }); }} />
                        </div>
                        <div className="flex-1">
                          <FieldLabel>Tutar ({DOVIZ_SEMBOL[satisForm.doviz] || satisForm.doviz})</FieldLabel>
                          <TextInput type="number" value={t.tutar} onChange={(val) => { const nt = [...satisForm.taksitler]; nt[idx].tutar = val; setSatisForm({ ...satisForm, taksitler: nt }); }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2 border border-neutral-200 p-3 bg-neutral-50 rounded">
                <input
                  type="checkbox"
                  id="komisyon_var"
                  className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                  checked={satisForm.komisyonVar}
                  onChange={(e) => setSatisForm({ ...satisForm, komisyonVar: e.target.checked })}
                />
                <label htmlFor="komisyon_var" className="text-sm font-medium text-neutral-700 cursor-pointer select-none">
                  Bu satışta emlakçı komisyonu var
                </label>
              </div>

              {satisForm.komisyonVar && (
                <div className="grid grid-cols-2 gap-4 p-4 border border-blue-100 bg-blue-50/50 rounded animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <CustomSelect
                      label="EMLAKÇI *"
                      value={satisForm.emlakci_id}
                      onChange={(v) => setSatisForm({ ...satisForm, emlakci_id: v })}
                      options={emlakciOptions}
                      placeholder={emlakciOptions.length === 0 ? "Şantiyeye bağlı emlakçı yok!" : "Emlakçı seçin..."}
                      icon={User}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">KOMİSYON TUTARI ({DOVIZ_SEMBOL[satisForm.doviz] || satisForm.doviz}) *</label>
                    <input
                      type="number"
                      value={satisForm.komisyonTutari}
                      onChange={(e) => setSatisForm({ ...satisForm, komisyonTutari: e.target.value })}
                      placeholder="Örn: 5000"
                      className="w-full h-14 px-4 bg-white border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {parseFloat(satisForm.fiyat) > 0 && (
              <div className="bg-neutral-50 p-4 border border-neutral-200 mt-2">
                <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-2">Ödeme Planı Özeti</div>
                
                {(() => {
                  const kur = satisForm.doviz === "TRY" ? 1 : (parseFloat(satisForm.kur) || 1);
                  const fRaw = parseFloat(satisForm.fiyat) || 0;
                  const komRaw = satisForm.komisyonVar ? (parseFloat(satisForm.komisyonTutari) || 0) : 0;
                  const netSirketRaw = fRaw - komRaw;
                  const pesinatRaw = parseFloat(satisForm.pesinat) || 0;
                  const kalanRaw = fRaw - pesinatRaw;

                  return (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Toplam Satış Tutarı:</span>
                        <div className="text-right">
                           <span className="font-bold">{formatPara(fRaw, satisForm.doviz)}</span>
                           {satisForm.doviz !== "TRY" && <span className="text-xs text-neutral-400 ml-2 block">({formatCurrency(fRaw * kur)})</span>}
                        </div>
                      </div>
                      
                      {satisForm.komisyonVar && komRaw > 0 && (
                        <div className="flex justify-between text-sm mb-1 text-red-600">
                          <span>Emlakçı Komisyonu (-):</span>
                          <div className="text-right">
                             <span className="font-bold">{formatPara(komRaw, satisForm.doviz)}</span>
                             {satisForm.doviz !== "TRY" && <span className="text-xs text-red-400/70 ml-2 block">({formatCurrency(komRaw * kur)})</span>}
                          </div>
                        </div>
                      )}

                      {satisForm.komisyonVar && komRaw > 0 && (
                        <div className="flex justify-between text-sm mb-2 pb-2 border-b border-neutral-200 text-blue-700">
                          <span>Şirkete Girecek Net Tutar:</span>
                          <div className="text-right">
                             <span className="font-bold">{formatPara(netSirketRaw, satisForm.doviz)}</span>
                             {satisForm.doviz !== "TRY" && <span className="text-xs text-blue-400/70 ml-2 block">({formatCurrency(netSirketRaw * kur)})</span>}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between text-sm mb-1 text-green-700 mt-3">
                        <span>Peşin Alınan (Müşteriden):</span>
                        <span className="font-medium">{formatPara(pesinatRaw, satisForm.doviz)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm border-t border-neutral-200 pt-1 mt-1 font-bold">
                        <span>Müşterinin Kalan Bakiyesi:</span>
                        <span>{formatPara(kalanRaw, satisForm.doviz)}</span>
                      </div>
                      
                      {(parseInt(satisForm.taksitSayisi) || 0) > 0 && !satisForm.ozelTaksit && (
                        <div className="text-xs text-neutral-500 mt-2 italic text-right">
                          Kalan bakiye {satisForm.taksitSayisi} ay boyunca eşit olarak (Aylık {formatPara(kalanRaw / parseInt(satisForm.taksitSayisi), satisForm.doviz)}) cari hesaba tahakkuk edilecektir.
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 h-11 border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition-colors">İptal</button>
              <button onClick={satisYap} disabled={saving} className="flex-1 h-11 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> {saving ? "İşleniyor..." : "Satışı Onayla"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {(modal === "ekle" || modal === "duzenle") && (
        <Modal title={modal === "ekle" ? "Daire Ekle" : "Daireyi Düzenle"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Blok</FieldLabel>
                <TextInput value={form.blok || ""} onChange={(v) => setForm({ ...form, blok: v })} placeholder="A, B, C..." />
              </div>
              <div>
                <FieldLabel>Daire No *</FieldLabel>
                <TextInput value={form.daire_no} onChange={(v) => setForm({ ...form, daire_no: v })} placeholder="1, 2, 101..." />
              </div>
              <div>
                <FieldLabel>Kat</FieldLabel>
                <TextInput type="number" value={form.kat?.toString() || ""} onChange={(v) => setForm({ ...form, kat: v ? parseInt(v) : null })} placeholder="0, 1, 2..." />
              </div>
              <div>
                <FieldLabel>m²</FieldLabel>
                <TextInput type="number" value={form.metrekare?.toString() || ""} onChange={(v) => setForm({ ...form, metrekare: v ? parseFloat(v) : null })} placeholder="85" />
              </div>
              <div>
                <FieldLabel>Tip</FieldLabel>
                <TextInput value={form.tip || ""} onChange={(v) => setForm({ ...form, tip: v })} placeholder="1+1, 2+1, 3+1..." />
              </div>
              <div>
                <FieldLabel>Fiyat (₺)</FieldLabel>
                <TextInput type="number" value={form.fiyat?.toString() || ""} onChange={(v) => setForm({ ...form, fiyat: v ? parseFloat(v) : null })} placeholder="2500000" disabled={modal === "duzenle" && form.durum === 'satildi'} />
              </div>
            </div>
            <div>
              <CustomSelect
                label="DURUM"
                value={form.durum}
                onChange={(v) => setForm({ ...form, durum: v as Daire["durum"] })}
                options={Object.entries(DURUM_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="arsa_payi" checked={form.arsa_sahibi_payi} onChange={(e) => setForm({ ...form, arsa_sahibi_payi: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="arsa_payi" className="text-sm text-neutral-700">Arsa sahibi payına dahil</label>
            </div>
            <div>
              <FieldLabel>Notlar</FieldLabel>
              <textarea value={form.notlar || ""} onChange={(e) => setForm({ ...form, notlar: e.target.value })} rows={3} className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 outline-none focus:border-neutral-900 font-light resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 h-11 border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition-colors">İptal</button>
              <button onClick={kaydet} disabled={saving} className="flex-1 h-11 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "toplu" && (
        <Modal title="Toplu Daire Oluştur" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-xs text-neutral-500">Belirlediğiniz aralıkta daireleri otomatik oluşturur.</p>
            <div>
              <FieldLabel>Blok Adı</FieldLabel>
              <TextInput value={topluBlok} onChange={setTopluBlok} placeholder="A, B, C..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Başlangıç No</FieldLabel>
                <TextInput type="number" value={String(topluBaslangic)} onChange={(v) => setTopluBaslangic(parseInt(v) || 1)} />
              </div>
              <div>
                <FieldLabel>Bitiş No</FieldLabel>
                <TextInput type="number" value={String(topluBitis)} onChange={(v) => setTopluBitis(parseInt(v) || 1)} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <FieldLabel>Kat (Tümü İçin)</FieldLabel>
                <TextInput type="number" value={topluKat?.toString() || ""} onChange={(v) => setTopluKat(v ? parseInt(v) : null)} placeholder="Opsiyonel" />
              </div>
              <div className="col-span-1">
                <FieldLabel>m²</FieldLabel>
                <TextInput type="number" value={topluMetrekare?.toString() || ""} onChange={(v) => setTopluMetrekare(v ? parseFloat(v) : null)} placeholder="Opsiyonel" />
              </div>
              <div className="col-span-1">
                <FieldLabel>Fiyat (₺)</FieldLabel>
                <TextInput type="number" value={topluFiyat?.toString() || ""} onChange={(v) => setTopluFiyat(v ? parseFloat(v) : null)} placeholder="Opsiyonel" />
              </div>
            </div>

            <div>
              <FieldLabel>Daire Tipi</FieldLabel>
              <TextInput value={topluTip} onChange={setTopluTip} placeholder="2+1" />
            </div>
            <div>
              <CustomSelect
                label="DURUM"
                value={topluDurum}
                onChange={(v) => setTopluDurum(v as Daire["durum"])}
                options={Object.entries(DURUM_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
              />
            </div>
            <div className="bg-neutral-50 border border-neutral-200 p-3 text-xs text-neutral-600">
              <strong>{Math.max(0, topluBitis - topluBaslangic + 1)} adet</strong> daire oluşturulacak:
              {topluBlok && ` Blok ${topluBlok},`} {topluBaslangic}–{topluBitis} arası
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 h-11 border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition-colors">İptal</button>
              <button onClick={topluEkle} disabled={saving} className="flex-1 h-11 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60">
                {saving ? "Oluşturuluyor..." : "Oluştur"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {silOnay && (
        <Modal title="Daireyi Sil" onClose={() => setSilOnay(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">Bu daireyi silmek istediğinizden emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setSilOnay(null)} className="flex-1 h-11 border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50">İptal</button>
              <button onClick={() => sil(silOnay)} className="flex-1 h-11 bg-red-600 text-white text-sm font-medium hover:bg-red-700">Sil</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}