import { useState, useMemo } from 'react';
import { Search, Package, Filter, Tag, Coffee, History, Trash2, Pencil, X, Save, AlertCircle, Coins } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';

// Arayüzü güncelledik: Maliyet alanları eklendi
interface AggregatedProduct { 
  id: string; 
  productName: string; 
  brand: 'Edition' | 'Hisaraltı'; 
  packSize: number; 
  totalQuantity: number; 
  totalKg: number; 
  lastProductionDate: string;
  
  // Hesaplama için geçici alanlar
  weightedCostSum: number; // Toplam harcanan para (Tüm zamanlar)
  totalProducedCount: number; // Toplam üretilen adet (Tüm zamanlar)
  
  // Sonuç alanları
  averageUnitCost: number; // Birim Maliyet
}

export const FinishedProductPage = () => {
  const { productionLogs, salesLogs, settings, deleteProductionLog, updateProductionLog } = useStore();
  const { critical, low } = settings.thresholds.finishedProduct;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<'All' | 'Edition' | 'Hisaraltı'>('All');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AggregatedProduct | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // --- STOK VE MALİYET HESAPLAMASI ---
  const inventory = useMemo(() => {
    const grouped: Record<string, AggregatedProduct> = {};
    
    // 1. Üretim verilerini topla (Maliyet ağırlıklı ortalama için)
    productionLogs.forEach(log => {
      const key = `${log.brand}-${log.productName}-${log.packSize}`;
      if (!grouped[key]) {
        grouped[key] = { 
            id: key, 
            productName: log.productName, 
            brand: log.brand, 
            packSize: log.packSize, 
            totalQuantity: 0, 
            totalKg: 0, 
            lastProductionDate: log.date,
            weightedCostSum: 0,
            totalProducedCount: 0,
            averageUnitCost: 0
        };
      }
      
      grouped[key].totalQuantity += log.packCount;
      grouped[key].totalKg += log.totalCoffeeKg;
      
      // Maliyet Hesabı: (Birim Maliyet * Adet) veya (Varsa TotalCost)
      const logCost = log.totalCost ? log.totalCost : (log.unitCost || 0) * log.packCount;
      grouped[key].weightedCostSum += logCost;
      grouped[key].totalProducedCount += log.packCount;

      if (new Date(log.date) > new Date(grouped[key].lastProductionDate)) grouped[key].lastProductionDate = log.date;
    });

    // 2. Satışları düş (Stok miktarını azaltır, birim maliyeti değiştirmez)
    salesLogs.forEach(log => {
        const key = `${log.brand}-${log.productName}-${log.packSize}`;
        if (grouped[key]) {
            grouped[key].totalQuantity -= log.quantity;
            const soldKg = (log.quantity * log.packSize) / 1000;
            grouped[key].totalKg -= soldKg;
        }
    });

    // 3. Ortalama Birim Maliyeti Hesapla
    return Object.values(grouped).map(item => {
        // Eğer hiç üretim maliyeti girilmemişse 0
        const avgCost = item.totalProducedCount > 0 ? item.weightedCostSum / item.totalProducedCount : 0;
        return { ...item, averageUnitCost: avgCost };
    }).sort((a, b) => b.totalQuantity - a.totalQuantity);

  }, [productionLogs, salesLogs]);

  const filteredInventory = inventory.filter(item => {
    return item.productName.toLowerCase().includes(searchTerm.toLowerCase()) && (brandFilter === 'All' || item.brand === brandFilter);
  });

  const getProductLogs = () => {
    if (!selectedProduct) return [];
    return productionLogs.filter(log => log.productName === selectedProduct.productName && log.brand === selectedProduct.brand && log.packSize === selectedProduct.packSize).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleSaveEdit = (id: string) => { if (editQuantity <= 0) return alert("Miktar > 0 olmalı."); updateProductionLog(id, editQuantity); setEditingLogId(null); };
  const handleDeleteLog = (id: string) => { if (window.confirm("Silinsin mi?")) deleteProductionLog(id); };

  // Helper: Para Birimi Formatla
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
            <div><h1 className="text-4xl font-light tracking-tight text-neutral-900">PAKETLİ ÜRÜNLER</h1><p className="text-neutral-500 mt-1 font-light">Bitmiş ürün envanteri ve maliyet değeri</p></div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center"><Package className="text-white" size={28} strokeWidth={1.5} /></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 border border-neutral-200">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={1.5} />
                <input type="text" placeholder="Ürün adı ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 outline-none text-neutral-700 font-light focus:bg-white focus:border-neutral-900 transition-all"/>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={18} className="text-neutral-400" strokeWidth={1.5} />
                <div className="flex bg-neutral-50 p-1 border border-neutral-200 rounded-sm">
                    {['All', 'Edition', 'Hisaraltı'].map((b) => (<button key={b} onClick={() => setBrandFilter(b as any)} className={`px-4 py-2 text-xs font-medium uppercase tracking-wide transition-all ${brandFilter === b ? 'bg-white text-neutral-900 shadow-sm border border-neutral-100' : 'text-neutral-500 hover:text-neutral-900'}`}>{b === 'All' ? 'Tümü' : b}</button>))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => {
                const isCritical = item.totalQuantity < critical;
                const isLow = item.totalQuantity < low;
                const isOut = item.totalQuantity <= 0;
                const borderColor = isOut ? 'border-l-red-600' : isCritical ? 'border-l-red-400' : isLow ? 'border-l-amber-400' : 'border-l-green-500';

                // Toplam Stok Değeri
                const totalStockValue = item.totalQuantity * item.averageUnitCost;

                return (
                <div key={item.id} className={`bg-white border border-neutral-200 border-l-[6px] ${borderColor} p-6 hover:border-neutral-400 transition-all group flex flex-col justify-between relative`}>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 text-[10px] font-medium uppercase tracking-wider border ${item.brand === 'Edition' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-900 border-neutral-900'}`}>{item.brand}</span>
                            <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-light uppercase tracking-wider"><Tag size={12}/> {item.packSize}g</span>
                        </div>
                        <h3 className="text-xl font-light text-neutral-900 tracking-wide mb-1">{item.productName}</h3>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-light mt-2 mb-4">
                             <Coffee size={14} strokeWidth={1.5}/><span>Net: {item.totalKg.toFixed(1)} kg</span>
                        </div>
                        
                        {/* MALİYET BİLGİSİ (YENİ EKLENDİ) */}
                        <div className="flex items-center justify-between py-3 border-t border-b border-neutral-50 mb-2">
                             <div className="flex flex-col">
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Birim Maliyet</span>
                                <span className="text-sm font-light text-neutral-900 flex items-center gap-1">
                                    <Coins size={12} className="text-neutral-300"/>
                                    {item.averageUnitCost > 0 ? formatCurrency(item.averageUnitCost) : '-'}
                                </span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Toplam Değer</span>
                                <span className="text-sm font-medium text-neutral-900">
                                    {totalStockValue > 0 ? formatCurrency(totalStockValue) : '-'}
                                </span>
                             </div>
                        </div>

                    </div>
                    
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                             <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mb-1">Stok Miktarı</p>
                             <p className="text-3xl font-light text-neutral-900 tracking-tight">{item.totalQuantity} <span className="text-sm text-neutral-400">pkt</span></p>
                             {/* Visual Stock Bar */}
                             <div className="w-16 h-1 bg-neutral-100 mt-2"><div className={`h-full ${isOut ? 'bg-red-600' : isCritical ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-neutral-900'}`} style={{width: `${Math.min((item.totalQuantity / 100)*100, 100)}%`}}></div></div>
                        </div>
                        <button onClick={() => {setSelectedProduct(item); setIsHistoryOpen(true);}} className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 transition-colors text-xs font-medium tracking-wide">
                            <History size={14} strokeWidth={1.5}/> GEÇMİŞ
                        </button>
                    </div>
                </div>
            )})}
        </div>

        {filteredInventory.length === 0 && <div className="p-12 text-center border border-dashed border-neutral-300 text-neutral-400">Ürün Bulunamadı</div>}
      </div>

      {selectedProduct && (
        <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title={`ÜRETİM GEÇMİŞİ: ${selectedProduct.productName}`}>
            <div className="space-y-6">
                <div className="bg-amber-50 p-4 border border-amber-200 flex items-start gap-3"><AlertCircle className="text-amber-600 shrink-0" size={18}/><p className="text-xs font-light text-amber-800">Burada sadece üretim kayıtları listelenir.</p></div>
                <div className="max-h-[400px] overflow-y-auto border border-neutral-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-neutral-500 font-medium text-[10px] uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3">Tarih</th>
                                <th className="px-4 py-3">Üretim</th>
                                <th className="px-4 py-3">Birim Mal.</th> 
                                <th className="px-4 py-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {getProductLogs().map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-3 text-neutral-600 font-light">{new Date(log.date).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-4 py-3 font-light text-neutral-900">{editingLogId === log.id ? <input type="number" value={editQuantity} onChange={(e) => setEditQuantity(Number(e.target.value))} className="w-20 px-2 py-1 border border-neutral-300"/> : <span>+{log.packCount}</span>}</td>
                                    {/* GEÇMİŞTEKİ MALİYET */}
                                    <td className="px-4 py-3 text-neutral-500 font-light text-xs">
                                        {log.unitCost ? formatCurrency(log.unitCost) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editingLogId === log.id ? <div className="flex justify-end gap-2"><button onClick={() => setEditingLogId(null)}><X size={14}/></button><button onClick={() => handleSaveEdit(log.id)}><Save size={14}/></button></div> : <div className="flex justify-end gap-2"><button onClick={() => {setEditingLogId(log.id); setEditQuantity(log.packCount);}}><Pencil size={16}/></button><button onClick={() => handleDeleteLog(log.id)}><Trash2 size={16}/></button></div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};