import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Save, Database, Bell, Download, Upload, Trash2, ShieldCheck, 
  Send, Mail, Sliders, CheckCircle2, Package, Coffee, Sticker, Box, FileJson, Loader2, CalendarClock,
  User, Lock, Eye, EyeOff, UserPlus, Users, ChevronUp, ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../context/supabase';
import type { SystemSettings } from '../context/StoreContext';
import emailjs from '@emailjs/browser';

// Kullanıcı Tipi Tanımı
interface AppUser {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

export const SettingsPage = () => {
  const { 
    settings, updateSettings, importSystemData, resetSystem, generateTextReport,
    greenCoffees, roastStocks, packagingItems, recipes, productionLogs, 
    orders, sales, quotes, purchases, parties, categories, ledgerEntries, payments, inventoryMovements  
  } = useStore();

  const [formData, setFormData] = useState<SystemSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSending, setIsSending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // --- KULLANICI YÖNETİMİ STATE'LERİ ---
  const [users, setUsers] = useState<AppUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Maksimum kullanıcı sayısı limiti
  const MAX_USERS = 4;

  const [lastBackup, setLastBackup] = useState<string>('Henüz Alınmadı');

  // --- BÖLÜM AÇ/KAPA STATE'LERİ ---
  const [isStockOpen, setIsStockOpen] = useState(true);
  const [isFxOpen, setIsFxOpen] = useState(true);
  const [isReportingOpen, setIsReportingOpen] = useState(true);
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const [isDataOpen, setIsDataOpen] = useState(true);

  useEffect(() => {
    setFormData(settings);
    fetchUsers();
  }, [settings]);

  // --- KULLANICI LİSTELEME ---
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (data) setUsers(data as AppUser[]);
    } catch (error) {
      console.error("Kullanıcılar çekilemedi:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // --- STOK EŞİĞİ DEĞİŞİMİ ---
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

  // --- YENİ KULLANICI EKLEME ---
  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      setUserMessage('Lütfen kullanıcı adı ve şifre giriniz.');
      return;
    }

    if (users.length >= MAX_USERS) {
      setUserMessage(`Maksimum ${MAX_USERS} kullanıcı sınırına ulaşıldı.`);
      return;
    }

    if (users.some(u => u.username === newUsername)) {
      setUserMessage('Bu kullanıcı adı zaten mevcut.');
      return;
    }

    setIsUpdatingUser(true);
    setUserMessage('');

    try {
      const { error: insertError } = await supabase.from('app_users').insert({
        username: newUsername,
        password: newPassword // Düz metin
      });

      if (insertError) throw insertError;

      setUserMessage('Yeni kullanıcı başarıyla eklendi!');
      setNewUsername('');
      setNewPassword('');
      await fetchUsers();
      setTimeout(() => setUserMessage(''), 3000);

    } catch (error) {
      console.error('Kullanıcı ekleme hatası:', error);
      setUserMessage('Ekleme sırasında hata oluştu.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // --- KULLANICI SİLME ---
  const handleDeleteUser = async (id: string, username: string) => {
    if (!window.confirm(`${username} kullanıcısını silmek istediğinize emin misiniz?`)) return;

    try {
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Kullanıcı silinemedi.");
    }
  };

  // --- RAPOR GÖNDERME ---
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
        throw new Error('EmailJS env eksik');
      }

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      alert("Rapor başarıyla gönderildi.");
    } catch (err) {
      console.error('EmailJS hata:', err);
      alert("E-posta gönderilemedi.");
    } finally {
      setIsSending(false);
    }
  };

  // --- BACKUP & RESTORE & RESET ---
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

  const handleRestoreClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (window.confirm("DİKKAT: Veritabanı silinecek ve yedek yüklenecek. Onaylıyor musunuz?")) {
          setIsRestoring(true);
          try {
            await importSystemData(json);
            alert("Yedek başarıyla yüklendi.");
          } catch (error) {
            alert("Yükleme hatası.");
          } finally {
            setIsRestoring(false);
          }
        }
      } catch (err) {
        alert("Dosya hatası.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleHardReset = async () => {
    if (window.confirm("DİKKAT: SİSTEM FABRİKA AYARLARINA DÖNECEK!")) {
      setIsResetting(true);
      try {
        await resetSystem();
        alert("Sistem sıfırlandı.");
      } catch (error) {
        alert("Hata oluştu.");
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ÜST BAR */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">AYARLAR</h1>
              <p className="text-neutral-500 mt-1 font-light">
                Sistem yapılandırması, uyarılar, döviz, kullanıcılar ve veri yönetimi
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <Settings className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* ANA İÇERİK */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
        <div className="space-y-8">
          {/* 1. STOK EŞİKLERİ */}
          <div className="bg-white border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sliders size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">
                  STOK EŞİK AYARLARI
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsStockOpen(prev => !prev)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                {isStockOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            {isStockOpen && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                {[
                  { key: 'greenCoffee', label: 'Yeşil Çekirdek', unit: 'KG', icon: Coffee },
                  { key: 'roastStock', label: 'Kavrulmuş Kahve', unit: 'KG', icon: Coffee },
                  { key: 'bag', label: 'Torbalar', unit: 'ADET', icon: Package },
                  { key: 'label', label: 'Etiketler', unit: 'ADET', icon: Sticker },
                  { key: 'box', label: 'Koliler', unit: 'ADET', icon: Box },
                  { key: 'finishedProduct', label: 'Paketli Ürünler', unit: 'PKT', icon: CheckCircle2 },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="bg-neutral-50 p-4 border border-neutral-100 rounded-sm"
                  >
                    <div className="flex items-center gap-2 mb-4 text-neutral-900 font-normal">
                      <item.icon size={16} strokeWidth={1.5} className="text-neutral-400" />
                      {item.label}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={
                            formData.thresholds[item.key as keyof typeof formData.thresholds].critical
                          }
                          onChange={(e) =>
                            handleThresholdChange(
                              item.key as keyof typeof formData.thresholds,
                              'critical',
                              Number(e.target.value)
                            )
                          }
                          className="w-full pl-3 pr-2 py-2 bg-white border border-red-200 text-red-800 text-sm focus:border-red-500 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={
                            formData.thresholds[item.key as keyof typeof formData.thresholds].low
                          }
                          onChange={(e) =>
                            handleThresholdChange(
                              item.key as keyof typeof formData.thresholds,
                              'low',
                              Number(e.target.value)
                            )
                          }
                          className="w-full pl-3 pr-2 py-2 bg-white border border-amber-200 text-amber-800 text-sm focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. DÖVİZ KURLARI */}
          <div className="bg-white border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">DÖVİZ KURLARI</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFxOpen(prev => !prev)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                {isFxOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            {isFxOpen && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">
                    USD / TL
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.exchangeRates.usd}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        exchangeRates: {
                          ...prev.exchangeRates,
                          usd: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full pl-3 pr-4 py-2 border border-neutral-200 outline-none focus:border-neutral-900 font-light"
                    placeholder="Örn: 35.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">
                    EUR / TL
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.exchangeRates.eur}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        exchangeRates: {
                          ...prev.exchangeRates,
                          eur: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full pl-3 pr-4 py-2 border border-neutral-200 outline-none focus:border-neutral-900 font-light"
                    placeholder="Örn: 38.00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. RAPORLAMA & OTOMASYON */}
          <div className="bg-white border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">
                  RAPORLAMA & OTOMASYON
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsReportingOpen(prev => !prev)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                {isReportingOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            {isReportingOpen && (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">
                    Rapor E-postası
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={formData.targetEmail || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetEmail: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 border border-neutral-200 outline-none focus:border-neutral-900 font-light"
                      placeholder="mail@sirketiniz.com"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-sm">
                  <div className="flex items-center gap-3">
                    <CalendarClock
                      size={20}
                      className={
                        formData.enableWeeklyReport ? 'text-neutral-900' : 'text-neutral-400'
                      }
                    />
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900">Otomatik Rapor</h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Her Pazartesi 09:00'da rapor ve yedek gönderilir.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.enableWeeklyReport || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enableWeeklyReport: e.target.checked,
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-neutral-900 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSendReport}
                    disabled={isSending}
                    className="flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 px-4 py-2 hover:bg-neutral-50 transition-colors disabled:opacity-60"
                  >
                    <Send size={16} />{' '}
                    <span className="text-xs font-medium uppercase">
                      {isSending ? 'GÖNDERİLİYOR...' : 'Test Raporu Gönder'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. KULLANICI HESAP YÖNETİMİ */}
          <div className="bg-white border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">
                  KULLANICI YÖNETİMİ
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium px-3 py-1 bg-neutral-100 rounded-full text-neutral-600">
                  {users.length-1} / {MAX_USERS - 1} Kullanıcı
                </div>
                <button
                  type="button"
                  onClick={() => setIsUsersOpen(prev => !prev)}
                  className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
                >
                  {isUsersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {isUsersOpen && (
              <div className="p-6 space-y-8">
                {/* MEVCUT KULLANICILAR */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    Mevcut Kullanıcılar
                  </h3>
                  {isLoadingUsers ? (
                    <div className="text-center py-4 text-neutral-400">
                      <Loader2 className="animate-spin mx-auto" />
                    </div>
                  ) : users.filter((u) => u.username !== 'admin').length === 0 ? (
                    <div className="text-sm text-neutral-400 italic">
                      Kayıtlı ekstra kullanıcı bulunamadı.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {users
                        .filter((user) => user.username !== 'admin')
                        .map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-sm group hover:border-neutral-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-neutral-100 text-neutral-500">
                                <User size={14} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {user.username}
                                </div>
                                <div className="text-[10px] text-neutral-400 font-mono tracking-wider">
                                  Pass: ••••••••
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="text-neutral-300 hover:text-red-500 transition-colors p-2"
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-neutral-200" />

                {/* YENİ KULLANICI EKLE */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserPlus size={14} /> Yeni Kullanıcı Ekle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-400 mb-1 block uppercase">
                        Kullanıcı Adı
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-3 text-neutral-400" />
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 text-sm focus:border-neutral-900 outline-none"
                          placeholder="Kullanıcı adı"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-neutral-400 mb-1 block uppercase">
                        Şifre
                      </label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-3 text-neutral-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 bg-white border border-neutral-200 text-sm focus:border-neutral-900 outline-none"
                          placeholder="Şifre"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2.5 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddUser}
                      disabled={isUpdatingUser || users.length >= MAX_USERS}
                      className={`flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors h-[38px] ${
                        isUpdatingUser || users.length >= MAX_USERS
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {isUpdatingUser ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {users.length >= MAX_USERS ? 'KOTA DOLU' : 'EKLE'}
                    </button>
                  </div>

                  <div className="mt-3 min-h-[20px]">
                    {userMessage && (
                      <span
                        className={`text-xs font-medium ${
                          userMessage.includes('hata') ||
                          userMessage.includes('dolu') ||
                          userMessage.includes('mevcut')
                            ? 'text-red-500'
                            : 'text-green-600'
                        }`}
                      >
                        {userMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. VERİ YÖNETİMİ */}
          <div className="bg-white border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-neutral-400" strokeWidth={1.5} />
                <h2 className="text-lg font-light tracking-tight text-neutral-900">VERİ YÖNETİMİ</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDataOpen(prev => !prev)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
              >
                {isDataOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            {isDataOpen && (
              <div className="p-6 space-y-4">
                <button
                  onClick={handleBackup}
                  className="w-full flex items-center justify-between p-4 border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                >
                  <div>
                    <span className="flex items-center gap-2 text-neutral-900 font-medium text-sm">
                      <FileJson size={16} className="text-blue-500" />
                      Tam Sistem Yedeği Al (JSON)
                    </span>
                  </div>
                  <Download
                    size={18}
                    className="text-neutral-300 group-hover:text-blue-600 transition-colors"
                  />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={handleRestoreClick}
                  disabled={isRestoring || isResetting}
                  className={`w-full flex items-center justify-between p-4 border border-neutral-200 transition-all text-left group ${
                    isRestoring ? 'bg-neutral-100 cursor-not-allowed' : 'hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div>
                    <span className="flex items-center gap-2 text-neutral-900 font-medium text-sm">
                      {isRestoring ? (
                        <Loader2 size={16} className="animate-spin text-green-600" />
                      ) : (
                        <Upload size={16} className="text-green-500" />
                      )}
                      {isRestoring ? 'Yükleniyor...' : 'Yedeği Geri Yükle'}
                    </span>
                  </div>
                </button>

                <div className="pt-4 border-t border-neutral-100 mt-2">
                  <button
                    onClick={handleHardReset}
                    disabled={isRestoring || isResetting}
                    className={`w-full flex items-center justify-center gap-2 p-4 border border-red-100 text-red-700 transition-all ${
                      isResetting ? 'bg-red-50 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    {isResetting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    <span className="font-light text-sm tracking-wide">
                      {isResetting ? 'SIFIRLANIYOR...' : 'FABRİKA AYARLARINA DÖN'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. SİSTEM ÖZETİ (SABİT, KÜÇÜLME YOK) */}
          <div className="bg-neutral-900 text-white p-6 border border-neutral-900">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={18} className="text-neutral-400" />
              <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">
                SİSTEM ÖZETİ
              </h2>
            </div>
            <div className="space-y-3 text-sm font-light">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span>Siparişler</span>
                <span>{orders.length}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span>Üretim Kayıtları</span>
                <span>{productionLogs.length}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span>Finans Kayıtları</span>
                <span>{ledgerEntries.length}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span>Son Yedekleme</span>
                <span className="text-neutral-400">{lastBackup}</span>
              </div>
              <div className="pt-4 text-center text-[10px] text-neutral-500">
                Edition Coffee Roastery v1.2.7
              </div>
            </div>
          </div>

          {/* 7. KAYDET BUTONU */}
          <div className="flex justify-end sticky bottom-6 z-10">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 shadow-lg hover:bg-neutral-800 transition-all active:scale-[0.99]"
            >
              <Save size={18} />{' '}
              <span className="font-light tracking-widest text-sm">DEĞİŞİKLİKLERİ KAYDET</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
