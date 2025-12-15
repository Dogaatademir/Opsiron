import { useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Box, 
  CheckCircle2, 
  Coffee, 
  Factory, 
  Flame, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Truck 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Types for aggregated inventory logic
interface AggregatedProduct { 
  id: string; 
  productName: string; 
  brand: 'Edition' | 'Hisaraltı'; 
  packSize: number; 
  totalQuantity: number; 
}

export const OverviewPage = () => {
  const { 
    greenCoffees, 
    roastStocks, 
    packagingItems, 
    productionLogs, 
    salesLogs, 
    orders, 
    settings 
  } = useStore();

  // --- HESAPLAMALAR ---

  // 1. Yeşil Çekirdek Toplamı
  const totalGreenStock = greenCoffees.reduce((acc, curr) => acc + curr.stockKg, 0);
  
  // 2. Kavrulmuş Stok Toplamı
  const totalRoastStock = roastStocks.reduce((acc, curr) => acc + curr.stockKg, 0);

  // 3. Paketli Ürün Net Stok (FinishedProductPage mantığı)
  const finishedInventory = useMemo(() => {
    const grouped: Record<string, AggregatedProduct> = {};
    
    // Üretimleri Ekle
    productionLogs.forEach(log => {
      const key = `${log.brand}-${log.productName}-${log.packSize}`;
      if (!grouped[key]) {
        grouped[key] = { id: key, productName: log.productName, brand: log.brand, packSize: log.packSize, totalQuantity: 0 };
      }
      grouped[key].totalQuantity += log.packCount;
    });

    // Satışları Düş
    salesLogs.forEach(log => {
        const key = `${log.brand}-${log.productName}-${log.packSize}`;
        if (grouped[key]) {
            grouped[key].totalQuantity -= log.quantity;
        }
    });
    
    return Object.values(grouped).filter(i => i.totalQuantity > 0);
  }, [productionLogs, salesLogs]);

  const totalFinishedPackets = finishedInventory.reduce((acc, curr) => acc + curr.totalQuantity, 0);

  // 4. Sipariş Durumu
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const pendingOrdersCount = pendingOrders.length;
  const pendingPacketsNeeded = pendingOrders.reduce((acc, curr) => acc + curr.totalQuantity, 0);

  // --- UYARI SİSTEMİ (ALERT SYSTEM) ---
  const alerts = useMemo(() => {
    const allAlerts: { id: string; type: 'Green' | 'Roast' | 'Package'; name: string; current: number; status: 'Critical' | 'Low'; unit: string }[] = [];

    // Yeşil Çekirdek Kontrolü
    greenCoffees.forEach(g => {
      if (g.stockKg < settings.thresholds.greenCoffee.critical) allAlerts.push({ id: g.id, type: 'Green', name: g.name, current: g.stockKg, status: 'Critical', unit: 'kg' });
      else if (g.stockKg < settings.thresholds.greenCoffee.low) allAlerts.push({ id: g.id, type: 'Green', name: g.name, current: g.stockKg, status: 'Low', unit: 'kg' });
    });

    // Kavrulmuş Stok Kontrolü
    roastStocks.forEach(r => {
      if (r.stockKg < settings.thresholds.roastStock.critical) allAlerts.push({ id: r.id, type: 'Roast', name: r.name, current: r.stockKg, status: 'Critical', unit: 'kg' });
      else if (r.stockKg < settings.thresholds.roastStock.low) allAlerts.push({ id: r.id, type: 'Roast', name: r.name, current: r.stockKg, status: 'Low', unit: 'kg' });
    });

    // Paketleme Malzemesi Kontrolü
    packagingItems.forEach(p => {
      let crit = 50, low = 100;
      if (p.category === 'Bag') { crit = settings.thresholds.bag.critical; low = settings.thresholds.bag.low; }
      else if (p.category === 'Label') { crit = settings.thresholds.label.critical; low = settings.thresholds.label.low; }
      else if (p.category === 'Box') { crit = settings.thresholds.box.critical; low = settings.thresholds.box.low; }

      if (p.stockQuantity < crit) allAlerts.push({ id: p.id, type: 'Package', name: p.name, current: p.stockQuantity, status: 'Critical', unit: 'ad' });
      else if (p.stockQuantity < low) allAlerts.push({ id: p.id, type: 'Package', name: p.name, current: p.stockQuantity, status: 'Low', unit: 'ad' });
    });

    // Sıralama: Önce Kritikler, Sonra Azalanlar
   return allAlerts.sort((a) => (a.status === 'Critical' ? -1 : 1));
  }, [greenCoffees, roastStocks, packagingItems, settings]);

  return (
    <div className="min-h-screen bg-neutral-50">
      
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">GENEL BAKIŞ</h1>
            <p className="text-neutral-500 mt-1 font-light">İşletme performansı ve stok özeti</p>
          </div>
          <div className="text-right">
             <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Bugün</div>
             <div className="text-xl font-light text-neutral-900">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* KPI CARDS - TOP ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Pending Orders (Priority) */}
          <div className="bg-neutral-900 text-white p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ShoppingCart size={64}/></div>
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Bekleyen Sipariş</p>
              <h3 className="text-4xl font-light tracking-tight">{pendingOrdersCount}</h3>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-end">
              <span className="text-xs text-neutral-400 font-light">Sevk edilecek: <span className="text-white font-medium">{pendingPacketsNeeded} paket</span></span>
              <Truck size={18} className="text-neutral-400"/>
            </div>
          </div>

          {/* Card 2: Finished Goods */}
          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between hover:border-neutral-400 transition-colors group">
            <div>
              <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Hazır Ürün Stoğu</p>
                 <Package size={20} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" strokeWidth={1.5}/>
              </div>
              <h3 className="text-4xl font-light text-neutral-900 tracking-tight">{totalFinishedPackets} <span className="text-sm text-neutral-400 align-middle">pkt</span></h3>
            </div>
            <div className="mt-4">
               {/* Mini Bar Chart Visualization */}
               <div className="flex h-1.5 gap-1 mt-2">
                 {finishedInventory.slice(0, 5).map((item, i) => (
                    <div key={i} className="bg-neutral-200 hover:bg-neutral-900 transition-colors" style={{ width: `${(item.totalQuantity / totalFinishedPackets) * 100}%` }} title={`${item.productName}: ${item.totalQuantity}`}></div>
                 ))}
               </div>
            </div>
          </div>

          {/* Card 3: Roasted Stock */}
          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between hover:border-neutral-400 transition-colors group">
            <div>
              <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Kavrulmuş Stok</p>
                 <Flame size={20} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" strokeWidth={1.5}/>
              </div>
              <h3 className="text-4xl font-light text-neutral-900 tracking-tight">{totalRoastStock.toFixed(1)} <span className="text-sm text-neutral-400 align-middle">kg</span></h3>
            </div>
             <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500 font-light">
                <Activity size={14}/> <span>{roastStocks.length} farklı çeşit</span>
             </div>
          </div>

          {/* Card 4: Green Stock */}
          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between hover:border-neutral-400 transition-colors group">
            <div>
              <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Yeşil Çekirdek</p>
                 <Coffee size={20} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" strokeWidth={1.5}/>
              </div>
              <h3 className="text-4xl font-light text-neutral-900 tracking-tight">{totalGreenStock.toFixed(1)} <span className="text-sm text-neutral-400 align-middle">kg</span></h3>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500 font-light">
                <Factory size={14}/> <span>{greenCoffees.length} farklı orijin</span>
             </div>
          </div>
        </div>

        {/* MIDDLE SECTION: FULL WIDTH ALERTS */}
        <div className="bg-white border border-neutral-200 flex flex-col">
          <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-lg font-light text-neutral-900 tracking-wide flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" strokeWidth={1.5}/>
                STOK UYARILARI
              </h2>
              <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">{alerts.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px]">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-neutral-400">
                  <CheckCircle2 size={48} strokeWidth={1} className="mb-4 text-green-500 opacity-50"/>
                  <p className="font-light">Harika! Stokta sorun görünmüyor.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-[10px] uppercase text-neutral-500 font-medium tracking-wider sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Tür</th>
                      <th className="px-6 py-3">Ürün Adı</th>
                      <th className="px-6 py-3">Mevcut</th>
                      <th className="px-6 py-3 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {alerts.map((alert, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider border ${
                            alert.type === 'Green' ? 'border-green-200 text-green-700 bg-green-50' :
                            alert.type === 'Roast' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            'border-blue-200 text-blue-700 bg-blue-50'
                          }`}>
                            {alert.type === 'Green' ? 'Yeşil Çekirdek' : alert.type === 'Roast' ? 'Kavrulmuş Çekirdek' : 'Paketleme'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-neutral-900">{alert.name}</td>
                        <td className="px-6 py-4 text-sm font-light text-neutral-600">{alert.current} {alert.unit}</td>
                        <td className="px-6 py-4 text-right">
                            {alert.status === 'Critical' ? (
                              <span className="text-red-600 text-xs font-medium flex items-center justify-end gap-1"><AlertTriangle size={12}/> KRİTİK</span>
                            ) : (
                              <span className="text-amber-500 text-xs font-medium flex items-center justify-end gap-1"><TrendingUp size={12} className="rotate-180"/> AZALIYOR</span>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>

        {/* BOTTOM SECTION: RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Production */}
            <div className="bg-white border border-neutral-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-light text-neutral-900 tracking-wide">Son Üretimler</h3>
                    <Box size={18} className="text-neutral-400" strokeWidth={1.5}/>
                </div>
                <div className="space-y-4">
                    {productionLogs.slice(0, 5).map(log => (
                        <div key={log.id} className="flex justify-between items-center pb-3 border-b border-neutral-50 last:border-0 last:pb-0">
                            <div>
                                <div className="text-sm font-light text-neutral-900">{log.productName}</div>
                                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{log.brand} · {log.packSize}g</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-light text-neutral-900">+{log.packCount}</div>
                                <div className="text-[10px] text-neutral-400">{new Date(log.date).toLocaleDateString('tr-TR', {month:'short', day:'numeric'})}</div>
                            </div>
                        </div>
                    ))}
                    {productionLogs.length === 0 && <div className="text-neutral-400 text-sm font-light italic text-center py-4">Kayıt yok.</div>}
                </div>
            </div>

            {/* Recent Orders */}
             <div className="bg-white border border-neutral-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-light text-neutral-900 tracking-wide">Son Siparişler</h3>
                    <Truck size={18} className="text-neutral-400" strokeWidth={1.5}/>
                </div>
                <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex justify-between items-center pb-3 border-b border-neutral-50 last:border-0 last:pb-0">
                            <div>
                                <div className="text-sm font-light text-neutral-900">{order.customerName}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Pending' ? 'bg-amber-400' : 'bg-green-500'}`}></span>
                                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{order.status === 'Pending' ? 'Bekliyor' : 'Sevk Edildi'}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-light text-neutral-900">{order.totalQuantity} Paket</div>
                                <div className="text-[10px] text-neutral-400">{new Date(order.createDate).toLocaleDateString('tr-TR', {month:'short', day:'numeric'})}</div>
                            </div>
                        </div>
                    ))}
                     {orders.length === 0 && <div className="text-neutral-400 text-sm font-light italic text-center py-4">Sipariş yok.</div>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};