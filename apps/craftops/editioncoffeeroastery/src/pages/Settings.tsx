import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Save, Database, Bell, Download, Upload, Trash2, ShieldCheck, 
  Send, Mail, Sliders, CheckCircle2, Package, Coffee, Sticker, Box, FileJson, Loader2, CalendarClock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { SystemSettings } from '../context/StoreContext';
import emailjs from '@emailjs/browser';

export const SettingsPage = () => {
  const { 
    settings, updateSettings, importSystemData, resetSystem, generateTextReport,
    greenCoffees, roastStocks, packagingItems, recipes, productionLogs, 
    orders, sales, quotes, purchases, parties, categories, ledgerEntries, payments, inventoryMovements  } = useStore();

  const [formData, setFormData] = useState<SystemSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSending, setIsSending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);
  
  const [lastBackup, setLastBackup] = useState<string>('Henüz Alınmadı');

  // --- HANDLERS ---
  const handleThresholdChange = (
    category: keyof typeof formData.thresholds, 
    type: 'critical' | 'low', 
    value: number
  ) => {
    setFormData(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [category]: {
          ...prev.thresholds[category],
          [type]: value
        }
      }
    }));
  };

  const handleSave = () => {
    updateSettings(formData);
    alert("Ayarlar başarıyla kaydedildi ve tüm sisteme uygulandı.");
  };

  const handleSendReport = async () => {
    if (!formData.targetEmail) { 
      alert("Lütfen e-posta giriniz."); 
      return; 
    }
    if (isSending) return;

    setIsSending(true);

    const templateParams = {
      to_email: formData.targetEmail,
      company_name: formData.companyName,
      report_content: generateTextReport(),
      date_time: new Date().toLocaleString('tr-TR'),
      subject: 'Anlık Sistem Raporu'
    };

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS env eksik: VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY');
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      alert("Rapor başarıyla gönderildi.");
    } catch (err) {
      console.error('EmailJS hata:', err);
      alert("E-posta gönderilemedi. Console'u kontrol edin.");
    } finally {
      setIsSending(false);
    }
  };

  // --- EXPORT ---
  const handleBackup = () => {
      const fullData = {
          timestamp: new Date().toISOString(),
          version: "1.0",
          settings: formData,
          greenCoffees, roastStocks, packagingItems, recipes, productionLogs, 
          orders, sales, quotes, purchases, parties, categories, ledgerEntries, payments, inventoryMovements
      };

      const jsonString = JSON.stringify(fullData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", url);
      downloadAnchorNode.setAttribute("download", `Full_Backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      setLastBackup(new Date().toLocaleString('tr-TR'));
  };

  // --- IMPORT ---
  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (window.confirm("DİKKAT: Bu işlem mevcut tüm veritabanını SİLECEK ve yedek dosyasındaki verileri yükleyecektir. Onaylıyor musunuz?")) {
                  setIsRestoring(true);
                  try {
                      await importSystemData(json);
                      alert("Yedek başarıyla yüklendi.");
                  } catch (error) {
                      alert("Yükleme sırasında bir hata oluştu. Verilerin bir kısmı yüklenmiş olabilir.");
                  } finally {
                      setIsRestoring(false);
                  }
              }
          } catch (err) {
              alert("Dosya okunamadı veya format hatalı.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  // --- SIFIRLAMA ---
  const handleHardReset = async () => {
    if (window.confirm("DİKKAT: SİSTEM FABRİKA AYARLARINA DÖNECEK!\n\nTüm Supabase veritabanı ve yerel veriler kalıcı olarak silinecek. Bu işlem geri alınamaz.\n\nOnaylıyor musunuz?")) {
        setIsResetting(true);
        try {
            await resetSystem();
            alert("Sistem başarıyla sıfırlandı.");
        } catch (error) {
            alert("Sıfırlama sırasında veritabanı hatası oluştu.");
        } finally {
            setIsResetting(false);
        }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">AYARLAR</h1>
              <p className="text-neutral-500 mt-1 font-light">Sistem yapılandırması, yedekleme ve veri yönetimi</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <Settings className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL KOLON: EŞİKLER & AYARLAR */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. STOK EŞİKLERİ */}
            <div className="bg-white border border-neutral-200">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sliders size={18} className="text-neutral-400" strokeWidth={1.5} />
                        <h2 className="text-lg font-light tracking-tight text-neutral-900">STOK EŞİK AYARLARI</h2>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] uppercase font-medium tracking-wider">
                        <span className="flex items-center gap-1 text-red-600"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Kritik</span>
                        <span className="flex items-center gap-1 text-amber-600"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Az/Uyarı</span>
                    </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    {[
                        { key: 'greenCoffee', label: 'Yeşil Çekirdek', unit: 'KG', icon: Coffee },
                        { key: 'roastStock', label: 'Kavrulmuş Kahve', unit: 'KG', icon: Coffee },
                        { key: 'bag', label: 'Torbalar', unit: 'ADET', icon: Package },
                        { key: 'label', label: 'Etiketler', unit: 'ADET', icon: Sticker },
                        { key: 'box', label: 'Koliler', unit: 'ADET', icon: Box },
                        { key: 'finishedProduct', label: 'Paketli Ürünler', unit: 'PKT', icon: CheckCircle2 },
                    ].map((item) => (
                        <div key={item.key} className="bg-neutral-50 p-4 border border-neutral-100 rounded-sm">
                            <div className="flex items-center gap-2 mb-4 text-neutral-900 font-normal">
                                <item.icon size={16} strokeWidth={1.5} className="text-neutral-400"/>
                                {item.label}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <input type="number" value={formData.thresholds[item.key as keyof typeof formData.thresholds].critical} onChange={(e) => handleThresholdChange(item.key as keyof typeof formData.thresholds, 'critical', Number(e.target.value))} className="w-full pl-3 pr-2 py-2 bg-white border border-red-200 text-red-800 text-sm focus:border-red-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <input type="number" value={formData.thresholds[item.key as keyof typeof formData.thresholds].low} onChange={(e) => handleThresholdChange(item.key as keyof typeof formData.thresholds, 'low', Number(e.target.value))} className="w-full pl-3 pr-2 py-2 bg-white border border-amber-200 text-amber-800 text-sm focus:border-amber-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. E-POSTA VE OTOMASYON AYARLARI */}
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                <Bell size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">RAPORLAMA & OTOMASYON</h2>
              </div>
              <div className="p-6 space-y-6">
                
                {/* E-posta Alanı */}
                <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Rapor E-postası</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input 
                          type="email" 
                          value={formData.targetEmail || ''} 
                          onChange={(e) => setFormData({...formData, targetEmail: e.target.value})} 
                          className="w-full pl-12 pr-4 py-3 border border-neutral-200 outline-none focus:border-neutral-900 font-light" 
                          placeholder="mail@sirketiniz.com" 
                        />
                    </div>
                </div>

                {/* YENİ: Otomatik Rapor Toggle */}
                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                  <div className="flex items-center gap-3">
                    <CalendarClock size={20} className={formData.enableWeeklyReport ? "text-neutral-900" : "text-neutral-400"} />
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Her Pazartesi Sistem Raporu Gönderilsin</h3>
                      <p className="text-xs text-neutral-500 mt-1">Her Pazartesi saat 09:00'da rapor ve sistem yedeği otomatik gönderilir.</p>
                      <p className="text-[10px] text-amber-600 mt-1">*Bu özellik için web sayfasının o saatte açık olması gerekir.</p>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.enableWeeklyReport || false}
                      onChange={(e) => setFormData({...formData, enableWeeklyReport: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                    <button onClick={handleSendReport} className="flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 px-4 py-2 hover:bg-neutral-50 transition-colors">
                        <Send size={16} /> <span className="text-xs font-medium uppercase">Anlık E-posta Raporu (Test)</span>
                    </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end sticky bottom-6 z-10">
              <button onClick={handleSave} className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 shadow-lg hover:bg-neutral-800 transition-all active:scale-[0.99]">
                <Save size={18} /> <span className="font-light tracking-widest text-sm">DEĞİŞİKLİKLERİ KAYDET</span>
              </button>
            </div>
          </div>

          {/* SAĞ KOLON: VERİ YÖNETİMİ & BACKUP */}
          <div className="space-y-6">
            
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                <Database size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">VERİ YÖNETİMİ</h2>
              </div>
              <div className="p-6 space-y-4">
                
                {/* BACKUP */}
                <button onClick={handleBackup} className="w-full flex items-center justify-between p-4 border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group">
                  <div>
                      <span className="flex items-center gap-2 text-neutral-900 font-medium text-sm"><FileJson size={16} className="text-blue-500"/> Tam Sistem Yedeği Al (JSON)</span>
                      <span className="text-neutral-400 text-xs font-light block mt-1">Tüm veritabanını indir ve sakla.</span>
                  </div>
                  <Download size={18} className="text-neutral-300 group-hover:text-blue-600 transition-colors" />
                </button>

                {/* RESTORE */}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                <button 
                  onClick={handleRestoreClick} 
                  disabled={isRestoring || isResetting}
                  className={`w-full flex items-center justify-between p-4 border border-neutral-200 transition-all text-left group ${isRestoring ? 'bg-neutral-100 cursor-not-allowed' : 'hover:border-green-300 hover:bg-green-50'}`}
                >
                  <div>
                      <span className="flex items-center gap-2 text-neutral-900 font-medium text-sm">
                        {isRestoring ? <Loader2 size={16} className="animate-spin text-green-600"/> : <Upload size={16} className="text-green-500"/>}
                        {isRestoring ? 'Yükleniyor...' : 'Yedeği Geri Yükle'}
                      </span>
                      <span className="text-neutral-400 text-xs font-light block mt-1">
                        {isRestoring ? 'Veritabanı siliniyor ve yeniden yazılıyor...' : 'JSON dosyasından verileri kurtar.'}
                      </span>
                  </div>
                  {!isRestoring && <Upload size={18} className="text-neutral-300 group-hover:text-green-600 transition-colors" />}
                </button>

                {/* HARD RESET */}
                <div className="pt-4 border-t border-neutral-100 mt-2">
                  <button 
                    onClick={handleHardReset} 
                    disabled={isRestoring || isResetting}
                    className={`w-full flex items-center justify-center gap-2 p-4 border border-red-100 text-red-700 transition-all ${isResetting ? 'bg-red-50 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                      {isResetting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                      <span className="font-light text-sm tracking-wide">{isResetting ? 'SIFIRLANIYOR...' : 'FABRİKA AYARLARINA DÖN'}</span>
                  </button>
                  <p className="text-center text-[10px] text-red-400 mt-2 font-light">Tüm veriler kalıcı olarak silinir.</p>
                </div>
              </div>
            </div>

            {/* SİSTEM DURUMU */}
            <div className="bg-neutral-900 text-white p-6 border border-neutral-900">
              <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={18} className="text-neutral-400" />
                  <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">SİSTEM ÖZETİ</h2>
              </div>
              <div className="space-y-3 text-sm font-light">
                <div className="flex justify-between border-b border-neutral-800 pb-2"><span>Siparişler</span><span>{orders.length}</span></div>
                <div className="flex justify-between border-b border-neutral-800 pb-2"><span>Üretim Kayıtları</span><span>{productionLogs.length}</span></div>
                <div className="flex justify-between border-b border-neutral-800 pb-2"><span>Finans Kayıtları</span><span>{ledgerEntries.length}</span></div>
                <div className="flex justify-between border-b border-neutral-800 pb-2"><span>Son Yedekleme</span><span className="text-neutral-400">{lastBackup}</span></div>
                <div className="pt-4 text-center text-[10px] text-neutral-500">Edition Coffee Roastery v1.2.7</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};