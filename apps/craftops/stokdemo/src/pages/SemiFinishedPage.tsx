import { useState } from 'react';
import { Layers, Plus, Factory, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useInventory, Product, RecipeItem } from '../context/InventoryContext';
import { Modal } from '../components/Modal';

export default function SemiFinishedPage() {
  const { products, addProduct, produceItem, getAllIngredients } = useInventory();
  
  const semiProducts = products.filter(p => p.type === 'semi');
  const allIngredients = getAllIngredients();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProduceOpen, setIsProduceOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form
  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState<{itemId: string, qty: number}[]>([]);
  const [ingId, setIngId] = useState('');
  const [ingQty, setIngQty] = useState(1);
  const [produceQty, setProduceQty] = useState(1);

  const addIng = () => {
    if(!ingId) return;
    setRecipe([...recipe, { itemId: ingId, qty: ingQty }]);
    setIngId(''); setIngQty(1);
  };

  const handleSave = () => {
    if(!name || recipe.length === 0) return alert("Eksik bilgi.");
    const finalRecipe: RecipeItem[] = recipe.map(r => {
      const ref = allIngredients.find(i => i.id === r.itemId);
      return { itemId: r.itemId, type: ref?.type || 'raw', quantity: r.qty };
    });
    addProduct({ id: crypto.randomUUID(), name, type: 'semi', unit: 'Adet', stock: 0, recipe: finalRecipe });
    setIsModalOpen(false); setName(''); setRecipe([]);
  };

  const handleProduce = () => {
    if(!selectedProduct) return;
    const res = produceItem(selectedProduct.id, produceQty);
    if(res.success) { alert(res.message); setIsProduceOpen(false); setProduceQty(1); }
    else { alert("HATA: " + res.message); }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">YARI MAMÜLLER</h1>
            <p className="text-neutral-500 mt-1 font-light">Ara ürün reçeteleri ve üretimi</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-neutral-900 text-white px-6 py-4 flex items-center gap-2 hover:bg-neutral-800 transition-colors font-light tracking-wide">
            <Plus size={18}/> YENİ YARI MAMÜL
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* LİSTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semiProducts.map(p => (
            <div key={p.id} className="bg-white border border-neutral-200 p-6 hover:shadow-lg transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded"><Layers size={20}/></div>
                  <span className="text-3xl font-light text-neutral-900">{p.stock}</span>
                </div>
                <h3 className="text-xl font-light text-neutral-900 mb-4">{p.name}</h3>
                <div className="bg-neutral-50 p-3 mb-6 border border-neutral-100 text-xs text-neutral-500 space-y-1">
                  <span className="font-bold text-neutral-400 block mb-2 uppercase tracking-wider">REÇETE (Birim Başına)</span>
                  {p.recipe.map((r, i) => {
                    const ingName = allIngredients.find(x => x.id === r.itemId)?.name;
                    return <div key={i} className="flex justify-between border-b border-neutral-200 pb-1"><span>{ingName}</span><span>x {r.quantity}</span></div>
                  })}
                </div>
              </div>
              <button onClick={() => {setSelectedProduct(p); setIsProduceOpen(true);}} className="w-full py-3 bg-white border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center gap-2 font-light text-sm tracking-widest">
                <Factory size={16}/> ÜRETİM YAP
              </button>
            </div>
          ))}
        </div>

        {/* BOŞ STATE */}
        {semiProducts.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-lg">
                <p className="text-neutral-400 font-light">Henüz yarı mamül tanımlanmadı.</p>
            </div>
        )}
      </div>

      {/* MODAL: YENİ REÇETE */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="YENİ YARI MAMÜL TANIMLA">
        <div className="space-y-6">
          <div><label className="text-xs font-bold text-neutral-500 mb-2 block">YARI MAMÜL ADI</label><input className="w-full p-4 border border-neutral-300 outline-none font-light" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="bg-neutral-50 p-4 border border-neutral-200">
             <div className="flex gap-2 mb-2">
               <select className="flex-1 p-3 border border-neutral-300 bg-white outline-none" value={ingId} onChange={e => setIngId(e.target.value)}>
                  <option value="">İçerik Seçiniz...</option>
                  {allIngredients.map(i => <option key={i.id} value={i.id}>{i.type==='raw'?'[HAM]':'[YARI]'} {i.name} (Stok: {i.stock})</option>)}
               </select>
               <input type="number" className="w-20 p-3 border border-neutral-300 outline-none text-center" value={ingQty} onChange={e => setIngQty(Number(e.target.value))} />
               <button onClick={addIng} className="bg-neutral-900 text-white px-4">+</button>
             </div>
             <ul className="text-sm space-y-1">{recipe.map((r, i) => <li key={i} className="flex justify-between border-b border-neutral-200 py-1"><span>{allIngredients.find(x=>x.id===r.itemId)?.name}</span><span>x{r.qty}</span></li>)}</ul>
          </div>
          <button onClick={handleSave} className="w-full bg-neutral-900 text-white py-4 font-light tracking-widest hover:bg-neutral-800">KAYDET</button>
        </div>
      </Modal>

      {/* MODAL: ÜRETİM */}
      <Modal isOpen={isProduceOpen} onClose={() => setIsProduceOpen(false)} title={`ÜRETİM: ${selectedProduct?.name}`}>
         <div className="space-y-6">
            <div className="bg-orange-50 p-4 border border-orange-200 text-orange-800 text-xs flex gap-2"><AlertTriangle size={16}/><span>Bu işlem için gerekli hammadde stoktan düşülecektir.</span></div>
            <div><label className="text-xs font-bold text-neutral-500 block mb-2">ÜRETİLECEK MİKTAR</label><input type="number" min="1" className="w-full p-4 text-2xl border border-neutral-300 outline-none focus:border-neutral-900" value={produceQty} onChange={e => setProduceQty(Number(e.target.value))} /></div>
            <button onClick={handleProduce} className="w-full bg-neutral-900 text-white py-4 font-light tracking-widest hover:bg-neutral-800">ONAYLA VE ÜRET</button>
         </div>
      </Modal>
    </div>
  );
}