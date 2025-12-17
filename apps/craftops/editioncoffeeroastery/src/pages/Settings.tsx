import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Save, Database, Bell, Download, Upload, Trash2, ShieldCheck, 
  Send, Mail, Sliders, CheckCircle2, Package, Coffee, Sticker, Box, FileJson, 
  RefreshCcw // Yeni ikon eklendi
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { SystemSettings } from '../context/StoreContext';
import { generateDummyData } from '../context/dummyDataGenerator'; // 1. IMPORT EKLENDİ
import emailjs from '@emailjs/browser';

export const SettingsPage = () => {
  const { 
    settings, updateSettings, importSystemData, resetSystem,
    greenCoffees, roastStocks, packagingItems, recipes, productionLogs, 
    orders, sales, quotes, purchases, parties, categories, ledgerEntries, payments, inventoryMovements,getPartyBalance
  } = useStore();

  const [formData, setFormData] = useState<SystemSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlert: true,
    productionReport: true,
    targetEmail: 'info@editioncoffee.com'
  });
  
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

  // --- DEMO DATA HANDLER (2. YENİ FONKSİYON) ---
  const handleLoadDemoData = () => {
    if (window.confirm('DİKKAT: Mevcut veriler silinecek ve 1 yıllık örnek sistem verisi yüklenecek. Onaylıyor musunuz?')) {
      resetSystem(); // Temiz bir sayfa için önce reset
      
      // State güncellemesinin bitmesi için kısa bir gecikme
      setTimeout(() => {
        const dummyData = generateDummyData();
        importSystemData(dummyData);
        // importSystemData içinde zaten alert var, ekstra mesaja gerek yok
      }, 100);
    }
  };

  const getReportContent = () => {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const line = "------------------------------------------------------------------------------------------\n";
    const doubleLine = "==========================================================================================\n";
    const pad = (str: string, length: number) => (str || "").toString().padEnd(length).slice(0, length);

    // Finansal Özet Hesaplamaları
    const activeSales = sales.filter(s => s.status === 'Active');
    const totalRevenue = activeSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const activePayments = payments.filter(p => p.status === 'Active' && p.type === 'Inbound');
    const totalCollections = activePayments.reduce((sum, p) => sum + p.amount, 0);

    let content = "";
    content += doubleLine;
    content += ` ${settings.companyName.toUpperCase()} - DETAYLI SİSTEM RAPORU\n`;
    content += ` Tarih: ${today}\n`;
    content += doubleLine + "\n";

    // 1. FİNANSAL ÖZET
    content += "[1] FİNANSAL GENEL DURUM\n" + line;
    content += `${pad("Toplam Satış Cirosu", 30)}: ${totalRevenue.toLocaleString('tr-TR')} ${settings.currency}\n`;
    content += `${pad("Toplam Tahsilat", 30)}: ${totalCollections.toLocaleString('tr-TR')} ${settings.currency}\n`;
    content += `${pad("Aktif Sipariş Sayısı", 30)}: ${orders.filter(o => o.status === 'Pending').length} Adet\n\n`;

    // 2. YEŞİL ÇEKİRDEK
    content += "[2] YEŞİL ÇEKİRDEK STOĞU\n" + line;
    content += `${pad("ÜRÜN ADI", 30)} | ${pad("MENŞEİ", 15)} | ${pad("STOK (KG)", 10)}\n` + line;
    greenCoffees.forEach(g => { 
      content += `${pad(g.name, 30)} | ${pad(g.origin, 15)} | ${pad(g.stockKg.toFixed(2) + " kg", 10)}\n`; 
    });

    // 3. KAVRULMUŞ STOK
    content += "\n[3] KAVRULMUŞ KAHVE STOĞU\n" + line;
    content += `${pad("ÜRÜN ADI", 30)} | ${pad("PROFİL", 20)} | ${pad("STOK (KG)", 10)}\n` + line;
    roastStocks.forEach(r => { 
      content += `${pad(r.name, 30)} | ${pad(r.roastLevel, 20)} | ${pad(r.stockKg.toFixed(2) + " kg", 10)}\n`; 
    });

    // 4. AMBALAJ & EŞİK KONTROLÜ
    content += "\n[4] AMBALAJ VE PAKETLEME (KRİTİK DURUM)\n" + line;
    packagingItems.forEach(p => { 
      const isLow = p.stockQuantity <= p.minThreshold;
      content += `${pad(p.name, 35)} | ${pad(p.stockQuantity + " ad", 10)} ${isLow ? "[!!! DÜŞÜK]" : ""}\n`; 
    });

    // 5. MÜŞTERİ BAKİYELERİ (İLK 10)
    content += "\n[5] MÜŞTERİ BAKİYE ÖZETİ\n" + line;
    content += `${pad("MÜŞTERİ ADI", 35)} | ${pad("BAKİYE", 15)}\n` + line;
    parties.filter(p => p.type === 'Customer' && p.status === 'Active').slice(0, 10).forEach(p => {
      // getPartyBalance artık dışarıdan (useStore'dan) güvenli bir şekilde geliyor
      const balance = getPartyBalance(p.id);
      content += `${pad(p.name, 35)} | ${balance.toLocaleString('tr-TR')} ${settings.currency}\n`;
    });
    
    return content;
  };

  const handleSendReport = async () => {
    if (!notificationSettings.targetEmail) { 
      alert("Lütfen e-posta giriniz."); 
      return; 
    }
    if (isSending) return;

    setIsSending(true);

    const templateParams = {
      to_email: notificationSettings.targetEmail,
      company_name: formData.companyName,
      report_content: getReportContent(),
      date_time: new Date().toLocaleString('tr-TR'),
      subject: 'Stok Raporu'
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
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (window.confirm("Bu işlem mevcut verilerin üzerine yazacaktır. Devam etmek istiyor musunuz?")) {
                  importSystemData(json);
              }
          } catch (err) {
              alert("Dosya okunamadı veya format hatalı.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  // --- SIFIRLAMA ---
  const handleHardReset = () => {
    if (window.confirm("DİKKAT: TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Onaylıyor musunuz?")) {
        resetSystem();
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

            {/* 2. E-POSTA RAPORLAMA */}
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                <Bell size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">RAPORLAMA</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Rapor E-postası</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input type="email" value={notificationSettings.targetEmail} onChange={(e) => setNotificationSettings({...notificationSettings, targetEmail: e.target.value})} className="w-full pl-12 pr-4 py-3 border border-neutral-200 outline-none focus:border-neutral-900 font-light" placeholder="mail@sirketiniz.com" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSendReport} className="flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 px-4 py-2 hover:bg-neutral-50 transition-colors">
                        <Send size={16} /> <span className="text-xs font-medium uppercase">Anlık E-posta Raporu</span>
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
                
                {/* 3. DEMO VERİ BUTONU (EKLENDİ) */}
                <button onClick={handleLoadDemoData} className="w-full flex items-center justify-between p-4 border border-neutral-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group">
                  <div>
                      <span className="flex items-center gap-2 text-neutral-900 font-medium text-sm">
                        <RefreshCcw size={16} className="text-purple-600"/> Demo Verisi Yükle
                      </span>
                      <span className="text-neutral-400 text-xs font-light block mt-1">Sistemi 1 yıllık örnek veri ile doldur.</span>
                  </div>
                  <Database size={18} className="text-neutral-300 group-hover:text-purple-600 transition-colors" />
                </button>

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
                <button onClick={handleRestoreClick} className="w-full flex items-center justify-between p-4 border border-neutral-200 hover:border-green-300 hover:bg-green-50 transition-all text-left group">
                  <div>
                      <span className="flex items-center gap-2 text-neutral-900 font-medium text-sm"><Upload size={16} className="text-green-500"/> Yedeği Geri Yükle</span>
                      <span className="text-neutral-400 text-xs font-light block mt-1">JSON dosyasından verileri kurtar.</span>
                  </div>
                  <Upload size={18} className="text-neutral-300 group-hover:text-green-600 transition-colors" />
                </button>

                {/* HARD RESET */}
                <div className="pt-4 border-t border-neutral-100 mt-2">
                  <button onClick={handleHardReset} className="w-full flex items-center justify-center gap-2 p-4 border border-red-100 bg-red-50 text-red-700 hover:bg-red-100 transition-all">
                      <Trash2 size={16} /> <span className="font-light text-sm tracking-wide">FABRİKA AYARLARINA DÖN</span>
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
                <div className="pt-4 text-center text-[10px] text-neutral-500">Edition Coffee Roastery v1.2.5</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
