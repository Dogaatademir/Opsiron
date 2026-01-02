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
  Building2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function SettingsPage() {
  const { 
    clearAllData, 
    loadDemoData, 
    updateCompanySettings, 
    companyName,
    materials,
    products,
    logs 
  } = useInventory();

  const [localName, setLocalName] = useState(companyName);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // --- ACTIONS ---

  const handleSaveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      updateCompanySettings(localName);
      setIsLoading(false);
      setSaveMessage('Ayarlar başarıyla kaydedildi.');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 800);
  };

  const handleClearData = () => {
    if (confirm("DİKKAT! Tüm hammadde, ürün ve geçmiş kayıtları kalıcı olarak silinecek. Onaylıyor musunuz?")) {
      setIsLoading(true);
      setTimeout(() => {
        clearAllData();
        setIsLoading(false);
        setSaveMessage('Veritabanı sıfırlandı.');
      }, 1000);
    }
  };

  const handleLoadDemo = () => {
    if (confirm("Mevcut veriler silinecek ve DEMO verileri yüklenecek. Onaylıyor musunuz?")) {
      setIsLoading(true);
      setTimeout(() => {
        loadDemoData();
        setIsLoading(false);
        setSaveMessage('Demo verileri yüklendi.');
      }, 1000);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ materials, products, logs }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `craftops_backup_${new Date().toISOString().split('T')[0]}.json`;
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
          
          {/* 1. GENEL AYARLAR */}
          <div className="lg:col-span-2 space-y-8">
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
                  <label className="block text-xs font-medium text-neutral-500 mb-2 tracking-wider">PARA BİRİMİ (GÖRÜNTÜLEME)</label>
                  <select disabled className="w-full h-14 px-4 border border-neutral-200 bg-neutral-50 text-neutral-400 outline-none font-light cursor-not-allowed">
                    <option>Türk Lirası (₺) - Bu demoda pasif</option>
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

            {/* SİSTEM BİLGİSİ */}
            <div className="bg-neutral-100 border border-neutral-200 p-6 flex justify-between items-center text-sm text-neutral-500">
               <span>Versiyon: <strong>v2.1.0 (CraftOps Manufacturing)</strong></span>
               <span>Powered by Opsiron</span>
            </div>
          </div>

          {/* 2. VERİ YÖNETİMİ (DATA ZONE) */}
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
                       Sistemi örnek verilerle doldurur. Test etmek için idealdir.
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
                       Tüm verileri siler ve boş bir veritabanı başlatır.
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
                  <p>Bu işlemler tarayıcı üzerindeki yerel verileri etkiler. Sayfayı yenileseniz bile (Local Storage kullanmıyorsak) veriler Context içinde sıfırlanır.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}