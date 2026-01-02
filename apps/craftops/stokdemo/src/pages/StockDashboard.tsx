import { useMemo } from "react";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Factory,
  Boxes,
  ArrowRight
} from "lucide-react";
import { useInventory } from "../context/InventoryContext"; // Yeni Context
import { Link } from "react-router-dom";

export default function StockDashboard() {
  // Yeni üretim beyninden verileri çekiyoruz
  const { materials, products, logs } = useInventory();

  const stats = useMemo(() => {
    // 1. Toplam Hammadde Çeşidi
    const totalMaterials = materials.length;
    
    // 2. Kritik Seviyedeki Hammaddeler
    const criticalMaterials = materials.filter(m => m.stock <= m.minLimit);

    // 3. Hazır Ürün (Son Ürün) Sayısı ve Toplam Stoğu
    const finishedGoods = products.filter(p => p.type === 'finished');
    const totalFinishedStock = finishedGoods.reduce((acc, p) => acc + p.stock, 0);

    // 4. Yarı Mamül Stoğu
    const semiFinishedStock = products.filter(p => p.type === 'semi').reduce((acc, p) => acc + p.stock, 0);

    return { 
      totalMaterials, 
      criticalMaterials, 
      totalFinishedStock, 
      finishedGoodsCount: finishedGoods.length,
      semiFinishedStock
    };
  }, [materials, products]);

  // Son 5 üretim kaydı (Tersine çevirip ilk 5'i alıyoruz)
  const recentLogs = [...logs].reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-light tracking-tight text-neutral-900">
              GENEL BAKIŞ
            </h1>
            <p className="text-neutral-500 mt-1 font-light">
              Fabrika üretim özeti ve depo durumu.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* --- KPI KARTLARI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* KART 1: HAZIR ÜRÜN STOĞU */}
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Package size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">HAZIR ÜRÜNLER</span>
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <Package size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-light text-neutral-900">
                {stats.totalFinishedStock} <span className="text-sm text-neutral-400">Adet</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">{stats.finishedGoodsCount} farklı ürün çeşidi</p>
            </div>
          </div>

          {/* KART 2: ÜRETİM HATTI (YARI MAMÜL) */}
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">ÜRETİM HATTI</span>
              <div className="p-2 rounded-full bg-orange-50 text-orange-600">
                <Factory size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-light text-neutral-900">
                {stats.semiFinishedStock} <span className="text-sm text-neutral-400">Parça</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">Montaj bekleyen yarı mamül</p>
            </div>
          </div>

          {/* KART 3: KRİTİK STOK */}
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            {stats.criticalMaterials.length > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">KRİTİK HAMMADDE</span>
              <div className={`p-2 rounded-full ${stats.criticalMaterials.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div>
              <div className={`text-3xl font-light ${stats.criticalMaterials.length > 0 ? 'text-red-700' : 'text-neutral-900'}`}>
                {stats.criticalMaterials.length} <span className="text-sm text-neutral-400">Kalem</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">
                {stats.criticalMaterials.length > 0 ? "Tedarik edilmesi gerekenler var" : "Stoklar güvenli seviyede"}
              </p>
            </div>
          </div>

          {/* KART 4: HAMMADDE ÇEŞİDİ */}
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">HAMMADDE ÇEŞİDİ</span>
              <div className="p-2 rounded-full bg-neutral-100 text-neutral-600">
                <Boxes size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-light text-neutral-900">
                {stats.totalMaterials} <span className="text-sm text-neutral-400">Çeşit</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">Depodaki tanımlı malzeme</p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TABLO: KRİTİK STOKLAR */}
          <div className="bg-white border border-neutral-200 shadow-sm">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-light text-neutral-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                Kritik Hammaddeler
              </h2>
              <Link to="/materials" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
                LİSTEYE GİT <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-xs text-neutral-500 font-medium">
                  <tr>
                    <th className="px-6 py-3 tracking-wider">MALZEME</th>
                    <th className="px-6 py-3 tracking-wider text-right">MEVCUT</th>
                    <th className="px-6 py-3 tracking-wider text-right">LİMİT</th>
                    <th className="px-6 py-3 tracking-wider text-center">DURUM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {stats.criticalMaterials.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-neutral-900 font-light">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-red-600">
                        {item.stock} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-neutral-500">
                        {item.minLimit} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase">
                            STOK AZ
                         </span>
                      </td>
                    </tr>
                  ))}
                  {stats.criticalMaterials.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-neutral-400 text-sm font-light">Harika! Kritik seviyede hammadde yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LİSTE: SON ÜRETİM HAREKETLERİ */}
          <div className="bg-white border border-neutral-200 shadow-sm">
             <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-light text-neutral-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                Son Üretimler
              </h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <Factory size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{log.message}</p>
                        <p className="text-xs text-neutral-400">{new Date(log.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                   </div>
                   <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded border border-neutral-200">TAMAMLANDI</span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div className="p-8 text-center text-neutral-400 font-light text-sm">
                  Henüz üretim kaydı bulunmuyor.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}