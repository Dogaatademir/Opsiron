import { useState } from 'react';
import { Plus, Search, ShoppingBag, Calendar, Package, Coffee, ArrowDownLeft, Store, Info } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useStore } from '../context/StoreContext';
import type { PurchaseLog, GreenCoffee, PackagingItem } from '../context/StoreContext';

export const PurchasesPage = () => {
  const { 
    greenCoffees, 
    packagingItems, 
    purchases, 
    recordPurchase,
    addGreenCoffee,
    addPackagingItem
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- FORM STATES ---
  const [category, setCategory] = useState<'GreenCoffee' | 'Packaging'>('GreenCoffee');
  const [entryMode, setEntryMode] = useState<'Existing' | 'New'>('Existing');

  const [purchaseForm, setPurchaseForm] = useState<{
    itemId: string;
    supplier: string;
    quantity: number;
    cost: number;
    date: string;
  }>({
    itemId: '',
    supplier: '',
    quantity: 0,
    cost: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const [newGreenForm, setNewGreenForm] = useState<Omit<GreenCoffee, 'id' | 'stockKg' | 'entryDate'>>({
    name: '', origin: '', process: ''
  });

  const [newPackForm, setNewPackForm] = useState<Omit<PackagingItem, 'id' | 'stockQuantity' | 'minThreshold'>>({
    category: 'Bag', brand: 'Genel', name: '', variant: '250g', color: 'White', labelType: 'Front'
  });

  const activeItems = category === 'GreenCoffee' ? greenCoffees : packagingItems;
  const selectedExistingItem = activeItems.find(i => i.id === purchaseForm.itemId);

  const getPackagingDisplayName = (item: PackagingItem) => {
    const variantStr = item.variant && item.variant !== 'Genel' ? `(${item.variant})` : '';
    let detailStr = '';
    if (item.category === 'Label') detailStr = item.labelType === 'Front' ? 'ÖN' : 'ARKA';
    else if (item.category === 'Bag') detailStr = item.color === 'White' ? 'BEYAZ' : 'SİYAH';
    return `[${item.brand}] ${item.name} ${variantStr} ${detailStr ? `- ${detailStr}` : ''}`;
  };

  const resetForms = () => {
    setPurchaseForm({ itemId: '', supplier: '', quantity: 0, cost: 0, date: new Date().toISOString().split('T')[0] });
    setNewGreenForm({ name: '', origin: '', process: '' });
    setNewPackForm({ category: 'Bag', brand: 'Genel', name: '', variant: '250g', labelType: 'Front', color: 'White' });
    setEntryMode('Existing');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetItemId = purchaseForm.itemId;
    let targetItemName = '';

    if (entryMode === 'New') {
      if (category === 'GreenCoffee') {
        const newId = `GC-${Math.floor(1000 + Math.random() * 9000)}`;
        // 1. Önce Kartı Ekle
        addGreenCoffee({ id: newId, ...newGreenForm, stockKg: 0, entryDate: purchaseForm.date });
        targetItemId = newId;
        targetItemName = newGreenForm.name;
      } else {
        const newId = `PKG-${Math.floor(1000 + Math.random() * 9000)}`;
        const finalPackForm = { ...newPackForm };
        if (finalPackForm.category !== 'Bag') { delete (finalPackForm as any).color; }
        if (finalPackForm.category !== 'Label') { delete (finalPackForm as any).labelType; }
        // 1. Önce Kartı Ekle
        addPackagingItem({ id: newId, ...finalPackForm, stockQuantity: 0, minThreshold: 50 });
        targetItemId = newId;
        targetItemName = newPackForm.name;
      }
    } else {
      const existing = activeItems.find(i => i.id === purchaseForm.itemId);
      if (!existing) return alert('Lütfen bir ürün seçiniz.');
      targetItemName = existing.name;
    }

    // 2. Sonra Satın Alımı Kaydet (Artık StoreContext, anında eklenen kartı "prev" state ile görebilecek)
    const newPurchase: PurchaseLog = {
      id: `PUR-${Date.now()}`,
      category,
      itemId: targetItemId,
      itemName: targetItemName,
      supplier: purchaseForm.supplier,
      quantity: purchaseForm.quantity,
      cost: purchaseForm.cost,
      date: purchaseForm.date
    };

    recordPurchase(newPurchase);
    setIsModalOpen(false);
    resetForms();
    alert('İşlem başarıyla kaydedildi.');
  };

  const filteredPurchases = purchases.filter(p => 
    p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">SATIN ALIMLAR</h1>
              <p className="text-neutral-500 mt-1 font-light">Hammadde girişi ve tedarikçi geçmişi</p>
            </div>
            <button onClick={() => { resetForms(); setIsModalOpen(true); }} className="flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-4 transition-all active:scale-[0.99] font-light tracking-wide">
              <Plus size={18} strokeWidth={1.5} /> <span>YENİ SATIN ALIM</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white p-4 border border-neutral-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} strokeWidth={1.5} />
            <input type="text" placeholder="Ürün adı, tedarikçi veya ID ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-neutral-50 outline-none text-neutral-700 placeholder-neutral-400 transition-all font-light border border-neutral-200 focus:bg-white focus:border-neutral-900"/>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em]">Tarih</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em]">Ürün Bilgisi</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em]">Tedarikçi</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em] text-right">Miktar</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em] text-right">Maliyet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPurchases.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-neutral-600 font-light text-sm">
                        <Calendar size={14} className="text-neutral-400" />
                        {new Date(log.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${log.category === 'GreenCoffee' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                           {log.category === 'GreenCoffee' ? <Coffee size={16}/> : <Package size={16}/>}
                        </div>
                        <div>
                          <div className="font-light text-neutral-900 text-base">{log.itemName}</div>
                          <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{log.category === 'GreenCoffee' ? 'Yeşil Çekirdek' : 'Paketleme Malzemesi'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-neutral-700 font-light text-sm">
                        <Store size={14} className="text-neutral-300" />
                        {log.supplier || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className="inline-flex items-center gap-1 font-medium text-green-700 bg-green-50 px-2 py-1 border border-green-100 text-sm">
                         <ArrowDownLeft size={14} />
                         +{log.quantity} {log.category === 'GreenCoffee' ? 'kg' : 'ad'}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-neutral-900 font-light text-sm">
                          {(log.cost ?? 0) > 0 ? `${(log.cost ?? 0).toLocaleString('tr-TR')} ₺` : '-'}
                        </span>
                        {(log.cost ?? 0) > 0 && log.quantity > 0 && (
                           <span className="text-[10px] text-neutral-400 mt-0.5">
                             birim: {((log.cost ?? 0) / log.quantity).toFixed(2)} ₺
                           </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400 font-light"><div className="flex flex-col items-center gap-2"><ShoppingBag size={24} strokeWidth={1} /><span>Kayıtlı satın alım bulunamadı.</span></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="YENİ SATIN ALIM GİRİŞİ">
          {/* Form içeriği değişmedi, aynı form kullanılacak */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Satın Alım Türü</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => { setCategory('GreenCoffee'); setPurchaseForm({...purchaseForm, itemId: ''}); setEntryMode('Existing'); }} className={`flex items-center justify-center gap-2 py-4 border transition-all ${category === 'GreenCoffee' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'}`}><Coffee size={18} /> <span className="text-sm font-light tracking-wide">YEŞİL ÇEKİRDEK</span></button>
              <button type="button" onClick={() => { setCategory('Packaging'); setPurchaseForm({...purchaseForm, itemId: ''}); setEntryMode('Existing'); }} className={`flex items-center justify-center gap-2 py-4 border transition-all ${category === 'Packaging' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'}`}><Package size={18} /> <span className="text-sm font-light tracking-wide">AMBALAJ / MALZEME</span></button>
            </div>
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-lg">
             <button type="button" onClick={() => setEntryMode('Existing')} className={`flex-1 py-2 text-xs font-medium uppercase tracking-wide rounded-md transition-all ${entryMode === 'Existing' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}>Stoktan Seç</button>
             <button type="button" onClick={() => setEntryMode('New')} className={`flex-1 py-2 text-xs font-medium uppercase tracking-wide rounded-md transition-all ${entryMode === 'New' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}>Yeni Ürün Tanımla (+{category === 'GreenCoffee' ? 'Kahve' : 'Malzeme'})</button>
          </div>

          <div className="bg-neutral-50 p-6 border border-neutral-200 space-y-4">
            {entryMode === 'Existing' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Ürün Seçimi</label>
                    <select required value={purchaseForm.itemId} onChange={e => setPurchaseForm({...purchaseForm, itemId: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light appearance-none focus:border-neutral-900">
                      <option value="">Listeden Seçiniz...</option>
                      {category === 'GreenCoffee' ? (
                          greenCoffees.map(item => (
                            <option key={item.id} value={item.id}>{item.name} - {item.origin}</option>
                          ))
                      ) : (
                          <>
                             <optgroup label="TORBALAR">
                                {packagingItems.filter(i => i.category === 'Bag').map(item => (
                                    <option key={item.id} value={item.id}>{getPackagingDisplayName(item)}</option>
                                ))}
                             </optgroup>
                             <optgroup label="ETİKETLER">
                                {packagingItems.filter(i => i.category === 'Label').map(item => (
                                    <option key={item.id} value={item.id}>{getPackagingDisplayName(item)}</option>
                                ))}
                             </optgroup>
                             <optgroup label="KOLİLER">
                                {packagingItems.filter(i => i.category === 'Box').map(item => (
                                    <option key={item.id} value={item.id}>{getPackagingDisplayName(item)}</option>
                                ))}
                             </optgroup>
                          </>
                      )}
                    </select>
                  </div>
                  {selectedExistingItem && (
                    <div className="bg-white border border-neutral-200 p-4 text-sm space-y-2">
                        <div className="flex items-center gap-2 text-neutral-800 font-medium"><Info size={16}/> <span>Stok Bilgisi</span></div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                             <div><span className="text-neutral-400 block">Mevcut Miktar</span><span className="text-neutral-900 text-lg font-light">{(selectedExistingItem as any).stockKg ?? (selectedExistingItem as any).stockQuantity} {category === 'GreenCoffee' ? ' kg' : ' ad'}</span></div>
                             {selectedExistingItem.averageCost && (
                               <div className="col-span-2 pt-2 border-t border-dashed border-neutral-200">
                                 <span className="text-neutral-400 block">Ortalama Maliyet</span>
                                 <span className="text-neutral-900">{selectedExistingItem.averageCost.toFixed(2)} ₺ / {category === 'GreenCoffee' ? 'kg' : 'adet'}</span>
                               </div>
                             )}
                        </div>
                    </div>
                  )}
                </>
            )}

            {entryMode === 'New' && (
                <>
                  <div className="pb-2 mb-2 border-b border-neutral-200 text-xs font-bold text-neutral-900 uppercase tracking-wider">YENİ KART OLUŞTURULUYOR</div>
                  {category === 'GreenCoffee' ? (
                     <div className="space-y-4">
                        <div><label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Çekirdek Adı</label><input required type="text" value={newGreenForm.name} onChange={e => setNewGreenForm({...newGreenForm, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"/></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Köken (Ülke/Bölge)</label><input required type="text" value={newGreenForm.origin} onChange={e => setNewGreenForm({...newGreenForm, origin: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"/></div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">İşlem Metodu</label>
                                <select required value={newGreenForm.process} onChange={e => setNewGreenForm({...newGreenForm, process: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"><option value="">Seçiniz</option><option value="Washed">Washed</option><option value="Natural">Natural</option><option value="Honey">Honey</option><option value="Anaerobic">Anaerobic</option></select>
                            </div>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Alt Kategori</label>
                                <select value={newPackForm.category} onChange={e => { const cat = e.target.value as any; setNewPackForm({...newPackForm, category: cat, variant: (cat === 'Bag' || cat === 'Label') ? '250g' : '' });}} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"><option value="Bag">Torba</option><option value="Label">Etiket</option><option value="Box">Koli</option></select>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Marka</label>
                                <select value={newPackForm.brand} onChange={e => setNewPackForm({...newPackForm, brand: e.target.value as any})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"><option value="Genel">Genel</option><option value="Edition">Edition</option><option value="Hisaraltı">Hisaraltı</option></select>
                            </div>
                        </div>
                        <div><label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Malzeme Adı</label><input required type="text" placeholder="Örn: Beyaz Valfli Torba" value={newPackForm.name} onChange={e => setNewPackForm({...newPackForm, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"/></div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Varyant/Boyut</label>
                                {(newPackForm.category === 'Bag' || newPackForm.category === 'Label') ? (
                                    <select value={newPackForm.variant} onChange={e => setNewPackForm({...newPackForm, variant: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"><option value="250g">250g</option><option value="1000g">1000g</option><option value="Standart">Standart</option></select>
                                ) : ( <input type="text" value={newPackForm.variant} onChange={e => setNewPackForm({...newPackForm, variant: e.target.value})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900" /> )}
                             </div>
                             {newPackForm.category === 'Bag' && ( <div><label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Renk</label><select value={newPackForm.color} onChange={e => setNewPackForm({...newPackForm, color: e.target.value as any})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"><option value="White">Beyaz</option><option value="Black">Siyah</option></select></div> )}
                             {newPackForm.category === 'Label' && ( <div><label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wider">Etiket Yönü</label><select value={newPackForm.labelType} onChange={e => setNewPackForm({...newPackForm, labelType: e.target.value as any})} className="w-full px-3 py-2 bg-white border border-neutral-300 outline-none focus:border-neutral-900"><option value="Front">Ön Etiket</option><option value="Back">Arka Etiket</option></select></div> )}
                        </div>
                     </div>
                  )}
                </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Miktar ({category === 'GreenCoffee' ? 'KG' : 'ADET'})</label><input required type="number" min="0.1" step="0.1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" /></div>
            <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Toplam Tutar (TL)</label><input type="number" min="0" value={purchaseForm.cost} onChange={e => setPurchaseForm({...purchaseForm, cost: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" /></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Tedarikçi</label><input type="text" value={purchaseForm.supplier} onChange={e => setPurchaseForm({...purchaseForm, supplier: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" placeholder="Örn. İthalatçı A.Ş."/></div>
             <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Tarih</label><input required type="date" value={purchaseForm.date} onChange={e => setPurchaseForm({...purchaseForm, date: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" /></div>
          </div>

          <button type="submit" className="w-full bg-neutral-900 text-white py-4 font-light tracking-wide hover:bg-neutral-800 transition-all active:scale-[0.99]">{entryMode === 'New' ? 'YENİ ÜRÜNÜ KAYDET VE SATIN AL' : 'SATIN ALIMI KAYDET VE STOĞU ARTIR'}</button>
          </form>
        </Modal>
      </div>
    </div>
  );
};