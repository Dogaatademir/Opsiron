import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';

const ENTITY_TYPE_OPTIONS = [
  { value: 'customer', label: 'Müşteri' },
  { value: 'supplier', label: 'Tedarikçi' }
];

export default function EntitiesPage() {
  const { entities, addEntity } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'customer' | 'supplier'>('all');

  // Yeni Cari Formu
  const [form, setForm] = useState({ name: '', type: 'customer', balance: 0 });

  const handleSave = () => {
    if (!form.name) return alert("Cari adı zorunludur.");
    addEntity({
      id: crypto.randomUUID(),
      name: form.name,
      contact: '-', // İlgili kişi alanı kaldırıldığı için varsayılan değer
      type: form.type as 'customer' | 'supplier',
      balance: Number(form.balance)
    });
    setIsModalOpen(false);
    setForm({ name: '', type: 'customer', balance: 0 });
  };

  const filtered = useMemo(() => {
    return entities.filter(e => {
      const matchQuery = e.name.toLowerCase().includes(query.toLowerCase());
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      return matchQuery && matchType;
    });
  }, [entities, query, typeFilter]);

  // Sayfa Üstü Özet Hesaplama
  const stats = useMemo(() => {
      const totalReceivables = entities.reduce((acc, e) => acc + (e.balance > 0 ? e.balance : 0), 0);
      const totalPayables = entities.reduce((acc, e) => acc + (e.balance < 0 ? Math.abs(e.balance) : 0), 0);
      return { totalReceivables, totalPayables };
  }, [entities]);

  const fmt = (num: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">CARİ HESAPLAR</h1>
            <p className="text-neutral-500 mt-1 font-light">Müşteri ve Tedarikçi Yönetimi</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-neutral-900 text-white px-6 py-4 flex items-center gap-2 hover:bg-neutral-800 transition-colors font-light tracking-wide">
            <Plus size={18} /> YENİ CARİ EKLE
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* --- ÖZET KARTLARI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 border border-neutral-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div>
                   <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">TOPLAM ALACAKLARIMIZ</span>
                   <div className="text-3xl font-light text-green-600 mt-1">{fmt(stats.totalReceivables)}</div>
                   <p className="text-xs text-neutral-400 mt-1">Piyasadan tahsil edilecek tutar</p>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-full"><TrendingUp size={24}/></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/20"></div>
            </div>

            <div className="bg-white p-6 border border-neutral-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div>
                   <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">TOPLAM BORÇLARIMIZ</span>
                   <div className="text-3xl font-light text-red-600 mt-1">{fmt(stats.totalPayables)}</div>
                   <p className="text-xs text-neutral-400 mt-1">Tedarikçilere ödenecek tutar</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-full"><TrendingDown size={24}/></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/20"></div>
            </div>
        </div>
        
        {/* FİLTRE & ARAMA */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-2 border border-neutral-200 shadow-sm">
            <div className="flex gap-2 p-2">
               <button onClick={() => setTypeFilter('all')} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${typeFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600'}`}>TÜMÜ</button>
               <button onClick={() => setTypeFilter('customer')} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${typeFilter === 'customer' ? 'bg-blue-600 text-white' : 'bg-neutral-50 text-neutral-600'}`}>MÜŞTERİLER</button>
               <button onClick={() => setTypeFilter('supplier')} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${typeFilter === 'supplier' ? 'bg-orange-600 text-white' : 'bg-neutral-50 text-neutral-600'}`}>TEDARİKÇİLER</button>
            </div>
            <div className="relative w-full md:w-72 mr-2">
               <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari adı ara..." className="w-full p-3 pl-10 text-sm border border-neutral-200 bg-neutral-50 outline-none focus:border-neutral-900 font-light rounded-sm"/>
               <Search className="absolute left-3 top-3.5 text-neutral-400" size={16} />
            </div>
        </div>

        {/* LİSTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(e => (
            <Link 
              to={`/entities/${e.id}`} 
              key={e.id} 
              className="bg-white border border-neutral-200 p-6 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer block group min-h-[180px]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded ${e.type === 'customer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    <Users size={20}/>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${e.type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {e.type === 'customer' ? 'Müşteri' : 'Tedarikçi'}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">{e.name}</h3>
                {/* İlgili kişi alanı buradan kaldırıldı */}
              </div>

              <div className="border-t border-neutral-100 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">BAKİYE</span>
                  <span className={`text-lg font-bold ${e.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmt(Math.abs(e.balance))}
                  </span>
                </div>
                <div className="text-right text-[10px] text-neutral-400 mt-1 uppercase font-bold tracking-widest">
                    {e.balance >= 0 ? 'ALACAK' : 'BORÇ'}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400 font-light">
                Kayıt bulunamadı.
            </div>
        )}
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="YENİ CARİ KART">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-neutral-500 mb-2 block">FİRMA / KİŞİ ADI</label>
            <input className="w-full p-4 border border-neutral-300 outline-none font-light focus:border-neutral-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Örn: Yılmazlar A.Ş." />
          </div>
          
          {/* İlgili Kişi kaldırıldı, Tip seçimi tam genişlik yapıldı */}
          <div>
             <CustomSelect 
                label="TİP"
                value={form.type} 
                onChange={v => setForm({...form, type: v})}
                options={ENTITY_TYPE_OPTIONS}
             />
          </div>

          <div>
             <label className="text-xs font-bold text-neutral-500 mb-2 block">AÇILIŞ BAKİYESİ (TL)</label>
             <input type="number" className="w-full p-4 border border-neutral-300 outline-none font-light" value={form.balance} onChange={e => setForm({...form, balance: Number(e.target.value)})} />
             <p className="text-[10px] text-neutral-400 mt-1">* Pozitif (+) Alacak, Negatif (-) Borç anlamına gelir.</p>
          </div>

          <button onClick={handleSave} className="w-full bg-neutral-900 text-white py-4 mt-2 font-light tracking-widest hover:bg-neutral-800">KAYDET</button>
        </div>
      </Modal>
    </div>
  );
}