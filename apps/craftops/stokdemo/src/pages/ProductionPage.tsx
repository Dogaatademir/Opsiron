import { useState } from 'react';
import { Package, Plus, Factory, CheckCircle2 } from 'lucide-react';
import { useInventory, Product, RecipeItem } from '../context/InventoryContext';
import { Modal } from '../components/Modal';

export default function ProductionPage() {
  const { products, addProduct, produceItem, getAllIngredients } = useInventory();
  const finishedProducts = products.filter(p => p.type === 'finished');
  const allIngredients = getAllIngredients(); 

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProduceOpen, setIsProduceOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState<{itemId: string, qty: number}[]>([]);
  const [ingId, setIngId] = useState('');
  const [ingQty, setIngQty] = useState(1);
  const [produceQty, setProduceQty] = useState(1);

  const addIng = () => { if(!ingId) return; setRecipe([...recipe, { itemId: ingId, qty: ingQty }]); setIngId(''); setIngQty(1); };
  
  const handleSave = () => {
    if(!name || recipe.length === 0) return alert("Eksik bilgi.");
    const finalRecipe: RecipeItem[] = recipe.map(r => {
      const ref = allIngredients.find(i => i.id === r.itemId);
      return { itemId: r.itemId, type: ref?.type || 'raw', quantity: r.qty };
    });
    addProduct({ id: crypto.randomUUID(), name, type: 'finished', unit: 'Adet', stock: 0, recipe: finalRecipe });
    setIsCreateOpen(false); setName(''); setRecipe([]);
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
          <div><h1 className="text-4xl font-light tracking-tight text-neutral-900">SON ÜRÜN ÜRETİMİ</h1><p className="text-neutral-500 mt-1 font-light">Montaj Hattı ve Nihai Ürün Stoklama</p></div>
          <button onClick={() => setIsCreateOpen(true)} className="bg-neutral-900 text-white px-6 py-4 hover:bg-neutral-800 flex items-center gap-2 font-light tracking-wide"><Plus size={18} /> YENİ ÜRÜN TANIMLA</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* LİSTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finishedProducts.map(p => (
            <div key={p.id} className="bg-white border border-neutral-200 p-6 hover:shadow-xl transition-all border-t-4 border-t-neutral-900 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-neutral-100 text-neutral-600 rounded"><Package size={20}/></div>
                  <span className="text-3xl font-light text-neutral-900">{p.stock}</span>
                </div>
                <h3 className="text-xl font-light text-neutral-900 mb-4">{p.name}</h3>
                <div className="bg-neutral-50 p-3 mb-6 rounded h-24 overflow-y-auto text-xs text-neutral-500 border border-neutral-100 space-y-1">
                  <span className="font-bold block mb-1 uppercase tracking-wider text-neutral-400">MONTAJ REÇETESİ:</span>
                  {p.recipe.map((r, i) => {
                    const ingName = allIngredients.find(x => x.id === r.itemId)?.name;
                    return <div key={i} className="flex justify-between border-b border-neutral-200 pb-1"><span>{ingName}</span><span>x {r.quantity}</span></div>
                  })}
                </div>
              </div>
              <button onClick={() => { setSelectedProduct(p); setIsProduceOpen(true); }} className="w-full py-4 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 font-light tracking-widest"><Factory size={16} /> ÜRETİMİ BAŞLAT</button>
            </div>
          ))}
        </div>

        {/* BOŞ STATE */}
        {finishedProducts.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-lg">
                <p className="text-neutral-400 font-light">Henüz son ürün tanımlanmadı.</p>
            </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="YENİ NİHAİ ÜRÜN TANIMLA">
        <div className="space-y-6">
          <div><label className="text-xs font-bold text-neutral-500 mb-2 block">ÜRÜN ADI</label><input className="w-full p-4 border border-neutral-300 outline-none font-light" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="bg-neutral-50 p-4 border border-neutral-200">
             <div className="flex gap-2 mb-2">
               <select className="flex-1 p-3 border border-neutral-300 outline-none bg-white" value={ingId} onChange={e => setIngId(e.target.value)}>
                  <option value="">Bileşen Seçiniz...</option>
                  {allIngredients.map(i => <option key={i.id} value={i.id}>{i.type==='semi'?'[YARI MAMÜL]':'[HAMMADDE]'} {i.name} (Stok: {i.stock})</option>)}
               </select>
               <input type="number" className="w-20 p-3 border border-neutral-300 outline-none text-center" value={ingQty} onChange={e => setIngQty(Number(e.target.value))} />
               <button onClick={addIng} className="bg-neutral-900 text-white px-4">+</button>
             </div>
             <ul className="text-sm space-y-1">{recipe.map((r, i) => <li key={i} className="flex justify-between border-b border-neutral-200 py-1"><span>{allIngredients.find(x=>x.id===r.itemId)?.name}</span><span>x{r.qty}</span></li>)}</ul>
          </div>
          <button onClick={handleSave} className="w-full bg-neutral-900 text-white py-4 mt-4 font-light tracking-widest hover:bg-neutral-800">KAYDET</button>
        </div>
      </Modal>

      <Modal isOpen={isProduceOpen} onClose={() => setIsProduceOpen(false)} title={`MONTAJ: ${selectedProduct?.name}`}>
         <div className="space-y-6">
            <div className="bg-neutral-100 p-4 text-sm text-neutral-600 flex items-center gap-2"><CheckCircle2 size={16}/> <span>Gerekli Yarı Mamüller ve Hammaddeler stoktan düşülecektir.</span></div>
            <div><label className="text-xs font-bold text-neutral-500 block mb-2">ÜRETİLECEK ADET</label><input type="number" min="1" className="w-full p-4 text-2xl border border-neutral-300 outline-none focus:border-neutral-900" value={produceQty} onChange={e => setProduceQty(Number(e.target.value))} /></div>
            <button onClick={handleProduce} className="w-full bg-neutral-900 text-white py-4 text-lg tracking-widest hover:bg-neutral-800">ONAYLA VE ÜRET</button>
         </div>
      </Modal>
    </div>
  );
}