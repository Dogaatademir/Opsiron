import { useState, useMemo } from 'react';
import { Package, Plus, Search, Trash2, Filter, AlertTriangle, Box, ShoppingBag } from 'lucide-react';
import { useInventory, RawMaterial } from '../context/InventoryContext';
import { CustomSelect } from '../components/CustomSelect';
import { Modal } from '../components/Modal';

// --- SEÇENEKLER ---
const CATEGORY_OPTIONS = [
  { value: 'Ahşap', label: 'Ahşap & Kereste' },
  { value: 'Hırdavat', label: 'Hırdavat & Bağlantı' },
  { value: 'Metal', label: 'Metal & Profil' },
  { value: 'Kimyasal', label: 'Boya & Kimyasal' },
  { value: 'Tekstil', label: 'Kumaş & Döşeme' },
  { value: 'Ambalaj', label: 'Ambalaj & Paketleme' },
  { value: 'Sarf', label: 'Sarf Malzeme' },
  { value: 'Hammadde', label: 'Diğer Hammaddeler' },
];

const UNIT_OPTIONS = [
  { value: 'Adet', label: 'Adet' },
  { value: 'Kg', label: 'Kilogram (kg)' },
  { value: 'Mt', label: 'Metre (m)' },
  { value: 'm2', label: 'Metrekare (m²)' },
  { value: 'm3', label: 'Metreküp (m³)' },
  { value: 'Lt', label: 'Litre (Lt)' },
  { value: 'Plaka', label: 'Plaka' },
  { value: 'Kutu', label: 'Kutu' },
  { value: 'Tk', label: 'Takım' },
  { value: 'Rulo', label: 'Rulo' },
  { value: 'Tnk', label: 'Teneke' },
];

export default function MaterialsPage() {
  const { materials, addMaterial, removeMaterial, restockItem } = useInventory();
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'NEW' | 'RESTOCK'>('NEW');
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  
  const [form, setForm] = useState({ name: '', category: 'Ahşap', unit: 'Adet', stock: '', minLimit: '' });
  const [restockQty, setRestockQty] = useState<number | ''>('');
  
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // --- ACTIONS ---

  const openNewModal = () => {
    setModalMode('NEW');
    setForm({ name: '', category: 'Ahşap', unit: 'Adet', stock: '', minLimit: '' });
    setIsModalOpen(true);
  };

  const openRestockModal = (material: RawMaterial) => {
    setModalMode('RESTOCK');
    setSelectedMaterial(material);
    setRestockQty('');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return alert("Malzeme adı giriniz.");
    addMaterial({
      id: crypto.randomUUID(),
      name: form.name,
      category: form.category,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      minLimit: Number(form.minLimit) || 0
    });
    setIsModalOpen(false);
  };

  const handleRestock = () => {
    if (!selectedMaterial || !restockQty || Number(restockQty) <= 0) return alert("Geçerli bir miktar giriniz.");
    restockItem(selectedMaterial.id, Number(restockQty));
    setIsModalOpen(false);
  };

  // Filtreleme
  const filtered = useMemo(() => {
    return materials.filter(m => {
      const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [materials, query, categoryFilter]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">HAMMADDELER</h1>
            <p className="text-neutral-500 mt-1 font-light">Depo Envanter Girişi</p>
          </div>
          <button 
            onClick={openNewModal} 
            className="bg-neutral-900 text-white px-6 py-4 flex items-center gap-2 hover:bg-neutral-800 transition-colors font-light tracking-wide"
          >
            <Plus size={18} /> YENİ MALZEME EKLE
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- FİLTRELEME BARI --- */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-2 border border-neutral-200 shadow-sm">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto p-2">
               <button onClick={() => setCategoryFilter('all')} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${categoryFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-200'}`}>TÜMÜ</button>
               {CATEGORY_OPTIONS.map(cat => (
                  <button key={cat.value} onClick={() => setCategoryFilter(cat.value)} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${categoryFilter === cat.value ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-200'}`}>{cat.value.toUpperCase()}</button>
               ))}
            </div>
            <div className="relative w-full md:w-72 mr-2">
               <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Malzeme ara..." className="w-full p-3 pl-10 text-sm border border-neutral-200 bg-neutral-50 outline-none focus:border-neutral-900 focus:bg-white font-light transition-colors rounded-sm"/>
               <Search className="absolute left-3 top-3.5 text-neutral-400" size={16} />
            </div>
        </div>

        {/* --- KART LİSTESİ --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(m => {
            const isCritical = m.stock <= m.minLimit;
            return (
              <div key={m.id} className="bg-white border border-neutral-200 p-6 hover:shadow-lg transition-all group flex flex-col justify-between relative overflow-hidden">
                {isCritical && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded ${isCritical ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-600'}`}>
                      {isCritical ? <AlertTriangle size={20} /> : <Box size={20} />}
                    </div>
                    {/* HIZLI STOK EKLEME BUTONU */}
                    <button 
                      onClick={() => openRestockModal(m)}
                      className="p-2 bg-neutral-50 text-neutral-400 hover:bg-neutral-900 hover:text-white rounded-full transition-colors"
                      title="Stok Ekle / Satın Al"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 mb-2 bg-neutral-50 text-neutral-500 text-[10px] font-bold uppercase tracking-wider border border-neutral-100">{m.category}</span>
                    <h3 className="text-lg font-medium text-neutral-900 leading-tight">{m.name}</h3>
                  </div>
                </div>

                <div>
                   <div className="flex items-end justify-between mb-3">
                      <span className="text-3xl font-light text-neutral-900 tracking-tight">{m.stock} <span className="text-sm text-neutral-400 font-light ml-0.5">{m.unit}</span></span>
                   </div>
                   <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Kritik Seviye</span>
                          <span className={`text-sm font-medium ${isCritical ? 'text-red-600' : 'text-neutral-600'}`}>{m.minLimit} {m.unit}</span>
                      </div>
                      <button onClick={() => { if(confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) removeMaterial(m.id) }} className="p-2 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={18} strokeWidth={1.5}/></button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-lg"><p className="text-neutral-400 font-light">Kayıt bulunamadı.</p></div>
        )}
      </div>

      {/* --- MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'NEW' ? "YENİ MALZEME KARTI" : "STOK GİRİŞİ / SATIN ALMA"}>
        {modalMode === 'NEW' ? (
            // YENİ EKLEME FORMU
            <div className="space-y-6">
                <div><label className="block text-xs font-medium text-neutral-500 mb-2 tracking-wider">MALZEME ADI</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-4 border border-neutral-300 outline-none focus:border-neutral-900 font-light placeholder:text-neutral-300 transition-colors" placeholder="Örn: Ham Kereste"/></div>
                <div className="grid grid-cols-2 gap-4">
                   <div><CustomSelect label="KATEGORİ" value={form.category} onChange={v => setForm({...form, category: v})} options={CATEGORY_OPTIONS} placeholder="Seç" icon={Filter} /></div>
                   <div><CustomSelect label="BİRİM" value={form.unit} onChange={v => setForm({...form, unit: v})} options={UNIT_OPTIONS} placeholder="Seç" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-xs font-medium text-neutral-500 mb-2 tracking-wider">AÇILIŞ STOK</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full p-4 border border-neutral-300 outline-none focus:border-neutral-900 font-light" placeholder="0"/></div>
                   <div><label className="block text-xs font-medium text-neutral-500 mb-2 tracking-wider text-red-400">KRİTİK SINIR</label><input type="number" value={form.minLimit} onChange={e => setForm({...form, minLimit: e.target.value})} className="w-full p-4 border border-neutral-300 outline-none focus:border-red-400 font-light" placeholder="Min"/></div>
                </div>
                <button onClick={handleAdd} className="w-full h-14 bg-neutral-900 text-white font-light tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99] mt-4">KAYDET</button>
            </div>
        ) : (
            // STOK EKLEME FORMU
            <div className="space-y-6">
                <div className="bg-neutral-50 p-4 border border-neutral-200">
                    <div className="text-xs text-neutral-500 mb-1 uppercase tracking-wider">Seçilen Malzeme</div>
                    <div className="text-lg font-medium text-neutral-900">{selectedMaterial?.name}</div>
                    <div className="text-sm text-neutral-500 mt-1">Mevcut Stok: {selectedMaterial?.stock} {selectedMaterial?.unit}</div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2 tracking-wider">EKLENECEK MİKTAR</label>
                    <div className="relative">
                        <input type="number" min="1" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} className="w-full p-4 text-2xl border border-neutral-300 outline-none focus:border-neutral-900 font-light text-neutral-900" placeholder="0" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium uppercase">{selectedMaterial?.unit}</span>
                    </div>
                </div>
                <button onClick={handleRestock} className="w-full h-14 bg-neutral-900 text-white font-light tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99] mt-4">STOK GİRİŞİ YAP</button>
            </div>
        )}
      </Modal>

    </div>
  );
}