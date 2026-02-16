import { useMemo, useState, useRef, useEffect } from "react";
// FIX: Kullanılmayan 'Info' importu kaldırıldı.
import { ArrowRightLeft, Calendar, CreditCard, User, FileText, Check, X, AlertTriangle, Save, RefreshCw, Building2, CheckCircle } from "lucide-react";
import { CustomSelect } from "../components/CustomSelect";
import { useData, type Islem } from "../context/DataContext";

// --- YARDIMCI FONKSİYONLAR ---

// GÜVENLİK FIX: Telefondan (HTTP) girildiğinde crypto.randomUUID() çalışmaz.
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const toAmount = (val: any) =>
  parseFloat(String(val).replace(/\./g, "").replace(",", ".")) || 0;

const formatTR = (val: any) =>
  toAmount(val).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDateDisplay = (dateStr: string | null) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

const ISLEM_TIP_OPTIONS = [
  { value: "tahsilat", label: "Tahsilat (+)" },
  { value: "odeme", label: "Ödeme (-)" },
  { value: "cek", label: "Çek Çıkışı (Vadeli)" },
  { value: "odenecek", label: "Ödenecek (Borç)" },
  { value: "alacak", label: "Alacak" },
];

const DOVIZ_OPTIONS = [
  { value: "TRY", label: "TL" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "ALTIN", label: "ALTIN" },
];

const INITIAL_FORM = {
  id: "",
  tarih: "",
  tip: "",
  tutar: "",
  kisi_id: "",
  proje_id: "",
  aciklama: "",
  is_bitiminde: false,
  doviz: "TRY",
};

export default function IslemlerDemo() {
  const { kisiler, islemler, projeler, addIslem, updateIslem, removeIslem } = useData();

  const [form, setForm] = useState<any>(INITIAL_FORM);
  const [editForm, setEditForm] = useState<any>(null);
  const [query, setQuery] = useState("");
  
  // Modallar için State'ler
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [checkModal, setCheckModal] = useState<{ item: Islem; newStatus: number; message: string } | null>(null);

  // Autocomplete (Öneri) State'leri
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("İşlem başarıyla tamamlandı.");

  // Dışarı tıklandığında öneri listesini kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tüm benzersiz açıklamaları hafızaya al
  const uniqueDescriptions = useMemo(() => {
    const allDescs = islemler
      .map(i => i.aciklama)
      .filter((desc): desc is string => typeof desc === 'string' && desc.trim().length > 0);
      
    // Set ile mükerrer kayıtları temizle ve diziye çevir
    return Array.from(new Set(allDescs));
  }, [islemler]);

  const getExchangeRate = (currency: string) => {
    if (currency === "USD") return 34.50;
    if (currency === "EUR") return 37.20;
    if (currency === "ALTIN") return 2950;
    return 1;
  };

  // --- AÇIKLAMA DEĞİŞİKLİĞİ VE ÖNERİ FİLTRELEME ---
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm({ ...form, aciklama: val });

    // 3 karakter ve üzeri ise öneri yap
    if (val.length >= 3) {
      const lowerVal = val.toLocaleLowerCase('tr-TR');
      
      const matches = uniqueDescriptions.filter(desc => 
        desc.toLocaleLowerCase('tr-TR').startsWith(lowerVal)
      );
      
      if (matches.length > 0) {
        setSuggestions(matches.slice(0, 5)); // En fazla 5 öneri göster
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Öneri seçildiğinde
  const handleSuggestionClick = (desc: string) => {
    setForm({ ...form, aciklama: desc });
    setShowSuggestions(false);
  };

  // --- KAYIT EKLEME ---
  const saveCreate = async () => {
    try {
      if (!form.kisi_id || !form.tip || !form.tutar) return alert("Eksik bilgi: Kişi, Tip ve Tutar zorunludur.");
      if (!form.proje_id) return alert("Lütfen şantiye seçiniz.");

      setIsSubmitting(true);

      const amountRaw = toAmount(form.tutar);
      const amountTL = amountRaw * getExchangeRate(form.doviz);

      if (form.tip === "cek" && !form.tarih) {
        setIsSubmitting(false);
        return alert("Çek işlemlerinde Vade Tarihi zorunludur.");
      }

      const newRow: Islem = {
        id: generateUUID(),
        tarih: form.is_bitiminde && form.tip !== 'cek' ? null : form.tarih,
        tutar: amountTL,
        tutar_raw: amountRaw,
        tip: form.tip,
        is_bitiminde: form.tip === 'cek' ? 0 : (form.is_bitiminde ? 1 : 0),
        kisi_id: form.kisi_id,
        proje_id: form.proje_id,
        aciklama: form.aciklama,
        doviz: form.doviz as any,
      };

      await new Promise(resolve => setTimeout(resolve, 300));

      await addIslem(newRow);
      
      setForm({ ...INITIAL_FORM }); 
      setSuggestions([]); // Önerileri temizle
      setShowSuggestions(false);
      
      setSuccessMessage("Yeni işlem başarıyla eklendi.");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("İşlem kaydedilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DÜZENLEME ---
  const startEdit = (r: Islem) => {
    setEditForm({
      ...r,
      tarih: r.tarih || "",
      tutar: formatTR(r.tutar_raw),
      is_bitiminde: r.is_bitiminde === 1,
      proje_id: r.proje_id || "" 
    });
  };

  const saveEdit = async () => {
    try {
      if (!editForm) return;
      if (!editForm.kisi_id || !editForm.tip || !editForm.tutar) return alert("Eksik bilgi");
      if (!editForm.proje_id) return alert("Lütfen şantiye seçiniz.");

      const amountRaw = toAmount(editForm.tutar);
      const amountTL = amountRaw * getExchangeRate(editForm.doviz);

      const updatedRow: Islem = {
        id: editForm.id,
        tarih: editForm.is_bitiminde && editForm.tip !== 'cek' ? null : editForm.tarih,
        tutar: amountTL,
        tutar_raw: amountRaw,
        tip: editForm.tip,
        is_bitiminde: editForm.is_bitiminde ? 1 : 0, 
        kisi_id: editForm.kisi_id,
        proje_id: editForm.proje_id, 
        aciklama: editForm.aciklama,
        doviz: editForm.doviz,
      };

      await updateIslem(updatedRow);
      setEditForm(null);

      setSuccessMessage("Kayıt başarıyla güncellendi.");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncelleme sırasında hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    }
  };

  // --- SİLME İŞLEMİ ---
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeIslem(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silme işlemi başarısız.");
    }
  };

  // --- ÇEK DURUMU DEĞİŞTİRME BAŞLANGIÇ (MODAL AÇAR) ---
  const toggleCheckStatus = (r: Islem) => {
    const newStatus = r.is_bitiminde === 1 ? 0 : 1;
    const message = newStatus === 1 
      ? "Bu çeki ÖDENDİ olarak işaretlemek istiyor musunuz? (Kasadan para çıkışı yapılacak)"
      : "Bu çeki BEKLİYOR durumuna almak istiyor musunuz?";
      
    setCheckModal({
      item: r,
      newStatus,
      message
    });
  };

  // --- ÇEK DURUMU ONAYLA (İŞLEMİ YAPAR) ---
  const confirmCheckToggle = async () => {
    if (!checkModal) return;
    try {
      await updateIslem({ ...checkModal.item, is_bitiminde: checkModal.newStatus });
      setCheckModal(null);
      setSuccessMessage("Çek durumu güncellendi.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Çek durumu güncelleme hatası:", error);
      alert("İşlem sırasında hata oluştu.");
    }
  };

  const filtered = useMemo(() => {
    const lowerQuery = query.toLocaleLowerCase('tr-TR');
    
    return islemler
      .filter((r) => {
        if (!query) return true;

        const kisi = kisiler.find(k => k.id === r.kisi_id);
        const proje = projeler.find(p => p.id === r.proje_id);
        
        const kisiAdi = kisi ? kisi.ad.toLocaleLowerCase('tr-TR') : "";
        const projeAdi = proje ? proje.ad.toLocaleLowerCase('tr-TR') : "";
        const aciklama = (r.aciklama || "").toLocaleLowerCase('tr-TR');
        const tip = (r.tip || "").toLocaleLowerCase('tr-TR');
    
        return (
          kisiAdi.includes(lowerQuery) ||
          projeAdi.includes(lowerQuery) ||
          aciklama.includes(lowerQuery) ||
          tip.includes(lowerQuery)
        );
      })
      .sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));
  }, [islemler, kisiler, projeler, query]);

  const kisiOptions = useMemo(
    () => 
      kisiler
        .map((k) => ({ value: k.id, label: k.ad }))
        .sort((a, b) => a.label.localeCompare(b.label, "tr")),
    [kisiler]
  );

  const projeOptions = useMemo(
    () => projeler.map(p => ({ value: p.id, label: p.ad })),
    [projeler]
  );

  const getTypeLabel = (tip: string, is_bitiminde: any) => {
    switch (tip) {
      case 'tahsilat': return "TAHSİLAT";
      case 'odeme': return "ÖDEME";
      case 'odenecek': return "ÖDENECEK";
      case 'alacak': return "ALACAK";
      case 'cek': return is_bitiminde === 1 ? "ÇEK (ÖDENDİ)" : "ÇEK (VADELİ)";
      default: return tip.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 relative">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">İŞLEMLER</h1>
             <p className="text-neutral-500 mt-1 font-light">Gelir / Gider / Çek Yönetimi</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <ArrowRightLeft className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-8 border border-neutral-200 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-sm font-light">+</span>
            </div>
            <h2 className="text-lg font-light tracking-tight text-neutral-900">YENİ İŞLEM GİRİŞİ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
             <div className="md:col-span-12 w-full">
                <CustomSelect 
                    label="ŞANTİYE / PROJE" 
                    value={form.proje_id} 
                    onChange={(val) => setForm({...form, proje_id: val})} 
                    options={projeOptions} 
                    placeholder="Şantiye Seçiniz" 
                    icon={Building2} 
                />
             </div>

             <div className="md:col-span-3 w-full">
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">
                {form.tip === 'cek' ? 'ÇEK VADESİ' : 'TARİH'}
              </label>
              <div className="relative w-full">
                <input
                  type="date"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light disabled:bg-neutral-100 disabled:text-neutral-400 transition-colors appearance-none"
                  value={form.tarih}
                  onChange={(e) => setForm({ ...form, tarih: e.target.value })}
                  disabled={form.is_bitiminde && form.tip !== 'cek'}
                />
                 {(!form.tarih && !form.is_bitiminde) && (
                  <Calendar className="absolute right-4 top-4 text-neutral-400 pointer-events-none" size={20} />
                )}
              </div>
            </div>

            <div className="md:col-span-3 w-full">
               <CustomSelect
                label="İŞLEM TİPİ"
                value={form.tip}
                onChange={(val) => setForm({ ...form, tip: val, is_bitiminde: false })}
                options={ISLEM_TIP_OPTIONS}
                placeholder="Seçiniz"
                icon={CreditCard}
              />
               {(form.tip === "odenecek" || form.tip === "alacak") && (
                <label className="flex items-center gap-2 mt-2 cursor-pointer group select-none">
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${form.is_bitiminde ? "border-neutral-900 bg-neutral-900" : "border-neutral-300"}`}>
                    {form.is_bitiminde && <Check size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" checked={form.is_bitiminde} onChange={(e) => setForm({ ...form, is_bitiminde: e.target.checked })} className="sr-only" />
                  <span className="text-xs text-neutral-600 font-light">İş bitiminde / İleri Tarihte</span>
                </label>
              )}
            </div>

             <div className="md:col-span-3 flex gap-3">
              <div className="flex-1">
                 <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">TUTAR</label>
                 <input
                  className="w-full h-14 px-4 border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors"
                  value={form.tutar}
                  onChange={(e) => setForm({ ...form, tutar: e.target.value })}
                  onBlur={() => setForm({ ...form, tutar: formatTR(form.tutar) })}
                  placeholder="0,00"
                />
              </div>
              <div className="w-28">
                <CustomSelect label="DÖVİZ" value={form.doviz} onChange={(val) => setForm({ ...form, doviz: val })} options={DOVIZ_OPTIONS} placeholder="Seç" />
              </div>
            </div>

             <div className="md:col-span-3">
              <CustomSelect label="KİŞİ" value={form.kisi_id} onChange={(val) => setForm({ ...form, kisi_id: val })} options={kisiOptions} placeholder="Seçiniz" icon={User} />
            </div>

            <div className="md:col-span-9 relative" ref={suggestionRef}>
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">AÇIKLAMA</label>
              <div className="relative">
                <input
                  className="w-full h-14 px-4 bg-white border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors"
                  value={form.aciklama}
                  onChange={handleDescriptionChange}
                  onFocus={() => { if(form.aciklama.length >= 3 && suggestions.length > 0) setShowSuggestions(true) }}
                  placeholder="Opsiyonel açıklama..."
                />
                {/* AUTOCOMPLETE DROPDOWN */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-neutral-200 shadow-lg mt-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <ul className="py-1">
                      {suggestions.map((desc, index) => (
                        <li 
                          key={index}
                          onClick={() => handleSuggestionClick(desc)}
                          className="px-4 py-3 text-sm font-light text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer transition-colors border-b border-neutral-50 last:border-0"
                        >
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-3 flex items-end">
              <button 
                onClick={saveCreate} 
                disabled={isSubmitting}
                className={`w-full h-14 bg-neutral-900 text-white font-light tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                 {isSubmitting ? (
                    <>
                        <RefreshCw size={20} className="animate-spin" />
                        KAYDEDİLİYOR...
                    </>
                ) : (
                    "EKLE"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 shadow-sm">
            <div className="p-4 border-b border-neutral-100 flex justify-end">
                <input
                  placeholder="Ara: Kişi, Proje ..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="p-2 text-sm border-b border-neutral-300 outline-none focus:border-neutral-900 bg-transparent w-64 font-light text-right transition-colors"
                />
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">TARİH</th>
                      <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">ŞANTİYE</th>
                      <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">TİP</th>
                      <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider text-right whitespace-nowrap">TUTAR</th>
                      <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">KİŞİ</th>
                      <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">AÇIKLAMA</th>
                      <th className="px-6 py-4 text-center w-32 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                     {filtered.map((r) => (
                        <tr key={r.id} className="hover:bg-neutral-50 group transition-colors">
                           <td className="px-6 py-5 font-light text-neutral-600 whitespace-nowrap">
                              {r.is_bitiminde && r.tip !== 'cek' ? "—" : formatDateDisplay(r.tarih)}
                           </td>
                           <td className="px-6 py-5 whitespace-nowrap">
                              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                {projeler.find(p => p.id === r.proje_id)?.ad || "GENEL"}
                              </span>
                           </td>
                           <td className="px-6 py-5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 bg-white text-neutral-600 text-xs font-medium uppercase tracking-wide">
                                 {getTypeLabel(r.tip, r.is_bitiminde)}
                              </span>
                           </td>
                           <td className="px-6 py-5 text-right font-mono text-neutral-900 whitespace-nowrap">
                              {Number(r.tutar).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                              {r.doviz !== "TRY" && (
                                <div className="text-[10px] text-neutral-400 mt-1">
                                  ({Number(r.tutar_raw).toLocaleString()} {r.doviz})
                                </div>
                              )}
                           </td>
                           <td className="px-6 py-5 font-light text-neutral-600 whitespace-nowrap">
                              {kisiler.find((k) => k.id === r.kisi_id)?.ad || "Bilinmiyor"}
                           </td>
                           <td className="px-6 py-5 font-light text-neutral-500 truncate max-w-xs">{r.aciklama}</td>
                           <td className="px-6 py-5 text-center whitespace-nowrap">
                             <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                
                                {r.tip === 'cek' && (
                                  <button 
                                    onClick={() => toggleCheckStatus(r)} 
                                    title={r.is_bitiminde === 1 ? "Bekliyor durumuna al" : "Ödendi olarak işaretle"}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${r.is_bitiminde === 1 ? 'bg-white border-neutral-300 text-neutral-500 hover:bg-neutral-100' : 'bg-white border-neutral-300 text-neutral-900 hover:bg-neutral-100'}`}
                                  >
                                    <RefreshCw size={14} />
                                  </button>
                                )}

                                <button onClick={() => startEdit(r)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-colors">
                                    <FileText size={14} />
                                </button>
                                
                                <button onClick={() => setDeleteId(r.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-600 transition-colors">
                                    <X size={14} />
                                </button>
                             </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
                </table>
            </div>
        </div>
      </div>

      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center"><FileText className="text-white" size={20} /></div>
                     <div><h2 className="text-xl font-light text-neutral-900 tracking-tight">KAYIT DÜZENLE</h2></div>
                 </div>
                 <button onClick={() => setEditForm(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"><X size={20} /></button>
             </div>
             <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                 
                 <div className="md:col-span-12 w-full">
                    <CustomSelect label="ŞANTİYE" value={editForm.proje_id} onChange={(val) => setEditForm({...editForm, proje_id: val})} options={projeOptions} placeholder="Seç" icon={Building2} />
                 </div>

                 <div className="md:col-span-4 w-full">
                    <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">TARİH</label>
                    <input 
                      type="date" 
                      className="w-full h-14 px-4 bg-white border border-neutral-300 outline-none appearance-none text-neutral-900 font-light" 
                      value={editForm.tarih} 
                      onChange={(e) => setEditForm({...editForm, tarih: e.target.value})} 
                      disabled={editForm.is_bitiminde && editForm.tip !== 'cek'} 
                    />
                 </div>
                 
                 <div className="md:col-span-4 w-full">
                    <CustomSelect label="İŞLEM TİPİ" value={editForm.tip} onChange={(val) => setEditForm({...editForm, tip: val})} options={ISLEM_TIP_OPTIONS} placeholder="Seç" icon={CreditCard}/>
                 </div>

                 <div className="md:col-span-4 w-full">
                   <CustomSelect label="KİŞİ" value={editForm.kisi_id} onChange={(val) => setEditForm({...editForm, kisi_id: val})} options={kisiOptions} placeholder="Seç" icon={User} />
                 </div>

                 <div className="md:col-span-6 flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">TUTAR</label>
                      <input className="w-full h-14 px-4 border border-neutral-300 outline-none font-light" value={editForm.tutar} onChange={(e) => setEditForm({...editForm, tutar: e.target.value})} onBlur={() => setEditForm({...editForm, tutar: formatTR(editForm.tutar)})} />
                    </div>
                    <div className="w-32">
                        <CustomSelect label="DÖVİZ" value={editForm.doviz} onChange={(val) => setEditForm({...editForm, doviz: val})} options={DOVIZ_OPTIONS} placeholder="Seç" />
                    </div>
                 </div>

                 <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">AÇIKLAMA</label>
                    <input className="w-full h-14 px-4 border border-neutral-300 outline-none font-light" value={editForm.aciklama} onChange={(e) => setEditForm({...editForm, aciklama: e.target.value})} />
                 </div>

               </div>
             </div>
             <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex gap-4 justify-end">
                <button onClick={() => setEditForm(null)} className="px-8 py-3 bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition-colors">İPTAL</button>
                <button onClick={saveEdit} className="px-8 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-2"><Save size={16} /> KAYDET</button>
             </div>
           </div>
        </div>
      )}

      {/* SİLME MODALI */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-md p-0 overflow-hidden">
             <div className="bg-neutral-50 p-6 border-b border-neutral-100 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="text-red-600" size={24} /></div>
                <h3 className="text-lg font-light text-neutral-900 tracking-tight">EMİN MİSİNİZ?</h3>
                <h2 className="text-lg font-light text-neutral-400 tracking-tight">Bu işlem geri alınamaz.</h2>
             </div>
             <div className="flex p-4 gap-4">
               <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-white border border-neutral-300 transition-colors hover:bg-neutral-50">VAZGEÇ</button>
               <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors">SİL</button>
             </div>
           </div>
        </div>
      )}

      {/* YENİ: ÇEK DURUM DEĞİŞTİRME MODALI */}
      {checkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-md p-0 overflow-hidden">
             <div className="bg-neutral-50 p-6 border-b border-neutral-100 text-center">
                {/* İkon rengi mavi/nötr tonlarında */}
                <div className="mx-auto w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="text-sky-600" size={24} />
                </div>
                <h3 className="text-lg font-light text-neutral-900 tracking-tight">DURUM DEĞİŞİKLİĞİ</h3>
                <h2 className="text-sm font-light text-neutral-500 tracking-tight mt-2 px-4">{checkModal.message}</h2>
             </div>
             <div className="flex p-4 gap-4">
               <button onClick={() => setCheckModal(null)} className="flex-1 py-3 bg-white border border-neutral-300 transition-colors hover:bg-neutral-50">VAZGEÇ</button>
               {/* Buton rengi ana tema rengi */}
               <button onClick={confirmCheckToggle} className="flex-1 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">ONAYLA</button>
             </div>
           </div>
        </div>
      )}

      {/* DİNAMİK BİLDİRİM (TOAST) */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-[60] bg-neutral-900 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
             <CheckCircle className="text-green-400" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wide">BAŞARILI</h4>
            <p className="text-xs text-neutral-400 font-light">{successMessage}</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="ml-2 text-neutral-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}