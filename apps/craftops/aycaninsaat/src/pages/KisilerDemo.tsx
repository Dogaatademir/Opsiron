import { useState, useMemo } from "react";
import { Users, UserPlus, Briefcase, Building2, Search, FileText, X, AlertTriangle, Save, RefreshCw, CheckCircle, Info } from "lucide-react";
import { CustomSelect } from "../components/CustomSelect";
import { useData, type Kisi } from "../context/DataContext";

const ROLE_LABEL: Record<string, string> = {
  musteri: "Müşteri",
  tedarikci: "Tedarikçi",
  banka: "Banka",
  taseron: "Taşeron",
  sahis: "Şahıs",
  emlakci: "Emlakçı",
};

const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default function KisilerDemo() {
  // YENİ: updateKisi eklendi
  const { kisiler, projeler, kisiProjeler, addKisi, removeKisi, updateKisi, updateKisiProjeler } = useData();
  
  // -- ARAMA VE FORM STATE --
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ ad: "", rol: "", telefon: "", notu: "" });
  const [seciliProjeler, setSeciliProjeler] = useState<string[]>([]);
  
  // -- MODAL STATE'LERİ --
  const [editForm, setEditForm] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<Kisi | null>(null);

  // -- BİLDİRİM VE YÜKLEME STATE'LERİ --
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; isError: boolean }>({ show: false, msg: "", isError: false });

  const showToast = (msg: string, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast({ show: false, msg: "", isError: false }), 3000);
  };

  // --- ŞANTİYE SEÇİM FONKSİYONLARI ---
  const toggleProje = (projeId: string) => {
    setSeciliProjeler(prev => 
      prev.includes(projeId) ? prev.filter(id => id !== projeId) : [...prev, projeId]
    );
  };

  const toggleEditProje = (projeId: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      seciliProjeler: prev.seciliProjeler.includes(projeId)
        ? prev.seciliProjeler.filter((id: string) => id !== projeId)
        : [...prev.seciliProjeler, projeId]
    }));
  };

  // --- KİŞİ EKLEME ---
  async function add() {
    if (!form.ad.trim()) return showToast("Lütfen bir Ad/Ünvan giriniz.", true);
    
    setIsSubmitting(true);
    try {
      const yeniKisiId = crypto.randomUUID();
      
      await addKisi({ 
        id: yeniKisiId, 
        ad: form.ad.trim(), 
        rol: form.rol, 
        telefon: form.telefon, 
        notu: form.notu 
      });
      
      await updateKisiProjeler(yeniKisiId, seciliProjeler);
      
      setForm({ ad: "", rol: "", telefon: "", notu: "" });
      setSeciliProjeler([]); 
      showToast("Kişi başarıyla eklendi.");
    } catch (error) {
      console.error("Kişi ekleme hatası:", error);
      showToast("Kişi eklenirken bir hata oluştu.", true);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- KİŞİ DÜZENLEME BAŞLATMA ---
  const startEdit = (kisi: Kisi) => {
    const personProjects = kisiProjeler.filter(kp => kp.kisi_id === kisi.id).map(kp => kp.proje_id);
    setEditForm({
      ...kisi,
      seciliProjeler: personProjects
    });
  };

  // --- KİŞİ DÜZENLEME KAYDETME ---
  const saveEdit = async () => {
    if (!editForm.ad.trim()) return showToast("Ad/Ünvan boş bırakılamaz.", true);

    try {
      await updateKisi(editForm.id, {
        ad: editForm.ad.trim(),
        rol: editForm.rol,
        telefon: editForm.telefon,
        notu: editForm.notu
      });

      await updateKisiProjeler(editForm.id, editForm.seciliProjeler);
      
      setEditForm(null);
      showToast("Kişi bilgileri güncellendi.");
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      showToast("Güncelleme sırasında hata oluştu.", true);
    }
  };

  // --- KİŞİ SİLME ---
  async function handleDelete() {
    if (!deleteId) return;
    try {
      await removeKisi(deleteId);
      setDeleteId(null);
      showToast("Kişi başarıyla silindi.");
    } catch (error) {
      console.error("Silme hatası:", error);
      showToast("Silme işlemi başarısız.", true);
    }
  }

  // --- ARAMA VE SIRALAMA ---
  const filteredKisiler = useMemo(() => {
    const qText = query.toLocaleLowerCase("tr");
    return [...kisiler]
      .filter((r) => {
        if (!qText) return true;
        const roleName = r.rol ? ROLE_LABEL[r.rol]?.toLocaleLowerCase("tr") : "";
        const personProjects = kisiProjeler.filter(kp => kp.kisi_id === r.id).map(kp => kp.proje_id);
        const projectNames = projeler.filter(p => personProjects.includes(p.id)).map(p => p.ad.toLocaleLowerCase("tr")).join(" ");

        return (
          r.ad.toLocaleLowerCase("tr").includes(qText) ||
          (r.notu || "").toLocaleLowerCase("tr").includes(qText) ||
          (roleName || "").includes(qText) ||
          projectNames.includes(qText)
        );
      })
      .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
  }, [kisiler, query, kisiProjeler, projeler]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 relative">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">KİŞİLER</h1>
              <p className="text-neutral-500 mt-1 font-light">Müşteri & Tedarikçi Yönetimi</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <Users className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* EKLEME FORMU */}
        <div className="bg-white p-8 border border-neutral-200 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
              <UserPlus className="text-white" size={16} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-light tracking-tight text-neutral-900">YENİ KİŞİ EKLE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* SOL KISIM: TEMEL BİLGİLER */}
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">AD / ÜNVAN</label>
                <input
                  placeholder="Örn: Ahmet Yılmaz"
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className="w-full h-14 px-4 bg-white border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors"
                />
              </div>

              <div>
                <CustomSelect label="ROL" value={form.rol} onChange={(val) => setForm({ ...form, rol: val })} options={ROLE_OPTIONS} placeholder="Seçiniz" icon={Briefcase} />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">TELEFON / NOT</label>
                <input
                  placeholder="İsteğe bağlı not..."
                  value={form.notu}
                  onChange={(e) => setForm({ ...form, notu: e.target.value })}
                  className="w-full h-14 px-4 bg-white border border-neutral-300 text-neutral-900 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors"
                />
              </div>
            </div>

            {/* SAĞ KISIM: ŞANTİYE ATAMASI */}
            <div className="md:col-span-4 bg-neutral-50 p-6 border border-neutral-200 h-full flex flex-col">
               <label className="flex items-center gap-2 text-xs font-bold text-neutral-600 mb-4 tracking-wider uppercase">
                  <Building2 size={16} /> BAĞLI ŞANTİYELER
               </label>
               <div className="flex flex-wrap gap-2 flex-1 content-start">
                  {projeler.map(p => (
                     <button
                        key={p.id}
                        onClick={() => toggleProje(p.id)}
                        className={`px-3 py-2 text-xs font-medium border rounded transition-all active:scale-95 ${
                           seciliProjeler.includes(p.id)
                           ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                           : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500 hover:bg-neutral-100'
                        }`}
                     >
                        {p.ad}
                     </button>
                  ))}
                  {projeler.length === 0 && <p className="text-xs text-neutral-400 italic">Sistemde kayıtlı şantiye bulunmuyor.</p>}
               </div>
            </div>

            {/* KAYDET BUTONU */}
            <div className="md:col-span-12 flex justify-end mt-2">
              <button
                onClick={add}
                disabled={isSubmitting}
                className={`w-full md:w-auto px-12 h-14 bg-neutral-900 text-white font-light tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? <><RefreshCw size={20} className="animate-spin" /> KAYDEDİLİYOR...</> : "KİŞİYİ KAYDET"}
              </button>
            </div>
          </div>
        </div>

        {/* LİSTE */}
        <div className="bg-white border border-neutral-200 shadow-sm">
          {/* YENİ: ARAMA ÇUBUĞU */}
          <div className="p-4 border-b border-neutral-100 flex justify-end bg-neutral-50/50">
             <div className="relative">
                <input 
                  placeholder="Kişi, rol veya şantiye ara..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  className="pl-10 pr-4 py-2 text-sm border-b border-neutral-300 outline-none focus:border-neutral-900 bg-transparent w-72 font-light transition-colors" 
                />
                <Search className="absolute left-2 top-2.5 text-neutral-400" size={16} />
             </div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider w-1/4">AD / ÜNVAN</th>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider w-1/6">ROL</th>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider w-1/3">ŞANTİYELER</th>
                    <th className="px-6 py-4 text-xs font-medium text-neutral-500 tracking-wider">NOTLAR</th>
                    <th className="px-6 py-4 text-center w-32 text-xs font-medium text-neutral-500 tracking-wider">İŞLEM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredKisiler.map((r) => {
                    const kisiProjeIds = kisiProjeler.filter(kp => kp.kisi_id === r.id).map(kp => kp.proje_id);
                    const bagliProjeler = projeler.filter(p => kisiProjeIds.includes(p.id));

                    return (
                      <tr key={r.id} className="hover:bg-neutral-50 group transition-colors">
                        <td className="px-6 py-5 font-light text-neutral-900 text-base">{r.ad}</td>
                        <td className="px-6 py-5">
                          {r.rol ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded border border-neutral-200 bg-white text-neutral-600 text-[10px] font-bold uppercase tracking-wide">
                              {ROLE_LABEL[r.rol]}
                            </span>
                          ) : <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-wrap gap-1.5">
                             {bagliProjeler.length > 0 ? (
                                bagliProjeler.map(p => (
                                  <span key={p.id} className="inline-block px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-500 text-[10px] font-bold tracking-wider uppercase rounded">
                                     {p.ad}
                                  </span>
                                ))
                             ) : <span className="text-xs text-neutral-400 font-light italic">Atanmamış</span>}
                           </div>
                        </td>
                        <td className="px-6 py-5 font-light text-neutral-500 italic text-sm truncate max-w-[150px]">{r.notu || "—"}</td>
                        <td className="px-6 py-5 text-center whitespace-nowrap">
                           <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setInfoModal(r)} title="Kayıt Bilgisi" className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                                  <Info size={14} />
                              </button>
                              <button onClick={() => startEdit(r)} title="Düzenle" className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-colors">
                                  <FileText size={14} />
                              </button>
                              <button onClick={() => setDeleteId(r.id)} title="Sil" className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-600 transition-colors">
                                  <X size={14} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredKisiler.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-neutral-400 font-light">Eşleşen kayıt bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
          </div>
        </div>
      </div>

      {/* YENİ: DÜZENLEME MODALI */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center"><FileText className="text-white" size={20} /></div>
                     <div><h2 className="text-xl font-light text-neutral-900 tracking-tight">KİŞİ DÜZENLE</h2></div>
                 </div>
                 <button onClick={() => setEditForm(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"><X size={20} /></button>
             </div>
             
             <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
               {/* SOL: TEMEL BİLGİLER */}
               <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 w-full">
                    <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">AD / ÜNVAN</label>
                    <input className="w-full h-14 px-4 bg-white border border-neutral-300 outline-none text-neutral-900 font-light" value={editForm.ad} onChange={(e) => setEditForm({...editForm, ad: e.target.value})} />
                 </div>
                 <div className="w-full">
                    <CustomSelect label="ROL" value={editForm.rol} onChange={(val) => setEditForm({...editForm, rol: val})} options={ROLE_OPTIONS} placeholder="Seç" icon={Briefcase}/>
                 </div>
                 <div className="w-full">
                    <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">TELEFON / NOT</label>
                    <input className="w-full h-14 px-4 border border-neutral-300 outline-none font-light" value={editForm.notu || editForm.telefon || ""} onChange={(e) => setEditForm({...editForm, notu: e.target.value})} />
                 </div>
               </div>

               {/* SAĞ: ŞANTİYE BAĞLANTILARI */}
               <div className="md:col-span-4 bg-neutral-50 p-6 border border-neutral-200 rounded h-full flex flex-col">
                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-600 mb-4 tracking-wider uppercase">
                     <Building2 size={16} /> BAĞLI ŞANTİYELER
                  </label>
                  <div className="flex flex-wrap gap-2">
                     {projeler.map(p => (
                        <button
                           key={p.id}
                           onClick={() => toggleEditProje(p.id)}
                           className={`px-3 py-2 text-xs font-medium border rounded transition-all active:scale-95 ${
                              editForm.seciliProjeler.includes(p.id)
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                              : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500 hover:bg-neutral-100'
                           }`}
                        >
                           {p.ad}
                        </button>
                     ))}
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

      {/* YENİ: SİLME MODALI */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-md p-0 overflow-hidden">
             <div className="bg-neutral-50 p-6 border-b border-neutral-100 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="text-red-600" size={24} /></div>
                <h3 className="text-lg font-light text-neutral-900 tracking-tight">EMİN MİSİNİZ?</h3>
                <h2 className="text-sm font-light text-neutral-500 tracking-tight mt-2 px-4">Bu kişiyi silerseniz, geçmişteki tüm işlemleri hesaplamalardan çıkarılacaktır.</h2>
             </div>
             <div className="flex p-4 gap-4">
               <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-white border border-neutral-300 transition-colors hover:bg-neutral-50">VAZGEÇ</button>
               <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors">SİL</button>
             </div>
           </div>
        </div>
      )}

      {/* YENİ: KAYIT BİLGİSİ (INFO) MODALI */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-md p-0 overflow-hidden relative">
             <button onClick={() => setInfoModal(null)} className="absolute top-4 right-4 text-blue-500 hover:text-blue-900 transition-colors"><X size={20} /></button>
             <div className="bg-blue-50 p-6 border-b border-blue-100 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Info className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-light text-neutral-900 tracking-tight">KAYIT BİLGİSİ</h3>
             </div>
             <div className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                  <span className="text-xs font-bold text-neutral-400 tracking-wider">OLUŞTURULMA ZAMANI</span>
                  <span className="text-sm font-medium text-neutral-800">
                    {infoModal.created_at ? new Date(infoModal.created_at).toLocaleString('tr-TR') : 'Bilinmiyor'}
                  </span>
               </div>
               <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                  <span className="text-xs font-bold text-neutral-400 tracking-wider">KAYIT ID</span>
                  <span className="text-xs font-mono text-neutral-500">{infoModal.id.substring(0, 13)}...</span>
               </div>
             </div>
             <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
               <button onClick={() => setInfoModal(null)} className="px-6 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors text-sm font-light tracking-wide">KAPAT</button>
             </div>
           </div>
        </div>
      )}

      {/* YENİ: DİNAMİK BİLDİRİM (TOAST) */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[60] bg-neutral-900 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
             {toast.isError ? <AlertTriangle className="text-red-400" size={20} /> : <CheckCircle className="text-green-400" size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wide">{toast.isError ? "HATA" : "BAŞARILI"}</h4>
            <p className="text-xs text-neutral-400 font-light">{toast.msg}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 text-neutral-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}