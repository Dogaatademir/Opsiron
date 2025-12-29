import { useState } from 'react';
import { Search, Pencil, Trash2, Coffee, AlertCircle, Coins, ShoppingBag, User, Plus, UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CustomSelect, type SelectOption } from '../components/CustomSelect'; // YENİ: CustomSelect Eklendi
import { useStore } from '../context/StoreContext';
import type { GreenCoffee } from '../context/StoreContext'; 

export const GreenCoffeePage = () => {
  const { 
    greenCoffees, 
    settings, 
    addGreenCoffee, 
    updateGreenCoffee, 
    deleteGreenCoffee, 
    recordPurchase, 
    parties, 
    addParty 
  } = useStore();
  
  const { critical, low } = settings.thresholds.greenCoffee;

  // Modallar için State
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

  // Form Verileri
  const [formData, setFormData] = useState<Omit<GreenCoffee, 'id'>>({ name: '', origin: '', process: '', stockKg: 0, entryDate: new Date().toISOString().split('T')[0]});
  
  // Satın Alım Ekstra Verileri
  const [purchaseData, setPurchaseData] = useState({
      supplierId: '',
      cost: 0,
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

  // Modal Açma Yardımcısı
  const openModal = (mode: 'NEW' | 'EDIT' | 'RESTOCK', coffee?: GreenCoffee) => {
    setModalMode(mode);
    // Modal her açıldığında TRY ve boş maliyet ile başla
    setPurchaseData({ supplierId: '', cost: 0, dueDate: new Date().toISOString().split('T')[0] });
    setCurrency('TRY'); 

    if (coffee) {
      setActiveId(coffee.id);
      if (mode === 'EDIT') {
          setFormData({ name: coffee.name, origin: coffee.origin, process: coffee.process, stockKg: coffee.stockKg, entryDate: coffee.entryDate });
      } else if (mode === 'RESTOCK') {
          setFormData({ name: coffee.name, origin: coffee.origin, process: coffee.process, stockKg: 0, entryDate: new Date().toISOString().split('T')[0] });
      }
    } else {
      setActiveId(null);
      setFormData({ name: '', origin: '', process: '', stockKg: 0, entryDate: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleCreateSupplier = () => {
      if(!newSupplierName) return alert("Tedarikçi adı giriniz.");
      addParty({
          id: `PRT-${Date.now()}`,
          type: 'Supplier',
          name: newSupplierName,
          status: 'Active'
      });
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
        updateGreenCoffee({ ...formData, id: activeId });
        alert("Kart bilgileri güncellendi.");
    } 
    else if (modalMode === 'NEW') {
        const newId = `GC-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const initialStock = formData.stockKg;
        // Ortalama maliyeti TL üzerinden hesapla
        const calculatedAvgCost = initialStock > 0 ? totalCostTRY / initialStock : 0;

        addGreenCoffee({ 
            ...formData, 
            id: newId, 
            stockKg: initialStock, 
            averageCost: calculatedAvgCost 
        }); 

        const supplier = suppliers.find(s => s.id === purchaseData.supplierId);
        recordPurchase({
            id: `PUR-${Date.now()}`,
            date: formData.entryDate,
            dueDate: purchaseData.dueDate,
            supplierId: purchaseData.supplierId,
            supplier: supplier ? supplier.name : 'Bilinmeyen',
            category: 'GreenCoffee',
            categoryId: 'CAT-001',
            itemId: newId,
            itemName: formData.name,
            quantity: initialStock,
            cost: totalCostTRY, // TL olarak kaydet
            status: 'Active'
        });

        alert("Yeni çekirdek ve maliyet bilgisi kaydedildi.");
    }
    else if (modalMode === 'RESTOCK' && activeId) {
        const supplier = suppliers.find(s => s.id === purchaseData.supplierId);
        recordPurchase({
            id: `PUR-${Date.now()}`,
            date: formData.entryDate,
            dueDate: purchaseData.dueDate,
            supplierId: purchaseData.supplierId,
            supplier: supplier ? supplier.name : 'Bilinmeyen',
            category: 'GreenCoffee',
            categoryId: 'CAT-001',
            itemId: activeId,
            itemName: formData.name,
            quantity: formData.stockKg,
            cost: totalCostTRY, // TL olarak kaydet
            status: 'Active'
        });
        alert("Stok ve maliyet güncellendi.");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => { if (window.confirm('Bu stok kaydını silmek istiyor musunuz?')) deleteGreenCoffee(id); };
  const filteredCoffees = greenCoffees.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.origin.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  const costInTryPreview = getCostInTry();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
            <div><h1 className="text-4xl font-light tracking-tight text-neutral-900">YEŞİL ÇEKİRDEK</h1><p className="text-neutral-500 mt-1 font-light">Çiğ çekirdek envanter ve maliyet yönetimi</p></div>
             <button onClick={() => openModal('NEW')} className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 hover:bg-neutral-800 transition-all active:scale-[0.99] font-light tracking-wide"><Plus size={18}/> <span>YENİ ÇEKİRDEK EKLE</span></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white p-4 border border-neutral-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-full md:max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} strokeWidth={1.5} />
            <input type="text" placeholder="İsim, ID veya köken ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-neutral-50 md:bg-transparent outline-none text-neutral-700 placeholder-neutral-400 transition-all font-light border md:border-none border-neutral-200 focus:bg-white"/>
          </div>
        </div>

        {/* GRID GÖRÜNÜMÜ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCoffees.map(coffee => {
            const isCritical = coffee.stockKg < critical;
            const isLow = coffee.stockKg < low;
            const borderColor = isCritical ? 'border-l-red-500' : isLow ? 'border-l-amber-400' : 'border-l-transparent';
            const totalValue = (coffee.stockKg * (coffee.averageCost || 0));

            return (
              <div key={coffee.id} className={`relative p-6 border-t border-r border-b border-l-[6px] transition-all group flex flex-col justify-between min-h-[260px] ${borderColor} bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400`}>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => openModal('RESTOCK', coffee)} title="Hızlı Alım" className="p-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-white transition-colors"><ShoppingBag size={16}/></button>
                  <button onClick={() => openModal('EDIT', coffee)} className="p-2 bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"><Pencil size={16}/></button>
                  <button onClick={() => handleDelete(coffee.id)} className="p-2 bg-red-50 text-red-600 hover:text-red-700 transition-colors"><Trash2 size={16}/></button>
                </div>
                <div>
                    <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] uppercase tracking-wider px-2 py-1 border border-neutral-200 text-neutral-500">{coffee.origin}</span>
                         <span className="text-[10px] font-medium px-2 py-1 bg-neutral-900 text-white uppercase">{coffee.process}</span>
                    </div>
                    <h3 className="font-light text-2xl leading-tight tracking-wide mb-1">{coffee.name}</h3>
                    <p className="text-xs font-light tracking-wider text-neutral-400">{coffee.id}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-3">
                         <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">Birim Maliyet</span>
                            <span className="text-sm font-light flex items-center gap-1 text-neutral-900">
                                <Coins size={12} className="text-neutral-300"/>
                                {coffee.averageCost ? formatCurrency(coffee.averageCost) : '-'}
                            </span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">Toplam Değer</span>
                            <span className="text-sm font-medium text-neutral-900">
                                {totalValue > 0 ? formatCurrency(totalValue) : '-'}
                            </span>
                         </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[10px] block mb-1 uppercase tracking-wider text-neutral-400">Stok (KG)</span>
                            <span className="text-3xl font-light tracking-tighter">{coffee.stockKg.toFixed(1)}</span>
                        </div>
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

        {filteredCoffees.length === 0 && (
          <div className="bg-white border border-neutral-200 p-12 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
              {greenCoffees.length === 0 ? <Coffee size={32} className="text-neutral-300" strokeWidth={1.5} /> : <AlertCircle size={32} className="text-neutral-300" strokeWidth={1.5} />}
            </div>
            <h3 className="text-neutral-900 font-light text-lg mb-2 tracking-wide">{greenCoffees.length === 0 ? "HENÜZ YEŞİL ÇEKİRDEK YOK" : "SONUÇ BULUNAMADI"}</h3>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto font-light mb-6">{greenCoffees.length === 0 ? "Sisteme henüz yeşil çekirdek stoğu eklenmedi." : "Arama kriterlerinize uygun stok kaydı bulunamadı."}</p>
            <button onClick={() => openModal('NEW')} className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-all active:scale-[0.99]"><Plus size={16} /><span>YENİ ÇEKİRDEK EKLE</span></button>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'NEW' ? "YENİ ÇEKİRDEK & ALIM" : modalMode === 'RESTOCK' ? "HIZLI ALIM GİRİŞİ" : "KARTI DÜZENLE"}>
          <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            <div className={`space-y-4 ${modalMode === 'RESTOCK' ? 'opacity-70 pointer-events-none' : ''}`}>
                <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Kahve Adı</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none transition-all font-light focus:border-neutral-900"/></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Köken</label><input required type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none transition-all font-light focus:border-neutral-900"/></div>
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">İşlem</label>
                        <select required value={formData.process} onChange={e => setFormData({...formData, process: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none appearance-none font-light focus:border-neutral-900">
                        <option value="">Seçiniz</option><option value="Washed">Washed</option><option value="Natural">Natural</option><option value="Honey">Honey</option><option value="Anaerobic">Anaerobic</option>
                        </select>
                    </div>
                </div>
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
                        <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Alınan Miktar (KG)</label><input required type="number" step="0.1" min="0.1" value={formData.stockKg} onChange={e => setFormData({...formData, stockKg: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" placeholder="0.00" /></div>
                        {/* MALİYET GİRİŞ ALANI (GÜNCELLENDİ) */}
                        <div className="col-span-1">
                            <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Toplam Tutar</label>
                            <div className="flex items-center gap-2">
                                <input required type="number" min="0" value={purchaseData.cost} onChange={e => setPurchaseData({...purchaseData, cost: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" placeholder="0.00" />
                            </div>
                        </div>
                        
                        {/* PARA BİRİMİ SEÇİMİ (YENİ EKLENDİ - GRID YAPISINA UYDURULDU) */}
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

                     {/* DÖVİZ ÖZETİ (EĞER TL DEĞİLSE GÖSTER) */}
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
                        <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">İşlem Tarihi</label><input required type="date" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" /></div>
                        <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider text-amber-600">Ödeme Vadesi</label><input required type="date" value={purchaseData.dueDate} onChange={e => setPurchaseData({...purchaseData, dueDate: e.target.value})} className="w-full px-4 py-3 bg-white border border-amber-200 outline-none font-light focus:border-amber-500 focus:bg-amber-50" /></div>
                     </div>
                </div>
            )}
            
            {modalMode === 'EDIT' && <div className="bg-amber-50 p-4 border border-amber-200 text-amber-800 text-xs"><span className="font-bold">DİKKAT:</span> Bu ekrandan stok miktarı değiştirilemez. Stok eklemek için listedeki "Çanta" ikonuna tıklayınız.</div>}

            <button type="submit" className="w-full mt-4 px-6 py-4 bg-neutral-900 text-white hover:bg-neutral-800 transition-all active:scale-[0.99] font-light tracking-wide">{modalMode === 'NEW' ? 'KAYDET VE SATIN ALIMI GİR' : modalMode === 'RESTOCK' ? 'SATIN ALIMI ONAYLA' : 'DEĞİŞİKLİKLERİ KAYDET'}</button>
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