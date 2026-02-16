import { useState, useRef } from 'react';
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
  Check
} from 'lucide-react';

import { useData } from "../context/DataContext";

export default function SettingsPage() {
  const { 
    kisiler, 
    islemler, 
    projeler, 
    restoreData, 
    addProje,
    updateProje,
    removeProje,
    loading 
  } = useData();
  
  // -- PROJE YÖNETİMİ STATE --
  const [newProjeAd, setNewProjeAd] = useState("");
  const [editingProjeId, setEditingProjeId] = useState<string | null>(null);
  const [editProjeText, setEditProjeText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- SOL KOLON: ŞANTİYE YÖNETİMİ --- */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white border border-neutral-200 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
                    <Building className="text-neutral-400" size={20} />
                    <h2 className="text-lg font-light text-neutral-900 tracking-tight">ŞANTİYE YÖNETİMİ</h2>
                </div>

                <div className="space-y-6">
                    {/* Ekleme Inputu */}
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

                    {/* Proje Listesi */}
                    <div className="space-y-2">
                        {projeler.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-4 border border-neutral-100 bg-white hover:border-neutral-300 transition-colors group">
                                {editingProjeId === p.id ? (
                                    // Düzenleme Modu
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
                                    // Normal Görünüm
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-xs">
                                                {p.ad.charAt(0)}
                                            </div>
                                            <span className="font-light text-neutral-800">{p.ad}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleStartEditProje(p.id, p.ad)}
                                                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded"
                                                title="Düzenle"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProje(p.id)}
                                                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {projeler.length === 0 && (
                            <div className="text-center py-6 text-neutral-400 text-sm font-light italic">
                                Henüz şantiye eklenmedi.
                            </div>
                        )}
                    </div>
                </div>
            </div>

          </div>

          {/* --- SAĞ KOLON: VERİ YÖNETİMİ --- */}
          <div className="space-y-8">
             
             {/* Veri Durumu Özeti */}
             <div className="bg-neutral-900 text-white p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-light mb-1">Sistem Durumu</h3>
                    <p className="text-neutral-400 text-xs mb-6">Mevcut veri setinin özeti.</p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                            <span className="text-sm text-neutral-400">Aktif Kaynak</span>
                            <span className="text-sm font-bold bg-white/10 px-2 py-1 rounded">
                               SUPABASE (LIVE)
                            </span>
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
                {/* Dekoratif */}
                <div className="absolute -bottom-10 -right-10 text-neutral-800 opacity-20">
                    <Server size={200} />
                </div>
             </div>

             {/* İşlem Butonları */}
             <div className="bg-white border border-neutral-200 p-6 space-y-4">
                <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-4">VERİ YÖNETİMİ</h3>
                
                <button 
                  onClick={handleExportData}
                  disabled={loading}
                  className="w-full py-4 px-4 bg-neutral-50 border border-neutral-200 text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    <Download size={18} className="text-neutral-500 group-hover:text-neutral-900 transition-colors" />
                    <span className="font-light text-sm">YEDEK AL (.JSON)</span>
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button 
                  onClick={handleImportClick}
                  disabled={loading}
                  className="w-full py-4 px-4 bg-neutral-50 border border-neutral-200 text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                   {loading ? (
                     <span className="animate-spin w-5 h-5 border-2 border-neutral-400 border-t-neutral-900 rounded-full"></span>
                   ) : (
                     <>
                       <Upload size={18} className="text-neutral-500 group-hover:text-neutral-900 transition-colors" />
                       <span className="font-light text-sm">YEDEKTEN DÖN (RESTORE)</span>
                     </>
                   )}
                </button>
                
                <p className="text-[10px] text-neutral-400 text-center pt-2">
                    "Yedekten Dön" işlemi verileri veritabanına kalıcı olarak işler.
                </p>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}