import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Package, Sticker, Box, AlertTriangle, CheckCircle2, Coins, ShoppingBag, User, AlertCircle, UserPlus } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CustomSelect, type SelectOption } from '../components/CustomSelect'; // YENİ: CustomSelect Eklendi
import { useStore } from '../context/StoreContext';
import type { PackagingItem } from '../context/StoreContext';

export const PackagingPage = () => {
  const { 
    packagingItems, 
    settings, 
    addPackagingItem, 
    updatePackagingItem, 
    deletePackagingItem, 
    recordPurchase, 
    parties,
    addParty
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'Bag' | 'Label' | 'Box'>('Bag');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'NEW' | 'EDIT' | 'RESTOCK'>('NEW');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  
  // --- DÖVİZ ENTEGRASYONU ---
  const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');
  const currencyOptions: SelectOption[] = [
    { value: 'TRY', label: 'TL' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' }
  ];

  const [formData, setFormData] = useState<Omit<PackagingItem, 'id'>>({ category: 'Bag', brand: 'Genel', name: '', variant: '250g', color: 'White', labelType: 'Front', stockQuantity: 0, minThreshold: 50 });
  
  const [purchaseData, setPurchaseData] = useState({
      supplierId: '',
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0]
  });

  const suppliers = parties.filter(p => p.type === 'Supplier' && p.status === 'Active');

  // --- YARDIMCI FONKSİYONLAR (KUR HESABI) ---
  const getFxRateForCurrentCurrency = () => {
    if (currency === 'USD') return settings.exchangeRates?.usd || 0;
    if (currency === 'EUR') return settings.exchangeRates?.eur || 0;
    return 1; // TRY
  };

  const getCostInTry = () => {
    const amount = purchaseData.cost || 0;
    if (!amount) return 0;
    const rate = getFxRateForCurrentCurrency();
    if ((currency === 'USD' || currency === 'EUR') && !rate) return 0;
    return amount * rate;
  };

  const openModal = (mode: 'NEW' | 'EDIT' | 'RESTOCK', item?: PackagingItem) => {
    setModalMode(mode);
    setPurchaseData({ supplierId: '', cost: 0, date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0] });
    setCurrency('TRY'); // Modal açılışında sıfırla

    if (item) {
      setActiveId(item.id);
      if (mode === 'EDIT') {
          setFormData({ category: item.category, brand: item.brand, name: item.name, variant: item.variant || '', labelType: item.labelType || 'Front', color: item.color || 'White', stockQuantity: item.stockQuantity, minThreshold: item.minThreshold });
      } else if (mode === 'RESTOCK') {
          setFormData({ category: item.category, brand: item.brand, name: item.name, variant: item.variant || '', labelType: item.labelType || 'Front', color: item.color || 'White', stockQuantity: 0, minThreshold: item.minThreshold });
      }
    } else {
      setActiveId(null);
      const defaultVariant = (activeTab === 'Bag' || activeTab === 'Label') ? '250g' : '';
      setFormData({ category: activeTab, brand: 'Genel', name: '', variant: defaultVariant, labelType: 'Front', color: 'White', stockQuantity: 0, minThreshold: 50 });
    }
    setIsModalOpen(true);
  };

  const handleCreateSupplier = () => {
      if(!newSupplierName) return alert("Tedarikçi adı giriniz.");
      addParty({ id: `PRT-${Date.now()}`, type: 'Supplier', name: newSupplierName, status: 'Active' });
      setIsPartyModalOpen(false);
      setNewSupplierName('');
  };

  const handleSubmit = (e: React.FormEvent) => { 
      e.preventDefault(); 
      
      // Kur kontrolü
      const fxRate = getFxRateForCurrentCurrency();
      if ((currency === 'USD' || currency === 'EUR') && !fxRate) {
        alert(`${currency} kuru tanımlı değil. Lütfen Ayarlar > Döviz Kurları bölümünü güncelleyin.`);
        return;
      }

      // TL Karşılığı Hesapla
      const totalCostTRY = getCostInTry();

      if (modalMode === 'EDIT' && activeId) {
          updatePackagingItem({ ...formData, id: activeId });
          alert('Malzeme kartı güncellendi.');
      }
      else if (modalMode === 'NEW') {
          const newId = `PKG-${Math.floor(Math.random()*9000)+1000}`;
          
          const initialStock = formData.stockQuantity;
          // Ortalama maliyeti TL üzerinden hesapla
          const calculatedAvgCost = initialStock > 0 ? totalCostTRY / initialStock : 0;

          addPackagingItem({ 
              ...formData, 
              id: newId, 
              stockQuantity: initialStock, 
              averageCost: calculatedAvgCost 
          });
          
          const supplier = suppliers.find(s => s.id === purchaseData.supplierId);
          recordPurchase({
              id: `PUR-${Date.now()}`,
              date: purchaseData.date,
              dueDate: purchaseData.dueDate,
              supplierId: purchaseData.supplierId,
              supplier: supplier ? supplier.name : 'Bilinmeyen',
              category: 'Packaging',
              categoryId: 'CAT-002',
              itemId: newId,
              itemName: `${formData.brand} - ${formData.name}`,
              quantity: initialStock,
              cost: totalCostTRY, // TL olarak kaydet
              status: 'Active'
          });
          alert('Yeni malzeme ve maliyet tanımlandı.');
      }
      else if (modalMode === 'RESTOCK' && activeId) {
          const supplier = suppliers.find(s => s.id === purchaseData.supplierId);
          recordPurchase({
              id: `PUR-${Date.now()}`,
              date: purchaseData.date,
              dueDate: purchaseData.dueDate,
              supplierId: purchaseData.supplierId,
              supplier: supplier ? supplier.name : 'Bilinmeyen',
              category: 'Packaging',
              categoryId: 'CAT-002',
              itemId: activeId,
              itemName: `${formData.brand} - ${formData.name}`,
              quantity: formData.stockQuantity,
              cost: totalCostTRY, // TL olarak kaydet
              status: 'Active'
          });
          alert('Satın alım eklendi, stok güncellendi.');
      }
      
      setIsModalOpen(false); 
  };
  
  const handleDelete = (id: string) => { if (window.confirm('Silinsin mi?')) deletePackagingItem(id); };
  const filteredItems = packagingItems.filter(item => item.category === activeTab).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  const costInTryPreview = getCostInTry();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
            <div><h1 className="text-4xl font-light tracking-tight text-neutral-900">PAKETLEME</h1><p className="text-neutral-500 mt-1 font-light">Torba, etiket ve koli envanteri</p></div>
            <button onClick={() => openModal('NEW')} className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 hover:bg-neutral-800 transition-all active:scale-[0.99] font-light tracking-wide"><Plus size={18}/> <span>YENİ MALZEME EKLE</span></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative md:col-span-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} strokeWidth={1.5} />
                <input type="text" placeholder="Malzeme ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 outline-none font-light focus:border-neutral-900"/>
            </div>
            <div className="md:col-span-2 grid grid-cols-3 gap-3">
                {[{ id: 'Bag', label: 'TORBALAR', icon: Package }, { id: 'Label', label: 'ETİKETLER', icon: Sticker }, { id: 'Box', label: 'KOLİLER', icon: Box }].map((cat) => (
                    <button key={cat.id} onClick={() => setActiveTab(cat.id as any)} className={`flex items-center justify-center gap-2 py-4 text-sm font-light tracking-wide border ${activeTab === cat.id ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200'}`}><cat.icon size={16}/><span className="uppercase">{cat.label}</span></button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const isDark = item.color === 'Black';
            let thresholdCritical = 50; let thresholdLow = 100;
            if (item.category === 'Bag') { thresholdCritical = settings.thresholds.bag.critical; thresholdLow = settings.thresholds.bag.low; }
            else if (item.category === 'Label') { thresholdCritical = settings.thresholds.label.critical; thresholdLow = settings.thresholds.label.low; }
            else if (item.category === 'Box') { thresholdCritical = settings.thresholds.box.critical; thresholdLow = settings.thresholds.box.low; }
            const isCritical = item.stockQuantity < thresholdCritical;
            const isLow = item.stockQuantity < thresholdLow;
            const borderColor = isCritical ? 'border-l-red-500' : isLow ? 'border-l-amber-400' : 'border-l-transparent';
            const totalValue = (item.stockQuantity * (item.averageCost || 0));

            return (
              <div key={item.id} className={`relative p-6 border-t border-r border-b border-l-[6px] transition-all group flex flex-col justify-between min-h-[260px] ${borderColor} ${isDark ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400'}`}>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => openModal('RESTOCK', item)} className={`p-2 ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'} hover:bg-neutral-900 hover:text-white`} title="Hızlı Alım"><ShoppingBag size={16}/></button>
                  <button onClick={() => openModal('EDIT', item)} className={`p-2 ${isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}><Pencil size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} className={`p-2 ${isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-600'}`}><Trash2 size={16}/></button>
                </div>
                <div>
                    <div className="flex justify-between items-start mb-4">
                         <span className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'}`}>{item.category === 'Label' ? (item.labelType === 'Front' ? 'ÖN' : 'ARKA') : item.category}</span>
                         {item.variant && item.variant !== 'Genel' && <span className={`text-[10px] font-medium px-2 py-1 ${isDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}`}>{item.variant}</span>}
                    </div>
                    <h3 className="font-light text-2xl leading-tight tracking-wide mb-1">{item.name}</h3>
                    <p className={`text-xs font-light tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{item.id}</p>
                </div>
                <div className={`mt-auto pt-4 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                         <div className="flex flex-col">
                            <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Birim Maliyet</span>
                            <span className={`text-sm font-light flex items-center gap-1 ${isDark ? 'text-white' : 'text-neutral-900'}`}><Coins size={12} className={isDark ? 'text-neutral-500' : 'text-neutral-300'}/>{item.averageCost ? formatCurrency(item.averageCost) : '-'}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Toplam Değer</span>
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{totalValue > 0 ? formatCurrency(totalValue) : '-'}</span>
                         </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div><span className={`text-[10px] block mb-1 uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Stok Seviyesi</span><span className="text-3xl font-light tracking-tighter">{item.stockQuantity}</span></div>
                        <div className="pb-1">
                            {isCritical ? <span className="flex items-center gap-1.5 text-red-500 text-xs font-light"><AlertTriangle size={14}/> KRİTİK</span> 
                            : isLow ? <span className="flex items-center gap-1.5 text-amber-500 text-xs font-light"><AlertTriangle size={14}/> AZALIYOR</span> 
                            : <span className="flex items-center gap-1.5 text-neutral-400 text-xs font-light"><CheckCircle2 size={14}/> İYİ</span>}
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="bg-white border border-neutral-200 p-12 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
              {packagingItems.filter(item => item.category === activeTab).length === 0 ? (
                 activeTab === 'Bag' ? <Package size={32} className="text-neutral-300" strokeWidth={1.5} /> :
                 activeTab === 'Label' ? <Sticker size={32} className="text-neutral-300" strokeWidth={1.5} /> :
                 <Box size={32} className="text-neutral-300" strokeWidth={1.5} />
              ) : ( <AlertCircle size={32} className="text-neutral-300" strokeWidth={1.5} /> )}
            </div>
            <h3 className="text-neutral-900 font-light text-lg mb-2 tracking-wide">{packagingItems.filter(item => item.category === activeTab).length === 0 ? "HENÜZ MALZEME YOK" : "SONUÇ BULUNAMADI"}</h3>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto font-light mb-6">{packagingItems.filter(item => item.category === activeTab).length === 0 ? `Sisteme henüz ${activeTab === 'Bag' ? 'torba' : activeTab === 'Label' ? 'etiket' : 'koli'} stoğu eklenmedi.` : "Arama kriterlerinize uygun paketleme malzemesi bulunamadı."}</p>
            <button onClick={() => openModal('NEW')} className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-all active:scale-[0.99]"><Plus size={16} /><span>YENİ {activeTab === 'Bag' ? 'TORBA' : activeTab === 'Label' ? 'ETİKET' : 'KOLİ'} EKLE</span></button>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'NEW' ? "YENİ MALZEME & ALIM" : modalMode === 'RESTOCK' ? "HIZLI ALIM GİRİŞİ" : "KARTI DÜZENLE"}>
           <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
             <div className={`${modalMode === 'RESTOCK' ? 'opacity-70 pointer-events-none' : ''} space-y-6`}>
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Kategori</label>
                     <select value={formData.category} onChange={e => { const newCat = e.target.value as any; setFormData({ ...formData, category: newCat, variant: (newCat === 'Bag' || newCat === 'Label') ? '250g' : '' }); }} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light appearance-none focus:border-neutral-900">
                        <option value="Bag">Torba</option><option value="Label">Etiket</option><option value="Box">Koli</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Varyant</label>
                     {(formData.category === 'Bag' || formData.category === 'Label') ? (
                        <select value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light appearance-none focus:border-neutral-900">
                            <option value="250g">250g</option><option value="1000g">1000g</option><option value="Standart">Standart</option>
                        </select>
                     ) : ( <input type="text" value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" placeholder="örn. 12li Koli" /> )}
                   </div>
                 </div>

                 {formData.category === 'Label' && (
                   <div>
                     <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Etiket Türü</label>
                     <div className="grid grid-cols-2 gap-3">
                       <button type="button" onClick={() => setFormData({...formData, labelType: 'Front'})} className={`py-3 text-sm font-light border ${formData.labelType === 'Front' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-300'}`}>ÖN ETİKET</button>
                       <button type="button" onClick={() => setFormData({...formData, labelType: 'Back'})} className={`py-3 text-sm font-light border ${formData.labelType === 'Back' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-300'}`}>ARKA ETİKET</button>
                     </div>
                   </div>
                 )}

                 {formData.category === 'Bag' && (
                   <div>
                     <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Torba Rengi</label>
                     <div className="grid grid-cols-2 gap-3">
                       <button type="button" onClick={() => setFormData({...formData, color: 'Black'})} className={`py-3 text-sm font-light border ${formData.color === 'Black' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-300'}`}>SİYAH</button>
                       <button type="button" onClick={() => setFormData({...formData, color: 'White'})} className={`py-3 text-sm font-light border ${formData.color === 'White' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-300'}`}>BEYAZ</button>
                     </div>
                   </div>
                 )}
                 <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">İsim</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900"/></div>
             </div>

             <hr className="border-neutral-200 border-dashed"/>

             {modalMode !== 'EDIT' && (
                <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-4">
                     <div className="flex items-center gap-2 text-neutral-900 font-medium text-sm mb-2"><ShoppingBag size={16}/> <span>SATIN ALIM DETAYLARI</span></div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Tedarikçi</label>
                            <button type="button" onClick={() => setIsPartyModalOpen(true)} className="text-xs text-neutral-900 underline flex items-center gap-1"><UserPlus size={12}/> Yeni Ekle</button>
                        </div>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
                            <select required value={purchaseData.supplierId} onChange={e => setPurchaseData({...purchaseData, supplierId: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 outline-none appearance-none font-light focus:border-neutral-900">
                                <option value="">Tedarikçi Seçiniz...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Alınan Miktar (Adet)</label><input required type="number" min="1" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" placeholder="0" /></div>
                        
                        {/* MALİYET GİRİŞ ALANI (GÜNCELLENDİ) */}
                        <div className="col-span-1">
                            <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Toplam Tutar</label>
                            <input required type="number" min="0" value={purchaseData.cost} onChange={e => setPurchaseData({...purchaseData, cost: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" placeholder="0.00" />
                        </div>
                        
                         {/* PARA BİRİMİ SEÇİMİ (YENİ EKLENDİ) */}
                         <div className="col-span-2 md:col-span-2">
                             <CustomSelect
                                  label="Para Birimi"
                                  value={currency}
                                  onChange={(val) => setCurrency(val as 'TRY' | 'USD' | 'EUR')}
                                  options={currencyOptions}
                                  placeholder="Seçiniz"
                                  icon={Coins}
                             />
                        </div>
                     </div>

                     {/* DÖVİZ ÖZETİ */}
                     {purchaseData.cost > 0 && (
                        <div className="bg-neutral-50 border border-dashed border-neutral-200 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Coins size={14} className="text-neutral-400" />
                            <div className="flex flex-col">
                              <span className="font-medium uppercase tracking-wide">Döviz Özeti</span>
                              <span className="text-neutral-500">
                                Girilen: {purchaseData.cost.toLocaleString('tr-TR')} {currency}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-neutral-400 block mb-0.5">Sisteme Kaydedilecek (TL)</span>
                            <span className="text-sm font-medium text-neutral-900">
                              {costInTryPreview > 0 ? `${costInTryPreview.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                            </span>
                          </div>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">İşlem Tarihi</label><input required type="date" value={purchaseData.date} onChange={e => setPurchaseData({...purchaseData, date: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" /></div>
                        <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider text-amber-600">Ödeme Vadesi</label><input required type="date" value={purchaseData.dueDate} onChange={e => setPurchaseData({...purchaseData, dueDate: e.target.value})} className="w-full px-4 py-3 bg-white border border-amber-200 outline-none font-light focus:border-amber-500 focus:bg-amber-50" /></div>
                     </div>
                </div>
            )}
            
            {modalMode === 'EDIT' && <div className="bg-amber-50 p-4 border border-amber-200 text-amber-800 text-xs"><span className="font-bold">DİKKAT:</span> Bu ekrandan stok miktarı değiştirilemez. Stok eklemek için listedeki "Çanta" ikonuna tıklayınız.</div>}

             <button type="submit" className="w-full bg-neutral-900 text-white py-4 font-light tracking-wide hover:bg-neutral-800 transition-all active:scale-[0.99]">{modalMode === 'NEW' ? 'KAYDET VE SATIN ALIMI GİR' : modalMode === 'RESTOCK' ? 'SATIN ALIMI ONAYLA' : 'DEĞİŞİKLİKLERİ KAYDET'}</button>
           </form>
        </Modal>

        <Modal isOpen={isPartyModalOpen} onClose={() => setIsPartyModalOpen(false)} title="YENİ TEDARİKÇİ EKLE">
            <div className="space-y-4">
                <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Firma / Kişi Adı</label><input type="text" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} className="w-full px-4 py-3 border border-neutral-300 outline-none focus:border-neutral-900" /></div>
                <button onClick={handleCreateSupplier} className="w-full bg-neutral-900 text-white py-3 font-light hover:bg-neutral-800 transition-all active:scale-[0.99]">KAYDET</button>
            </div>
        </Modal>
      </div>
    </div>
  );
};