import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Coffee, AlertCircle, Coins } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useStore } from '../context/StoreContext';
import type { GreenCoffee } from '../context/StoreContext'; 

export const GreenCoffeePage = () => {
  const { greenCoffees, settings, addGreenCoffee, updateGreenCoffee, deleteGreenCoffee } = useStore();
  const { critical, low } = settings.thresholds.greenCoffee; // Dinamik Eşikler

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<GreenCoffee, 'id'>>({ name: '', origin: '', process: '', stockKg: 0, entryDate: new Date().toISOString().split('T')[0]});

  const openModal = (coffee?: GreenCoffee) => {
    if (coffee) {
      setEditingId(coffee.id);
      setFormData({ name: coffee.name, origin: coffee.origin, process: coffee.process, stockKg: coffee.stockKg, entryDate: coffee.entryDate });
    } else {
      setEditingId(null);
      setFormData({ name: '', origin: '', process: '', stockKg: 0, entryDate: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { updateGreenCoffee({ ...formData, id: editingId }); } else {
      addGreenCoffee({ ...formData, id: `GC-${Math.floor(1000 + Math.random() * 9000)}` });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => { if (window.confirm('Bu stok kaydını silmek istiyor musunuz?')) deleteGreenCoffee(id); };
  const filteredCoffees = greenCoffees.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.origin.toLowerCase().includes(searchTerm.toLowerCase()));

  // Visual Helper for Progress Bar
  const StockBar = ({ current, max = 500 }: { current: number, max?: number }) => {
      const pct = Math.min((current / max) * 100, 100);
      const color = current < critical ? 'bg-red-500' : current < low ? 'bg-amber-400' : 'bg-neutral-900';
      return (
          <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-2 overflow-hidden">
              <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
          </div>
      );
  };

  // Helper: Para Birimi Formatla
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">YEŞİL ÇEKİRDEK</h1>
              <p className="text-neutral-500 mt-1 font-light">Çiğ çekirdek envanter ve maliyet yönetimi</p>
            </div>
            <button onClick={() => openModal()} className="flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-4 transition-all active:scale-[0.99] font-light tracking-wide">
              <Plus size={18} strokeWidth={1.5} /> <span>YENİ STOK</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white p-4 border border-neutral-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-full md:max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} strokeWidth={1.5} />
            <input type="text" placeholder="İsim, ID veya köken ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-neutral-50 md:bg-transparent outline-none text-neutral-700 placeholder-neutral-400 transition-all font-light border md:border-none border-neutral-200 focus:bg-white"/>
          </div>
        </div>

        <div className="hidden md:block bg-white border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em]">Kahve Bilgisi</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em]">Köken & İşlem</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em]" style={{width: '20%'}}>Mevcut Stok</th>
                  {/* YENİ SÜTUNLAR */}
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em] text-right">Ort. Maliyet</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em] text-right">Toplam Değer</th>
                  <th className="px-6 py-5 text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em] text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCoffees.map((coffee) => (
                  <tr key={coffee.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-light text-neutral-900 text-base tracking-wide">{coffee.name}</span>
                        <span className="text-xs text-neutral-400 font-light mt-1">{coffee.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 items-start">
                        <span className="text-sm font-light text-neutral-700">{coffee.origin}</span>
                        <span className="inline-block px-2 py-0.5 border border-neutral-200 text-neutral-500 text-[10px] uppercase font-light tracking-wide">{coffee.process}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex justify-between items-end mb-1">
                          <span className="font-light text-neutral-900">{coffee.stockKg.toFixed(1)} kg</span>
                          <span className={`text-[10px] ${coffee.stockKg < critical ? 'text-red-600 font-medium' : coffee.stockKg < low ? 'text-amber-600' : 'text-neutral-400'}`}>
                              {coffee.stockKg < critical ? 'KRİTİK' : coffee.stockKg < low ? 'AZ' : 'İYİ'}
                          </span>
                      </div>
                      <StockBar current={coffee.stockKg} />
                    </td>
                    
                    {/* MALİYET SÜTUNLARI */}
                    <td className="px-6 py-5 text-right">
                        <div className="text-sm font-light text-neutral-900">
                            {coffee.averageCost ? formatCurrency(coffee.averageCost) : '-'} <span className="text-[10px] text-neutral-400">/kg</span>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                        <div className="text-sm font-medium text-neutral-900">
                            {coffee.averageCost ? formatCurrency(coffee.stockKg * coffee.averageCost) : '-'}
                        </div>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(coffee)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"><Pencil size={18} strokeWidth={1.5} /></button>
                        <button onClick={() => handleDelete(coffee.id)} className="p-2 text-neutral-400 hover:text-red-600 transition-colors"><Trash2 size={18} strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBİL GÖRÜNÜM */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredCoffees.map((coffee) => (
            <div key={coffee.id} className="bg-white p-6 border border-neutral-200 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-light text-neutral-900 text-lg leading-tight tracking-wide">{coffee.name}</h3>
                  <span className="text-xs text-neutral-400 font-light mt-1 block">{coffee.id}</span>
                </div>
              </div>
              
              <div>
                  <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Stok Durumu</span>
                      <span className="font-light text-neutral-900">{coffee.stockKg.toFixed(1)} kg</span>
                  </div>
                  <StockBar current={coffee.stockKg} />
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-neutral-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Köken</span>
                  <span className="text-sm font-light text-neutral-700">{coffee.origin}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">İşlem</span>
                  <span className="text-sm font-light text-neutral-700">{coffee.process}</span>
                </div>
              </div>
              
              {/* MOBİL MALİYET KISMI */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-100">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Birim Maliyet</span>
                    <span className="text-sm font-light text-neutral-900 flex items-center gap-1">
                        <Coins size={12} className="text-neutral-400"/>
                        {coffee.averageCost ? formatCurrency(coffee.averageCost) : '-'}
                    </span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Toplam Değer</span>
                    <span className="text-sm font-medium text-neutral-900">
                         {coffee.averageCost ? formatCurrency(coffee.stockKg * coffee.averageCost) : '-'}
                    </span>
                 </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => openModal(coffee)} className="p-3 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"><Pencil size={20} strokeWidth={1.5} /></button>
                  <button onClick={() => handleDelete(coffee.id)} className="p-3 bg-neutral-50 text-neutral-600 hover:bg-red-50 hover:text-red-600"><Trash2 size={20} strokeWidth={1.5} /></button>
              </div>
            </div>
          ))}
        </div>

        {filteredCoffees.length === 0 && (
          <div className="bg-white border border-neutral-200 p-12 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
              {greenCoffees.length === 0 ? <Coffee size={32} className="text-neutral-300" strokeWidth={1.5} /> : <AlertCircle size={32} className="text-neutral-300" strokeWidth={1.5} />}
            </div>
            <h3 className="text-neutral-900 font-light text-lg mb-2 tracking-wide">KAYIT BULUNAMADI</h3>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto font-light mb-6">
              {greenCoffees.length === 0 ? "Sisteme henüz yeşil çekirdek stoğu eklenmedi." : "Arama kriterlerinize uygun stok kaydı bulunamadı."}
            </p>
            <button onClick={() => openModal()} className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 transition-colors text-sm font-light tracking-wide">
                <Plus size={16} strokeWidth={1.5}/> STOK EKLE
            </button>
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "STOĞU DÜZENLE" : "YENİ STOK"}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Kahve Adı</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none transition-all font-light focus:border-neutral-900"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Köken</label>
                <input required type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none transition-all font-light focus:border-neutral-900"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">İşlem</label>
                <select required value={formData.process} onChange={e => setFormData({...formData, process: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none appearance-none font-light focus:border-neutral-900">
                  <option value="">Seçiniz</option>
                  <option value="Washed">Washed</option>
                  <option value="Natural">Natural</option>
                  <option value="Honey">Honey</option>
                  <option value="Anaerobic">Anaerobic</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Stok (KG)</label>
                <div className="relative">
                  <input required type="number" min="0" step="0.1" value={formData.stockKg} onChange={e => setFormData({...formData, stockKg: Number(e.target.value)})} className="w-full pl-4 pr-12 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-light pointer-events-none">KG</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Giriş Tarihi</label>
                <input required type="date" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} className="w-full px-4 py-3 bg-white border border-neutral-300 outline-none font-light focus:border-neutral-900" />
              </div>
            </div>
            {/* Not: Maliyet alanı burada manuel olarak düzenlenemez, satın alımlardan otomatik gelir. */}
             <button type="submit" className="w-full mt-4 px-6 py-4 bg-neutral-900 text-white hover:bg-neutral-800 transition-all active:scale-[0.99] font-light tracking-wide">{editingId ? 'DEĞİŞİKLİKLERİ KAYDET' : 'STOK EKLE'}</button>
          </form>
        </Modal>
      </div>
    </div>
  );
};