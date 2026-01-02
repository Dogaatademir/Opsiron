import { useState } from 'react';
import { useFinance, Material, RecipeItem } from '../context/FinanceContext';
import { Modal } from '../components/Modal';
import { Package, Plus, Calculator, Trash2, ArrowRight } from 'lucide-react';

export default function ProductionPage() {
  const { materials, addMaterial, recipes, addRecipe, calculateRecipeCost } = useFinance();
  
  const [activeTab, setActiveTab] = useState<'materials' | 'recipes'>('recipes');
  
  // MODAL STATES
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);

  // HAMMADDE FORM
  const [matForm, setMatForm] = useState({ name: '', unit: 'adet', unitCost: '' });

  // REÇETE FORM
  const [recForm, setRecForm] = useState({ name: '', laborCost: '', suggestedPrice: '' });
  const [recItems, setRecItems] = useState<RecipeItem[]>([]);
  const [tempItem, setTempItem] = useState({ materialId: '', amount: '' });

  // --- HAMMADDE İŞLEMLERİ ---
  const handleSaveMaterial = () => {
    if(!matForm.name || !matForm.unitCost) return alert("Eksik bilgi!");
    addMaterial({
        id: crypto.randomUUID(),
        name: matForm.name,
        unit: matForm.unit,
        unitCost: Number(matForm.unitCost)
    });
    setMatForm({ name: '', unit: 'adet', unitCost: '' });
    setIsMatModalOpen(false);
  };

  // --- REÇETE İŞLEMLERİ ---
  const addMaterialToRecipe = () => {
     if(!tempItem.materialId || !tempItem.amount) return;
     setRecItems([...recItems, { materialId: tempItem.materialId, amount: Number(tempItem.amount) }]);
     setTempItem({ materialId: '', amount: '' });
  };

  const removeMaterialFromRecipe = (index: number) => {
     setRecItems(recItems.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = () => {
     if(!recForm.name) return alert("Reçete adı giriniz.");
     const cost = calculateRecipeCost(recItems, Number(recForm.laborCost));
     
     addRecipe({
        id: crypto.randomUUID(),
        name: recForm.name,
        items: recItems,
        laborCost: Number(recForm.laborCost),
        totalCost: cost,
        suggestedPrice: Number(recForm.suggestedPrice) || (cost * 1.3) // Varsayılan %30 kar
     });
     
     setRecForm({ name: '', laborCost: '', suggestedPrice: '' });
     setRecItems([]);
     setIsRecModalOpen(false);
  };

  // Format
  const fmt = (num: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">ÜRETİM & MALİYET</h1>
            <p className="text-neutral-500 mt-1 font-light">Reçete bazlı maliyetlendirme</p>
          </div>
          <div className="flex gap-2">
              <button onClick={() => setIsMatModalOpen(true)} className="bg-white border border-neutral-300 text-neutral-900 px-4 py-3 flex items-center gap-2 hover:bg-neutral-50 font-light text-sm">
                <Package size={16}/> YENİ HAMMADDE
              </button>
              <button onClick={() => setIsRecModalOpen(true)} className="bg-neutral-900 text-white px-6 py-3 flex items-center gap-2 hover:bg-neutral-800 font-light text-sm tracking-wide">
                <Calculator size={16}/> YENİ REÇETE
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TABS */}
        <div className="flex gap-6 border-b border-neutral-200 mb-6">
            <button onClick={() => setActiveTab('recipes')} className={`pb-3 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors ${activeTab === 'recipes' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400'}`}>
                Reçeteler / Ürünler
            </button>
            <button onClick={() => setActiveTab('materials')} className={`pb-3 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors ${activeTab === 'materials' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400'}`}>
                Hammadde Listesi
            </button>
        </div>

        {/* --- REÇETELER TAB --- */}
        {activeTab === 'recipes' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map(r => {
                    const profit = r.suggestedPrice - r.totalCost;
                    const margin = (profit / r.suggestedPrice) * 100;
                    return (
                    <div key={r.id} className="bg-white border border-neutral-200 p-6 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-medium text-neutral-900">{r.name}</h3>
                            <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-500">{r.items.length} Malzeme</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                           <div className="flex justify-between text-sm">
                              <span className="text-neutral-500">Maliyet:</span>
                              <span className="font-bold text-red-600">{fmt(r.totalCost)}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-neutral-500">Satış Fiyatı:</span>
                              <span className="font-bold text-green-600">{fmt(r.suggestedPrice)}</span>
                           </div>
                           <div className="w-full h-px bg-neutral-100 my-2"></div>
                           <div className="flex justify-between text-sm items-center">
                              <span className="text-neutral-500 font-medium">Birim Kar:</span>
                              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                 {fmt(profit)} (%{margin.toFixed(0)})
                              </span>
                           </div>
                        </div>

                        <div className="text-xs text-neutral-400 mt-2">
                           <p className="font-bold text-neutral-500 mb-1 uppercase tracking-wider">İÇERİK:</p>
                           {r.items.slice(0, 3).map((item, idx) => {
                              const mat = materials.find(m => m.id === item.materialId);
                              return <div key={idx}>{mat?.name} ({item.amount} {mat?.unit})</div>
                           })}
                           {r.items.length > 3 && <div>+ {r.items.length - 3} diğer...</div>}
                        </div>
                    </div>
                    )
                })}
                {recipes.length === 0 && <div className="col-span-3 p-12 text-center text-neutral-400 border border-dashed border-neutral-200">Henüz reçete oluşturulmadı.</div>}
             </div>
        )}

        {/* --- HAMMADDE TAB --- */}
        {activeTab === 'materials' && (
            <div className="bg-white border border-neutral-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-xs text-neutral-500 font-medium border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-4">AD</th>
                            <th className="px-6 py-4">BİRİM</th>
                            <th className="px-6 py-4 text-right">BİRİM MALİYET</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {materials.map(m => (
                            <tr key={m.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-4 font-medium text-neutral-900">{m.name}</td>
                                <td className="px-6 py-4 text-sm text-neutral-500">{m.unit}</td>
                                <td className="px-6 py-4 text-sm font-mono text-right">{fmt(m.unitCost)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {materials.length === 0 && <div className="p-8 text-center text-neutral-400">Hammadde listesi boş.</div>}
            </div>
        )}
      </div>

      {/* --- HAMMADDE MODAL --- */}
      <Modal isOpen={isMatModalOpen} onClose={() => setIsMatModalOpen(false)} title="YENİ HAMMADDE">
         <div className="space-y-4">
             <div>
                 <label className="text-xs font-bold text-neutral-500 mb-2 block">HAMMADDE ADI</label>
                 <input className="w-full p-3 border border-neutral-300 outline-none" value={matForm.name} onChange={e => setMatForm({...matForm, name: e.target.value})} placeholder="Örn: MDF Plaka 18mm" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="text-xs font-bold text-neutral-500 mb-2 block">BİRİM</label>
                     <select className="w-full p-3 border border-neutral-300 bg-white" value={matForm.unit} onChange={e => setMatForm({...matForm, unit: e.target.value})}>
                         <option value="adet">Adet</option>
                         <option value="kg">Kg</option>
                         <option value="lt">Litre</option>
                         <option value="mt">Metre</option>
                         <option value="m2">m²</option>
                     </select>
                 </div>
                 <div>
                     <label className="text-xs font-bold text-neutral-500 mb-2 block">BİRİM MALİYET (TL)</label>
                     <input type="number" className="w-full p-3 border border-neutral-300 outline-none" value={matForm.unitCost} onChange={e => setMatForm({...matForm, unitCost: e.target.value})} placeholder="0.00" />
                 </div>
             </div>
             <button onClick={handleSaveMaterial} className="w-full bg-neutral-900 text-white py-4 mt-2 hover:bg-neutral-800">KAYDET</button>
         </div>
      </Modal>

      {/* --- REÇETE MODAL --- */}
      <Modal isOpen={isRecModalOpen} onClose={() => setIsRecModalOpen(false)} title="YENİ REÇETE OLUŞTUR">
         <div className="space-y-4">
            <div>
                 <label className="text-xs font-bold text-neutral-500 mb-2 block">ÜRÜN / REÇETE ADI</label>
                 <input className="w-full p-3 border border-neutral-300 outline-none" value={recForm.name} onChange={e => setRecForm({...recForm, name: e.target.value})} placeholder="Örn: Gardırop - Model A" />
             </div>

             {/* Malzeme Ekleme Alanı */}
             <div className="bg-neutral-50 p-4 rounded border border-neutral-200">
                 <label className="text-xs font-bold text-neutral-500 mb-2 block">KULLANILAN HAMMADDELER</label>
                 <div className="flex gap-2 mb-2">
                     <select className="flex-1 p-2 border border-neutral-300 text-sm" value={tempItem.materialId} onChange={e => setTempItem({...tempItem, materialId: e.target.value})}>
                         <option value="">Malzeme Seç...</option>
                         {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                     </select>
                     <input type="number" className="w-24 p-2 border border-neutral-300 text-sm" placeholder="Miktar" value={tempItem.amount} onChange={e => setTempItem({...tempItem, amount: e.target.value})} />
                     <button onClick={addMaterialToRecipe} className="bg-neutral-900 text-white px-3 rounded"><Plus size={16}/></button>
                 </div>
                 
                 {/* Eklenenler Listesi */}
                 <div className="space-y-2 mt-3">
                     {recItems.map((item, idx) => {
                         const mat = materials.find(m => m.id === item.materialId);
                         return (
                             <div key={idx} className="flex justify-between items-center bg-white p-2 border border-neutral-200 text-sm">
                                 <span>{mat?.name}</span>
                                 <div className="flex items-center gap-4">
                                     <span className="font-bold">{item.amount} {mat?.unit}</span>
                                     <button onClick={() => removeMaterialFromRecipe(idx)} className="text-red-500"><Trash2 size={14}/></button>
                                 </div>
                             </div>
                         )
                     })}
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="text-xs font-bold text-neutral-500 mb-2 block">EKSTRA İŞÇİLİK/GİDER (TL)</label>
                     <input type="number" className="w-full p-3 border border-neutral-300 outline-none" value={recForm.laborCost} onChange={e => setRecForm({...recForm, laborCost: e.target.value})} placeholder="0.00" />
                 </div>
                 <div>
                     <label className="text-xs font-bold text-neutral-500 mb-2 block">SATIŞ FİYATI (TL)</label>
                     <input type="number" className="w-full p-3 border border-neutral-300 outline-none" value={recForm.suggestedPrice} onChange={e => setRecForm({...recForm, suggestedPrice: e.target.value})} placeholder="Opsiyonel" />
                 </div>
             </div>

             <div className="bg-neutral-100 p-4 flex justify-between items-center rounded">
                 <span className="text-sm font-bold text-neutral-600">TAHMİNİ MALİYET:</span>
                 <span className="text-xl font-bold text-neutral-900">
                     {fmt(calculateRecipeCost(recItems, Number(recForm.laborCost)))}
                 </span>
             </div>

             <button onClick={handleSaveRecipe} className="w-full bg-green-600 text-white py-4 mt-2 hover:bg-green-700 font-bold tracking-widest">REÇETEYİ KAYDET</button>
         </div>
      </Modal>
    </div>
  );
}