import { useState, useMemo } from 'react';
import { Package, Plus, Factory, CheckCircle2, Box, Search, Layers, AlertTriangle } from 'lucide-react';
import { useInventory, Product, RecipeItem } from '../context/InventoryContext';
import { Modal } from '../components/Modal';

export default function FinishedGoodsPage() {
  // Veri Bağlantısı
  const { products, addProduct, produceItem, getAllIngredients } = useInventory();
  
  // Sadece Son Ürünleri ve Tüm Bileşenleri Çek
  const finishedProducts = products.filter(p => p.type === 'finished');
  const allIngredients = getAllIngredients(); 

  // UI States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProduceModalOpen, setIsProduceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [query, setQuery] = useState('');
  
  // Form State (Yeni Ürün)
  const [name, setName] = useState('');
  const [recipeBuilder, setRecipeBuilder] = useState<{itemId: string, qty: number}[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQty, setIngredientQty] = useState(1);

  // Form State (Üretim)
  const [produceQty, setProduceQty] = useState(1);

  // --- FİLTRELEME ---
  const filteredProducts = useMemo(() => {
    return finishedProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [finishedProducts, query]);

  // --- REÇETE İŞLEMLERİ ---
  const addToRecipe = () => {
    if (!selectedIngredientId) return;
    setRecipeBuilder([...recipeBuilder, { itemId: selectedIngredientId, qty: ingredientQty }]);
    setSelectedIngredientId('');
    setIngredientQty(1);
  };

  const removeIngredientFromBuilder = (index: number) => {
    const newRecipe = [...recipeBuilder];
    newRecipe.splice(index, 1);
    setRecipeBuilder(newRecipe);
  };

  const saveNewProduct = () => {
    if (!name || recipeBuilder.length === 0) return alert("Ürün adı ve en az bir bileşen giriniz.");
    
    const finalRecipe: RecipeItem[] = recipeBuilder.map(item => {
      const ref = allIngredients.find(i => i.id === item.itemId);
      return { itemId: item.itemId, type: ref?.type || 'raw', quantity: item.qty };
    });

    addProduct({ 
      id: crypto.randomUUID(), 
      name, 
      type: 'finished', 
      unit: 'Adet', 
      stock: 0, 
      recipe: finalRecipe 
    });

    setIsCreateModalOpen(false); 
    setName(''); 
    setRecipeBuilder([]);
  };

  // --- ÜRETİM İŞLEMİ ---
  const handleProduce = () => {
    if (!selectedProduct) return;
    const result = produceItem(selectedProduct.id, produceQty);
    
    if (result.success) {
      alert(result.message);
      setIsProduceModalOpen(false); 
      setProduceQty(1);
    } else {
      alert("HATA: " + result.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">HAZIR ÜRÜNLER</h1>
            <p className="text-neutral-500 mt-1 font-light">Son ürün envanteri ve montaj hattı</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="bg-neutral-900 text-white px-6 py-4 hover:bg-neutral-800 flex items-center gap-2 font-light tracking-wide transition-all active:scale-[0.99]"
          >
            <Plus size={18} /> YENİ ÜRÜN TANIMLA
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ARAMA BARI */}
        <div className="mb-8 relative max-w-md">
           <input 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Ürün adı ara..."
             className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 outline-none font-light focus:border-neutral-900 transition-colors shadow-sm"
           />
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
        </div>

        {/* KART GRİDİ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white border border-neutral-200 p-6 hover:shadow-xl transition-all border-t-4 border-t-neutral-900 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-neutral-100 text-neutral-600 rounded-sm">
                    <Package size={24} strokeWidth={1.5} />
                  </div>
                  <div className="text-right">
                     <span className="block text-4xl font-light text-neutral-900 tracking-tighter">{p.stock}</span>
                     <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">{p.unit}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-light text-neutral-900 mb-2 leading-tight">{p.name}</h3>
                
                {/* Reçete Özeti */}
                <div className="bg-neutral-50 p-4 mb-6 border border-neutral-100">
                  <span className="text-[10px] font-bold block mb-2 uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Layers size={12}/> Montaj Reçetesi
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                    {p.recipe.map((r, i) => {
                      const ingName = allIngredients.find(x => x.id === r.itemId)?.name || "Bilinmeyen";
                      return (
                        <div key={i} className="flex justify-between text-xs border-b border-neutral-200 pb-1 last:border-0">
                          <span className="text-neutral-600 truncate pr-2">{ingName}</span>
                          <span className="font-medium text-neutral-900 whitespace-nowrap">x {r.quantity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedProduct(p); setIsProduceModalOpen(true); }} 
                className="w-full py-4 bg-white border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center gap-2 font-light tracking-widest text-sm group-hover:shadow-md"
              >
                <Factory size={16} /> ÜRETİMİ BAŞLAT
              </button>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400 font-light">
                {query ? "Aradığınız ürün bulunamadı." : "Henüz bir son ürün tanımlanmamış."}
            </div>
        )}
      </div>

      {/* --- MODAL: YENİ ÜRÜN EKLEME --- */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="YENİ NİHAİ ÜRÜN TANIMLA">
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-neutral-500 mb-2 block tracking-wider">ÜRÜN ADI</label>
            <input 
              className="w-full p-4 border border-neutral-300 outline-none font-light focus:border-neutral-900 transition-colors" 
              placeholder="Örn: Yemek Masası Takımı"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          
          <div className="bg-neutral-50 p-5 border border-neutral-200">
             <h4 className="text-xs font-bold text-neutral-500 mb-3 flex items-center gap-2">
                <Box size={14}/> BİLEŞENLER (Yarı Mamül / Hammadde)
             </h4>
             
             <div className="flex gap-2 mb-4">
               <div className="flex-1">
                 <select 
                    className="w-full p-3 border border-neutral-300 outline-none bg-white font-light text-sm h-12" 
                    value={selectedIngredientId} 
                    onChange={e => setSelectedIngredientId(e.target.value)}
                 >
                    <option value="">Bileşen Seçiniz...</option>
                    {allIngredients.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.type === 'semi' ? '[YARI MAMÜL]' : '[HAMMADDE]'} {i.name} (Stok: {i.stock})
                      </option>
                    ))}
                 </select>
               </div>
               <input 
                 type="number" 
                 className="w-20 p-3 border border-neutral-300 outline-none text-center font-light h-12" 
                 value={ingredientQty} 
                 onChange={e => setIngredientQty(Number(e.target.value))} 
                 min="0.1"
               />
               <button 
                 onClick={addToRecipe} 
                 className="bg-neutral-900 text-white w-12 h-12 flex items-center justify-center hover:bg-neutral-800 transition-colors"
               >
                 <Plus size={20}/>
               </button>
             </div>

             {/* Eklenenler Listesi */}
             <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {recipeBuilder.map((item, idx) => { 
                    const data = allIngredients.find(i => i.id === item.itemId);
                    return (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 border border-neutral-200 text-sm">
                            <span className="truncate flex-1 text-neutral-700">{data?.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-neutral-900">x {item.qty} {data?.unit}</span>
                                <button onClick={() => removeIngredientFromBuilder(idx)} className="text-red-400 hover:text-red-600"><Plus size={16} className="rotate-45"/></button>
                            </div>
                        </div>
                    )
                })}
                {recipeBuilder.length === 0 && <p className="text-xs text-neutral-400 italic text-center py-2">Henüz bileşen eklenmedi.</p>}
             </div>
          </div>

          <button 
            onClick={saveNewProduct} 
            className="w-full bg-neutral-900 text-white py-4 font-light tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99]"
          >
            KAYDET
          </button>
        </div>
      </Modal>

      {/* --- MODAL: ÜRETİM ONAYI --- */}
      <Modal isOpen={isProduceModalOpen} onClose={() => setIsProduceModalOpen(false)} title={`MONTAJ: ${selectedProduct?.name}`}>
         <div className="space-y-6">
            <div className="bg-neutral-100 p-4 text-sm text-neutral-600 flex items-start gap-3 border border-neutral-200">
               <CheckCircle2 size={18} className="text-neutral-900 shrink-0 mt-0.5"/> 
               <span className="font-light">Bu işlem, reçetedeki gerekli <strong>Yarı Mamülleri</strong> ve <strong>Hammaddeleri</strong> stoktan otomatik olarak düşecektir.</span>
            </div>
            
            {/* Stok Uyarısı (Opsiyonel Geliştirme: Yetersiz stok varsa gösterilebilir) */}
            
            <div>
               <label className="text-xs font-bold text-neutral-500 block mb-2 tracking-wider">ÜRETİLECEK MİKTAR</label>
               <div className="relative">
                   <input 
                     type="number" 
                     min="1" 
                     className="w-full p-4 text-3xl font-light border border-neutral-300 outline-none focus:border-neutral-900 text-neutral-900" 
                     value={produceQty} 
                     onChange={e => setProduceQty(Number(e.target.value))} 
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium uppercase">{selectedProduct?.unit}</span>
               </div>
            </div>

            <button 
                onClick={handleProduce} 
                className="w-full bg-neutral-900 text-white py-4 text-lg font-light tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99]"
            >
                ONAYLA VE ÜRET
            </button>
         </div>
      </Modal>

    </div>
  );
}