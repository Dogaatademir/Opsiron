import { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  Download, 
  Upload, 
  Server,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  History,
  RefreshCw,
  RotateCcw,
  Info,
  DollarSign // Yeni ikon
} from 'lucide-react';

import { useData, supabase } from "../context/DataContext";

// LOG ÖZETİ OLUŞTURMA YARDIMCI FONKSİYONU
const getLogSummary = (log: any) => {
  const data = log.eski_veri;
  if (!data) return `Kayıt ID: ${log.kayit_id.substring(0,8)}...`;
  
  switch (log.tablo_adi) {
    case 'islemler':
       const doviz = data.doviz || 'TRY';
       const tutar = data.tutar_raw || data.tutar;
       return `${data.tip?.toUpperCase() || 'İŞLEM'} - ${tutar} ${doviz === 'TRY' ? '₺' : doviz} | ${data.aciklama || 'Açıklama yok'}`;
    case 'kisiler':
       return `${data.ad || 'İsimsiz Kişi'} (${data.rol || 'Rol belirtilmemiş'})`;
    case 'projeler':
       return `Şantiye: ${data.ad || 'İsimsiz'}`;
    case 'daireler':
       return `Daire No: ${data.daire_no} ${data.blok ? `(Blok: ${data.blok})` : ''} - Fiyat: ${data.fiyat || 'Girilememiş'}`;
    default:
       return data.aciklama || data.ad || `Kayıt ID: ${log.kayit_id.substring(0,8)}...`;
  }
}

export default function SettingsPage() {
  const { 
    kisiler, 
    islemler, 
    projeler, 
    restoreData, 
    rollbackLog, 
    addProje,
    updateProje,
    removeProje,
    loading 
  } = useData();
  
  // -- TAB STATE --
  const [activeTab, setActiveTab] = useState<'santiye' | 'loglar'>('santiye');

  // -- PROJE YÖNETİMİ STATE --
  const [newProjeAd, setNewProjeAd] = useState("");
  const [editingProjeId, setEditingProjeId] = useState<string | null>(null);
  const [editProjeText, setEditProjeText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- LOGLAR STATE --
  const [loglar, setLoglar] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [infoModalLog, setInfoModalLog] = useState<any>(null);

  // -- GÜNCEL KURLAR STATE --
  const [kurlar, setKurlar] = useState({ USD: "1", EUR: "1", ALTIN: "1" });

  useEffect(() => {
    // Kurları localStorage'dan çek
    const savedKurlar = localStorage.getItem("guncel_kurlar");
    if (savedKurlar) {
      setKurlar(JSON.parse(savedKurlar));
    }
  }, []);

  const handleSaveKurlar = () => {
    localStorage.setItem("guncel_kurlar", JSON.stringify(kurlar));
    alert("Güncel kurlar başarıyla sisteme kaydedildi.");
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('sistem_loglari')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLoglar(data || []);
    } catch (error) {
      console.error("Loglar çekilirken hata:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'loglar') {
      fetchLogs();
    }
  }, [activeTab]);

  // --- ACTIONS ---

  const handleExportData = () => {
    const data = {
      date: new Date().toISOString(),
      source: "supabase_live",
      summary: {
        total_projects: projeler.length,
        total_transactions: islemler.length,
        total_contacts: kisiler.length
      },
      projeler,
      kisiler,
      islemler
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aycan-insaat-yedek-${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.kisiler && json.islemler) {
          const projeSayisi = json.projeler ? json.projeler.length : 0;
          const confirmMsg = `DİKKAT: BU İŞLEM VERİTABANINA YAZACAKTIR!\n\nYedek içeriği:\n- ${projeSayisi} Proje\n- ${json.kisiler.length} Kişi\n- ${json.islemler.length} İşlem\n\nMevcut verilerin üzerine yazmak ve olmayanları eklemek istiyor musunuz?`;
          
          if (confirm(confirmMsg)) {
            await restoreData(json);
          }
        } else {
          alert("Hata: Geçersiz yedek dosyası formatı.");
        }
      } catch (error) {
        console.error("Dosya okuma hatası", error);
        alert("Dosya okunamadı veya bozuk.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // --- LOG GERİ ALMA TETİKLEYİCİSİ ---
  const handleRollback = async (log: any) => {
    if(!confirm("Bu işlemi geri alarak eski veriyi sisteme yüklemek istediğinize emin misiniz?")) return;
    await rollbackLog(log);
    setInfoModalLog(null);
    await fetchLogs();
  };

  // --- PROJE FONKSİYONLARI ---
  const handleAddProje = async () => {
    if (!newProjeAd.trim()) return;
    try {
      await addProje(newProjeAd.trim());
      setNewProjeAd("");
    } catch (error) {
      alert("Proje eklenirken hata oluştu.");
    }
  };

  const handleStartEditProje = (id: string, currentAd: string) => {
    setEditingProjeId(id);
    setEditProjeText(currentAd);
  };

  const handleSaveEditProje = async (id: string) => {
    if (!editProjeText.trim()) return;
    try {
      await updateProje(id, editProjeText.trim());
      setEditingProjeId(null);
    } catch (error) {
      alert("Güncelleme başarısız.");
    }
  };

  const handleDeleteProje = async (id: string) => {
    if (!confirm("Bu şantiyeyi silmek istediğinize emin misiniz?")) return;
    try {
      await removeProje(id);
    } catch (error: any) {
      alert(error.message || "Silme işlemi başarısız. Bu şantiyeye bağlı işlemler olabilir.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">
                AYARLAR
              </h1>
              <p className="text-neutral-500 mt-1 font-light">
                Sistem Tercihleri & Veri Yönetimi
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <Settings className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex gap-6 mt-8 border-b border-neutral-200">
            <button 
              onClick={() => setActiveTab('santiye')}
              className={`pb-4 text-sm font-medium tracking-wide transition-colors relative ${activeTab === 'santiye' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              ŞANTİYE VE VERİ YÖNETİMİ
              {activeTab === 'santiye' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('loglar')}
              className={`pb-4 text-sm font-medium tracking-wide transition-colors relative flex items-center gap-2 ${activeTab === 'loglar' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              <History size={16} />
              SİSTEM LOGLARI
              {activeTab === 'loglar' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900"></div>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- TAB 1: ŞANTİYE VE YEDEKLEME --- */}
        {activeTab === 'santiye' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* SOL KOLON: ŞANTİYE YÖNETİMİ */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-neutral-200 p-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
                      <Building className="text-neutral-400" size={20} />
                      <h2 className="text-lg font-light text-neutral-900 tracking-tight">ŞANTİYE YÖNETİMİ</h2>
                  </div>

                  <div className="space-y-6">
                      <div className="flex gap-2">
                          <input 
                              placeholder="Yeni şantiye adı giriniz..."
                              value={newProjeAd}
                              onChange={(e) => setNewProjeAd(e.target.value)}
                              className="flex-1 p-3 bg-neutral-50 border border-neutral-200 text-neutral-900 outline-none focus:border-neutral-900 font-light transition-colors"
                          />
                          <button 
                              onClick={handleAddProje}
                              disabled={!newProjeAd.trim()}
                              className="px-6 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                          >
                              <Plus size={20} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          {projeler.map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-4 border border-neutral-100 bg-white hover:border-neutral-300 transition-colors group">
                                  {editingProjeId === p.id ? (
                                      <div className="flex items-center gap-2 w-full">
                                          <input 
                                              value={editProjeText}
                                              onChange={(e) => setEditProjeText(e.target.value)}
                                              className="flex-1 p-2 bg-neutral-50 border border-neutral-300 outline-none"
                                              autoFocus
                                          />
                                          <button onClick={() => handleSaveEditProje(p.id)} className="p-2 text-green-600 hover:bg-green-50 rounded"><Check size={18}/></button>
                                          <button onClick={() => setEditingProjeId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded"><X size={18}/></button>
                                      </div>
                                  ) : (
                                      <>
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-xs">
                                                  {p.ad.charAt(0)}
                                              </div>
                                              <span className="font-light text-neutral-800">{p.ad}</span>
                                          </div>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => handleStartEditProje(p.id, p.ad)} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded" title="Düzenle"><Pencil size={16} /></button>
                                              <button onClick={() => handleDeleteProje(p.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded" title="Sil"><Trash2 size={16} /></button>
                                          </div>
                                      </>
                                  )}
                              </div>
                          ))}
                          {projeler.length === 0 && <div className="text-center py-6 text-neutral-400 text-sm font-light italic">Henüz şantiye eklenmedi.</div>}
                      </div>
                  </div>
              </div>
            </div>

            {/* SAĞ KOLON: KURLAR VE VERİ YÖNETİMİ */}
            <div className="space-y-8">
               
               {/* YENİ EKLENEN GÜNCEL KURLAR KARTI */}
               <div className="bg-white border border-neutral-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                     <DollarSign size={18} className="text-neutral-400" />
                     <h3 className="text-xs font-bold text-neutral-900 tracking-wider uppercase">GÜNCEL KURLAR</h3>
                  </div>
                  <p className="text-[10px] text-neutral-500 mb-2">Genel Bakış sayfasındaki toplam yükümlülük bu kurlarla hesaplanır.</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 font-medium">USD ($)</span>
                      <input type="number" value={kurlar.USD} onChange={e => setKurlar({...kurlar, USD: e.target.value})} className="w-24 p-2 text-sm border border-neutral-300 outline-none focus:border-neutral-900 text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 font-medium">EUR (€)</span>
                      <input type="number" value={kurlar.EUR} onChange={e => setKurlar({...kurlar, EUR: e.target.value})} className="w-24 p-2 text-sm border border-neutral-300 outline-none focus:border-neutral-900 text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 font-medium">ALTIN (gr)</span>
                      <input type="number" value={kurlar.ALTIN} onChange={e => setKurlar({...kurlar, ALTIN: e.target.value})} className="w-24 p-2 text-sm border border-neutral-300 outline-none focus:border-neutral-900 text-right" />
                    </div>
                  </div>
                  <button onClick={handleSaveKurlar} className="w-full mt-2 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors text-xs font-medium tracking-wide">
                     KURLARI KAYDET
                  </button>
               </div>

               {/* SİSTEM DURUMU (Aynı kaldı) */}
               <div className="bg-neutral-900 text-white p-8 relative overflow-hidden">
                  <div className="relative z-10">
                      <h3 className="text-lg font-light mb-1">Sistem Durumu</h3>
                      <p className="text-neutral-400 text-xs mb-6">Mevcut veri setinin özeti.</p>

                      <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                              <span className="text-sm text-neutral-400">Aktif Kaynak</span>
                              <span className="text-sm font-bold bg-white/10 px-2 py-1 rounded">SUPABASE (LIVE)</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                              <span className="text-sm text-neutral-400">Aktif Şantiyeler</span>
                              <span className="text-xl font-light">{projeler.length}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                              <span className="text-sm text-neutral-400">Kayıtlı Kişi</span>
                              <span className="text-xl font-light">{kisiler.length}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                              <span className="text-sm text-neutral-400">İşlem Hareketi</span>
                              <span className="text-xl font-light">{islemler.length}</span>
                          </div>
                      </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 text-neutral-800 opacity-20"><Server size={200} /></div>
               </div>

               <div className="bg-white border border-neutral-200 p-6 space-y-4">
                  <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-4">VERİ YÖNETİMİ</h3>
                  <button onClick={handleExportData} disabled={loading} className="w-full py-4 px-4 bg-neutral-50 border border-neutral-200 text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50">
                      <Download size={18} className="text-neutral-500 group-hover:text-neutral-900 transition-colors" />
                      <span className="font-light text-sm">YEDEK AL (.JSON)</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                  <button onClick={handleImportClick} disabled={loading} className="w-full py-4 px-4 bg-neutral-50 border border-neutral-200 text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50">
                     {loading ? <span className="animate-spin w-5 h-5 border-2 border-neutral-400 border-t-neutral-900 rounded-full"></span> : <><Upload size={18} className="text-neutral-500 group-hover:text-neutral-900 transition-colors" /><span className="font-light text-sm">YEDEKTEN DÖN (RESTORE)</span></>}
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center pt-2">"Yedekten Dön" işlemi verileri veritabanına kalıcı olarak işler.</p>
               </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: SİSTEM LOGLARI --- */}
        {activeTab === 'loglar' && (
          // SİSTEM LOGLARI KISMI BİR ÖNCEKİ İLE TAMAMEN AYNI - KOD KALABALIĞI OLMAMASI İÇİN AYNEN BIRAKTIM
          <div className="bg-white border border-neutral-200 shadow-sm animate-in fade-in duration-300">
             <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                <div>
                   <h2 className="text-lg font-light text-neutral-900">Sistem İşlem Kayıtları</h2>
                   <p className="text-xs text-neutral-500 mt-1">Son 50 silme ve güncelleme işlemi.</p>
                </div>
                <button 
                  onClick={fetchLogs} 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-sm font-light"
                >
                  <RefreshCw size={16} className={loadingLogs ? "animate-spin" : ""} />
                  YENİLE
                </button>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[900px]">
                 <thead className="bg-white border-b border-neutral-100 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4">TARİH</th>
                     <th className="px-6 py-4">KULLANICI</th>
                     <th className="px-6 py-4">İŞLEM</th>
                     <th className="px-6 py-4">MODÜL</th>
                     <th className="px-6 py-4">DETAY / ÖZET</th>
                     <th className="px-6 py-4 text-center">AKSİYON</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-neutral-50">
                   {loadingLogs ? (
                     <tr><td colSpan={6} className="p-12 text-center text-neutral-400"><RefreshCw size={24} className="animate-spin mx-auto mb-2"/> Yükleniyor...</td></tr>
                   ) : loglar.length === 0 ? (
                     <tr><td colSpan={6} className="p-12 text-center text-neutral-400">Henüz log kaydı bulunmuyor.</td></tr>
                   ) : (
                     loglar.map((log) => (
                       <tr key={log.id} className="hover:bg-neutral-50 transition-colors group">
                         <td className="px-6 py-4 text-xs font-mono text-neutral-500">
                           {new Date(log.created_at).toLocaleString('tr-TR')}
                         </td>
                         <td className="px-6 py-4 text-sm font-medium text-neutral-700">
                           {log.kullanici_email ? log.kullanici_email.replace('@aycan.local', '') : 'Sistem'}
                         </td>
                         <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider ${log.islem_tipi === 'SILME' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                             {log.islem_tipi}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-sm font-bold text-neutral-600 uppercase">
                           {log.tablo_adi}
                         </td>
                         <td className="px-6 py-4 text-sm font-light text-neutral-600 max-w-md truncate" title="Detay için incele butonuna basın">
                           {getLogSummary(log)}
                         </td>
                         <td className="px-6 py-4 text-center">
                           <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => setInfoModalLog(log)}
                               className="flex items-center justify-center w-8 h-8 bg-white border border-neutral-200 rounded-full text-neutral-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                               title="Detayları İncele"
                             >
                               <Info size={16} />
                             </button>
                             <button 
                               onClick={() => handleRollback(log)}
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded text-xs font-medium text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors"
                               title="Veriyi Geri Yükle"
                             >
                               <RotateCcw size={14} /> GERİ AL
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

      </div>

      {infoModalLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-neutral-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
             
             <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50 flex-shrink-0">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Info className="text-blue-600" size={20} />
                     </div>
                     <div>
                       <h2 className="text-xl font-light text-neutral-900 tracking-tight">LOG DETAYI</h2>
                       <p className="text-xs text-neutral-500">{new Date(infoModalLog.created_at).toLocaleString('tr-TR')}</p>
                     </div>
                 </div>
                 <button onClick={() => setInfoModalLog(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors">
                    <X size={20} />
                 </button>
             </div>

             <div className="p-6 overflow-y-auto flex-1 bg-neutral-50/30 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-neutral-200 rounded-sm">
                    <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">TABLO / MODÜL</div>
                    <div className="text-sm font-bold uppercase text-neutral-700">{infoModalLog.tablo_adi}</div>
                  </div>
                  <div className="p-4 bg-white border border-neutral-200 rounded-sm">
                    <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">İŞLEM TİPİ</div>
                    <div className={`text-sm font-bold ${infoModalLog.islem_tipi === 'SILME' ? 'text-red-600' : 'text-orange-600'}`}>
                       {infoModalLog.islem_tipi}
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-neutral-200 rounded-sm">
                    <div className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">KULLANICI</div>
                    <div className="text-sm font-medium text-neutral-700 truncate" title={infoModalLog.kullanici_email}>
                       {infoModalLog.kullanici_email || 'Sistem'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">KAYIT İÇERİĞİ (ESKİ VERİ)</span>
                     <span className="px-2 py-0.5 bg-neutral-200 text-neutral-600 text-[9px] rounded-full">JSON</span>
                  </div>
                  <div className="p-4 bg-[#1e1e1e] border border-neutral-800 rounded-sm overflow-x-auto">
                    <pre className="text-green-400 font-mono text-[12px] leading-relaxed">
                      {JSON.stringify(infoModalLog.eski_veri, null, 2)}
                    </pre>
                  </div>
                  <p className="text-xs text-neutral-500 italic mt-2">
                     * Bu kayıt geri yüklenirse, yukarıdaki tüm veriler aslına uygun olarak sisteme geri eklenecektir.
                  </p>
                </div>
             </div>

             <div className="p-6 border-t border-neutral-100 bg-white flex justify-end gap-3 flex-shrink-0">
               <button onClick={() => setInfoModalLog(null)} className="px-6 py-2 border border-neutral-300 text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">
                  KAPAT
               </button>
               <button onClick={() => handleRollback(infoModalLog)} className="px-6 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2">
                  <RotateCcw size={16}/> BU İŞLEMİ GERİ YÜKLE
               </button>
             </div>

           </div>
        </div>
      )}

    </div>
  );
}