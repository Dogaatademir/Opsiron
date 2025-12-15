import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Globe, 
  Database, 
  Building, 
  Bell, 
  Download, 
  Trash2,
  Moon,
  Sun,
  ShieldCheck,
  Send,
  Mail,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Package,
  Coffee,
  Sticker,
  Box
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { SystemSettings } from '../context/StoreContext';

export const SettingsPage = () => {
  // Context'ten verileri ve güncelleme fonksiyonunu alıyoruz
  const { 
    settings,           
    updateSettings,     
    greenCoffees, 
    roastStocks, 
    packagingItems, 
    
  } = useStore();

  // --- FORM STATE ---
  const [formData, setFormData] = useState<SystemSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlert: true,
    productionReport: true,
    targetEmail: 'info@editioncoffee.com'
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lastBackup, setLastBackup] = useState<string>('Henüz Alınmadı');

  // --- HANDLERS ---
  const handleGeneralChange = (field: keyof SystemSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  // --- RAPORLAMA ---
  const generateReportText = () => {
    const today = new Date().toLocaleDateString('tr-TR');
    const t = formData.thresholds;
    
    const criticalGreen = greenCoffees.filter(c => c.stockKg < t.greenCoffee.critical);
    const criticalRoast = roastStocks.filter(s => s.stockKg < t.roastStock.critical);
    const criticalPack = packagingItems.filter(p => {
        if (p.category === 'Bag') return p.stockQuantity < t.bag.critical;
        if (p.category === 'Label') return p.stockQuantity < t.label.critical;
        if (p.category === 'Box') return p.stockQuantity < t.box.critical;
        return p.stockQuantity < 50;
    });

    let report = `TARİH: ${today}\nŞİRKET: ${formData.companyName}\nKONU: DURUM RAPORU\n\n`;
    
    report += `KRİTİK STOKLAR:\n`;
    if (criticalGreen.length) criticalGreen.forEach(c => report += `- [Yeşil] ${c.name}: ${c.stockKg}kg (Sınır: ${t.greenCoffee.critical})\n`);
    if (criticalRoast.length) criticalRoast.forEach(s => report += `- [Kavrulmuş] ${s.name}: ${s.stockKg}kg (Sınır: ${t.roastStock.critical})\n`);
    if (criticalPack.length) criticalPack.forEach(p => report += `- [Paketleme] ${p.name}: ${p.stockQuantity}ad\n`);
    
    if (!criticalGreen.length && !criticalRoast.length && !criticalPack.length) report += "Tüm stoklar iyi durumda.\n";

    return report;
  };

  const handleSendReport = () => {
    if (!notificationSettings.targetEmail) { alert("Lütfen e-posta giriniz."); return; }
    window.location.href = `mailto:${notificationSettings.targetEmail}?subject=Rapor&body=${encodeURIComponent(generateReportText())}`;
  };

  // --- YENİ YEDEKLEME FONKSİYONU (OKUNABİLİR TXT) ---
  const handleExportData = () => {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const line = "------------------------------------------------------------------------------------------\n";
    const doubleLine = "==========================================================================================\n";
    
    // Yardımcı fonksiyon: Sütun hizalama
    const pad = (str: string, length: number) => (str || "").toString().padEnd(length).slice(0, length);

    let content = "";

    // BAŞLIK
    content += doubleLine;
    content += ` ${formData.companyName.toUpperCase()} - STOK ENVANTER RAPORU\n`;
    content += ` Tarih: ${today}\n`;
    content += doubleLine;
    content += "\n";

    // 1. YEŞİL ÇEKİRDEK BÖLÜMÜ
    content += "[1] YEŞİL ÇEKİRDEK STOĞU (HAM)\n";
    content += line;
    content += `${pad("ÜRÜN ADI", 30)} | ${pad("MENŞEİ", 15)} | ${pad("İŞLEM", 15)} | ${pad("STOK (KG)", 10)}\n`;
    content += line;
    
    let totalGreen = 0;
    greenCoffees.forEach(g => {
        content += `${pad(g.name, 30)} | ${pad(g.origin, 15)} | ${pad(g.process, 15)} | ${pad(g.stockKg + " kg", 10)}\n`;
        totalGreen += g.stockKg;
    });
    content += line;
    content += `${pad("TOPLAM YEŞİL STOK:", 66)} ${totalGreen.toFixed(1)} kg\n\n\n`;


    // 2. KAVRULMUŞ KAHVE BÖLÜMÜ
    content += "[2] KAVRULMUŞ KAHVE STOĞU\n";
    content += line;
    content += `${pad("ÜRÜN ADI", 30)} | ${pad("KAVURMA PROFİLİ", 20)} | ${pad("KAV. TARİHİ", 15)} | ${pad("STOK (KG)", 10)}\n`;
    content += line;

    let totalRoast = 0;
    roastStocks.forEach(r => {
        content += `${pad(r.name, 30)} | ${pad(r.roastLevel, 20)} | ${pad(r.roastDate, 15)} | ${pad(r.stockKg + " kg", 10)}\n`;
        totalRoast += r.stockKg;
    });
    content += line;
    content += `${pad("TOPLAM KAVRULMUŞ STOK:", 69)} ${totalRoast.toFixed(1)} kg\n\n\n`;


    // 3. AMBALAJ VE PAKETLEME
    content += "[3] AMBALAJ VE PAKETLEME MALZEMELERİ\n";
    content += line;
    content += `${pad("KATEGORİ", 15)} | ${pad("ÜRÜN ADI", 35)} | ${pad("MARKA", 15)} | ${pad("ADET", 10)}\n`;
    content += line;

    packagingItems.sort((a,b) => a.category.localeCompare(b.category)).forEach(p => {
        const catTR = p.category === 'Bag' ? 'TORBA' : p.category === 'Label' ? 'ETİKET' : p.category === 'Box' ? 'KOLİ' : 'DİĞER';
        content += `${pad(catTR, 15)} | ${pad(p.name, 35)} | ${pad(p.brand, 15)} | ${pad(p.stockQuantity + " ad", 10)}\n`;
    });
    content += line;
    content += "\n\n";

    // 4. SİSTEM BİLGİSİ
    content += doubleLine;
    content += " SİSTEM AYARLARI VE EŞİKLER\n";
    content += doubleLine;
    content += ` Firma Adı: ${formData.companyName}\n`;
    content += ` Para Birimi: ${formData.currency}\n`;
    content += ` Kritik Stok Sınırları:\n`;
    content += ` - Yeşil Çekirdek: ${formData.thresholds.greenCoffee.critical} kg altı\n`;
    content += ` - Kavrulmuş Kahve: ${formData.thresholds.roastStock.critical} kg altı\n`;
    content += ` - Torbalar: ${formData.thresholds.bag.critical} adet altı\n`;
    content += doubleLine;

    // Dosyayı İndirme İşlemi
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", `Stok_Raporu_${new Date().toISOString().slice(0,10)}.txt`);
    
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setLastBackup(new Date().toLocaleString('tr-TR'));
  };

  const handleResetData = () => {
    if (window.confirm("DİKKAT: Tüm veriler silinecek! Emin misiniz?")) alert("Demo Modu: Sıfırlama simüle edildi.");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">AYARLAR</h1>
              <p className="text-neutral-500 mt-1 font-light">Sistem yapılandırması, eşik değerleri ve tercihler</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <Settings className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL KOLON */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. GENEL AYARLAR */}
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                <Building size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">GENEL BİLGİLER</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Şirket Adı</label>
                  <input 
                    type="text" 
                    value={formData.companyName} 
                    onChange={(e) => handleGeneralChange('companyName', e.target.value)} 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 outline-none focus:border-neutral-900 focus:bg-white transition-all font-light"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Para Birimi</label>
                    <select 
                      value={formData.currency} 
                      onChange={(e) => handleGeneralChange('currency', e.target.value)} 
                      className="w-full px-4 py-3 bg-white border border-neutral-200 outline-none focus:border-neutral-900 appearance-none font-light"
                    >
                      <option value="TRY">Türk Lirası (₺)</option>
                      <option value="USD">Amerikan Doları ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Dil</label>
                    <div className="flex items-center gap-2 px-4 py-3 border border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed">
                      <Globe size={16} strokeWidth={1.5}/>
                      <span className="text-sm font-light">Türkçe (TR)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. STOK EŞİK YAPILANDIRMASI */}
            <div className="bg-white border border-neutral-200">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sliders size={18} className="text-neutral-400" strokeWidth={1.5} />
                        <h2 className="text-lg font-light tracking-tight text-neutral-900">STOK EŞİK AYARLARI</h2>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[10px] uppercase font-medium tracking-wider">
                        <span className="flex items-center gap-1 text-red-600"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Kritik</span>
                        <span className="flex items-center gap-1 text-amber-600"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Az/Uyarı</span>
                        <span className="flex items-center gap-1 text-green-600"><div className="w-2 h-2 bg-green-500 rounded-full"></div> İyi</span>
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
                                {/* Kritik Input */}
                                <div className="flex-1">
                                    <label className="block text-[10px] text-red-600 font-medium mb-1 uppercase tracking-wider">Kritik (Red)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.thresholds[item.key as keyof typeof formData.thresholds].critical}
                                            onChange={(e) => handleThresholdChange(item.key as keyof typeof formData.thresholds, 'critical', Number(e.target.value))}
                                            className="w-full pl-3 pr-8 py-2 bg-white border border-red-200 text-red-800 text-sm font-light focus:border-red-500 outline-none transition-colors"
                                        />
                                        <AlertTriangle size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400"/>
                                    </div>
                                </div>
                                {/* Az Input */}
                                <div className="flex-1">
                                    <label className="block text-[10px] text-amber-600 font-medium mb-1 uppercase tracking-wider">Az (Amber)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.thresholds[item.key as keyof typeof formData.thresholds].low}
                                            onChange={(e) => handleThresholdChange(item.key as keyof typeof formData.thresholds, 'low', Number(e.target.value))}
                                            className="w-full pl-3 pr-8 py-2 bg-white border border-amber-200 text-amber-800 text-sm font-light focus:border-amber-500 outline-none transition-colors"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-[10px] text-neutral-400 text-right">
                                {item.unit} bazında
                            </div>
                        </div>
                    ))}
                </div>
                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-500 font-light italic">
                    Not: Kaydet butonuna bastığınızda bu eşik değerleri tüm sayfalardaki renk kodlarını güncelleyecektir.
                </div>
            </div>

            {/* 3. RAPORLAMA */}
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                <Bell size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">RAPORLAMA & BİLDİRİMLER</h2>
              </div>
              <div className="p-6 space-y-8">
                <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Rapor Gönderilecek E-posta</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={1.5} />
                        <input 
                            type="email" 
                            value={notificationSettings.targetEmail} 
                            onChange={(e) => setNotificationSettings({...notificationSettings, targetEmail: e.target.value})} 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 outline-none focus:border-neutral-900 transition-all font-light" 
                            placeholder="mail@sirketiniz.com"
                        />
                    </div>
                </div>
                <div className="p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-neutral-900">Anlık Durum Raporu</h3>
                        <p className="text-xs text-neutral-500 font-light mt-1">Stok ve üretim özetini anında e-posta ile gönder.</p>
                    </div>
                    <button onClick={handleSendReport} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 transition-colors active:scale-[0.99]">
                        <Send size={16} strokeWidth={1.5} />
                        <span className="text-xs font-light tracking-wider uppercase">RAPORU GÖNDER</span>
                    </button>
                </div>
                
                {/* Toggle Butonları */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-900 font-light text-sm">Düşük Stok Uyarıları</p>
                      <p className="text-neutral-400 text-xs font-light">Kritik seviyenin altındaki ürünler için panelde uyarı ver.</p>
                    </div>
                    <button 
                      onClick={() => setNotificationSettings(prev => ({...prev, lowStockAlert: !prev.lowStockAlert}))} 
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${notificationSettings.lowStockAlert ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${notificationSettings.lowStockAlert ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between opacity-60">
                    <div>
                      <p className="text-neutral-900 font-light text-sm">Otomatik Haftalık Rapor</p>
                      <p className="text-neutral-400 text-xs font-light">Her Pazartesi özeti otomatik gönder.</p>
                    </div>
                    <button 
                      onClick={() => setNotificationSettings(prev => ({...prev, productionReport: !prev.productionReport}))} 
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${notificationSettings.productionReport ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${notificationSettings.productionReport ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KAYDET BUTONU */}
            <div className="flex justify-end sticky bottom-6 z-10">
              <button 
                onClick={handleSave} 
                className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 shadow-lg hover:bg-neutral-800 transition-all active:scale-[0.99] hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save size={18} strokeWidth={1.5} />
                <span className="font-light tracking-widest text-sm">DEĞİŞİKLİKLERİ KAYDET</span>
              </button>
            </div>
          </div>

          {/* SAĞ KOLON: SİSTEM */}
          <div className="space-y-6">
             <div className="bg-white border border-neutral-200 p-6">
                  <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Uygulama Teması</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 py-3 border transition-all ${theme === 'light' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}>
                        <Sun size={16} strokeWidth={1.5} /><span className="text-sm font-light tracking-wide">AÇIK</span>
                    </button>
                    <button onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 py-3 border transition-all ${theme === 'dark' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}>
                        <Moon size={16} strokeWidth={1.5} /><span className="text-sm font-light tracking-wide">KOYU</span>
                    </button>
                  </div>
             </div>

            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                <Database size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">VERİ YÖNETİMİ</h2>
              </div>
              <div className="p-6 space-y-4">
                <button onClick={handleExportData} className="w-full flex items-center justify-between p-4 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left group">
                  <div>
                      <span className="block text-neutral-900 font-light text-sm">Verileri İndir (Stok Raporu)</span>
                      <span className="text-neutral-400 text-xs font-light">Okunabilir .txt formatında döküm al</span>
                  </div>
                  <Download size={18} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" strokeWidth={1.5} />
                </button>
                <div className="pt-4 border-t border-neutral-100">
                  <button onClick={handleResetData} className="w-full flex items-center justify-center gap-2 p-4 border border-red-100 bg-red-50 text-red-700 hover:bg-red-100 transition-all">
                      <Trash2 size={16} strokeWidth={1.5} />
                      <span className="font-light text-sm tracking-wide">SİSTEMİ SIFIRLA</span>
                  </button>
                  <p className="text-center text-[10px] text-neutral-400 mt-2 font-light">Bu işlem tüm veritabanını temizler ve geri alınamaz.</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 text-white p-6 border border-neutral-900">
              <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={18} className="text-neutral-400" strokeWidth={1.5} />
                  <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">SİSTEM DURUMU</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <span className="text-sm font-light text-neutral-300">Versiyon</span><span className="text-sm font-light">v1.2.5 (Stable)</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <span className="text-sm font-light text-neutral-300">Son Yedekleme</span><span className="text-sm font-light">{lastBackup}</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <span className="text-sm font-light text-neutral-300">Lisans</span>
                    <div className="flex items-center gap-1.5 text-green-500">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span className="text-sm font-light">Aktif</span>
                    </div>
                </div>
                <div className="pt-2 text-center">
                    <p className="text-[10px] text-neutral-500 font-light">Edition Coffee Roastery Management System<br/>© 2024 Tüm hakları saklıdır.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};