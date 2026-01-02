import { useState } from 'react';
import { 
  Settings, 
  Database, 
  Trash2, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Building2,
  Tags,
  Plus,
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function SettingsPage() {
  const { 
    clearAllData, 
    loadDemoData, 
    entities,
    transactions,
    categories,
    addCategory,
    removeCategory 
  } = useFinance();

  const [localName, setLocalName] = useState("CraftOps Demo Şirketi");
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [newCat, setNewCat] = useState('');

  // --- ACTIONS ---

  const handleSaveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Gerçek bir backend olmadığı için sadece local state/simülasyon
      setIsLoading(false);
      setSaveMessage('Ayarlar başarıyla kaydedildi.');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 800);
  };

  const handleClearData = () => {
    if (confirm("DİKKAT! Tüm cari hesaplar ve finansal hareketler kalıcı olarak silinecek. Onaylıyor musunuz?")) {
      setIsLoading(true);
      setTimeout(() => {
        clearAllData(); // Context fonksiyonu
        setIsLoading(false);
        setSaveMessage('Veritabanı sıfırlandı.');
      }, 1000);
    }
  };

  const handleLoadDemo = () => {
    if (confirm("Mevcut veriler silinecek ve DEMO verileri yüklenecek. Onaylıyor musunuz?")) {
      setIsLoading(true);
      setTimeout(() => {
        loadDemoData(); // Context fonksiyonu
        setIsLoading(false);
        setSaveMessage('Demo verileri yüklendi.');
      }, 1000);
    }
  };

  const handleAddCategory = () => {
    if(!newCat.trim()) return;
    addCategory(newCat, 'expense'); 
    setNewCat('');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ entities, transactions, categories }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `craftops_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">AYARLAR</h1>
            <p className="text-neutral-500 mt-1 font-light">Sistem Yapılandırması ve Veri Yönetimi</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
            <Settings className="text-white" size={28} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* BİLDİRİM MESAJI */}
        {saveMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 flex items-center gap-2 rounded animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">{saveMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. SOL KOLON: GENEL AYARLAR & KATEGORİLER */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* FİRMA BİLGİLERİ */}
            <div className="bg-white border border-neutral-200 p-8 shadow-sm">
              <h2 className="text-lg font-light tracking-tight text-neutral-900 mb-6 flex items-center gap-2">
                <Building2 size={20} className="text-neutral-400" /> FİRMA BİLGİLERİ
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 tracking-wider">FİRMA ADI</label>
                  <input 
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="w-full h-14 px-4 border border-neutral-300 outline-none focus:border-neutral-900 font-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 tracking-wider">PARA BİRİMİ</label>
                  <select disabled className="w-full h-14 px-4 border border-neutral-200 bg-neutral-50 text-neutral-400 outline-none font-light cursor-not-allowed">
                    <option>Türk Lirası (₺) - Varsayılan</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="px-8 h-12 bg-neutral-900 text-white font-light tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'KAYDEDİLİYOR...' : <><Save size={16} /> KAYDET</>}
                </button>
              </div>
            </div>

            {/* KATEGORİ YÖNETİMİ (Finans Modülüne Özel) */}
            <div className="bg-white border border-neutral-200 p-8 shadow-sm">
                <h3 className="text-lg font-light tracking-tight text-neutral-900 mb-6 flex items-center gap-2">
                    <Tags size={20} className="text-neutral-400"/> GELİR / GİDER KATEGORİLERİ
                </h3>
                
                <div className="flex gap-2 mb-6">
                    <input 
                        value={newCat} 
                        onChange={e => setNewCat(e.target.value)} 
                        placeholder="Yeni kategori adı..." 
                        className="flex-1 h-12 px-4 border border-neutral-300 outline-none font-light focus:border-neutral-900"
                    />
                    <button onClick={handleAddCategory} className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors">
                        <Plus size={20}/>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                        <div key={c.id} className="bg-neutral-50 text-neutral-600 pl-3 pr-2 py-2 border border-neutral-200 flex items-center gap-2 text-sm group hover:border-neutral-300 transition-colors">
                            <span className="font-light">{c.name}</span>
                            <button onClick={() => removeCategory(c.id)} className="text-neutral-300 hover:text-red-500 transition-colors"><X size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* SİSTEM BİLGİSİ */}
            <div className="bg-neutral-100 border border-neutral-200 p-6 flex justify-between items-center text-sm text-neutral-500">
               <span>Versiyon: <strong>v1.0.4 (CraftOps Finance)</strong></span>
               <span>Powered by Opsiron</span>
            </div>
          </div>

          {/* 2. SAĞ KOLON: VERİ YÖNETİMİ (DATA ZONE) */}
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 p-8 shadow-sm h-full flex flex-col">
               <h2 className="text-lg font-light tracking-tight text-neutral-900 mb-6 flex items-center gap-2">
                  <Database size={20} className="text-neutral-400" /> VERİ YÖNETİMİ
               </h2>

               <div className="flex-1 space-y-4">
                  
                  {/* Buton: Demo Verisi */}
                  <button 
                    onClick={handleLoadDemo}
                    disabled={isLoading}
                    className="w-full p-4 border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 text-blue-700 mb-1">
                       <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                       <span className="font-medium tracking-wide">DEMO MODU</span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light pl-8">
                       Sistemi örnek cari hesaplar ve işlemlerle doldurur.
                    </p>
                  </button>

                  {/* Buton: Sıfırla */}
                  <button 
                    onClick={handleClearData}
                    disabled={isLoading}
                    className="w-full p-4 border border-neutral-200 hover:border-red-300 hover:bg-red-50 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 text-red-700 mb-1">
                       <Trash2 size={20} />
                       <span className="font-medium tracking-wide">SIFIRLA (BOŞALT)</span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light pl-8">
                       Tüm verileri siler. Temiz bir başlangıç sağlar.
                    </p>
                  </button>

                  {/* Divider */}
                  <div className="w-full border-t border-neutral-100 my-4"></div>

                  {/* Buton: Yedekle */}
                  <button 
                    onClick={handleExport}
                    className="w-full p-4 bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
                  >
                     <Download size={16} />
                     <span className="text-xs font-bold tracking-widest">JSON YEDEK AL</span>
                  </button>

               </div>
               
               <div className="mt-6 p-3 bg-orange-50 border border-orange-100 text-orange-800 text-[10px] flex gap-2 rounded">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <p>Bu işlemler tarayıcı hafızasını etkiler. "Sıfırla" dedikten sonra "Demo Modu"na basarak verileri tekrar yükleyebilirsiniz.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}