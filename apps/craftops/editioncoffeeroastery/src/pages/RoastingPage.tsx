import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Flame, Layers, Factory, X, AlertCircle, Package, Coins } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useStore } from '../context/StoreContext';
import type { RoastStock, BlendRecipe, BlendIngredient } from '../context/StoreContext';


export const RoastingPage = () => {
  const { roastStocks, greenCoffees, recipes, settings, addRoastAndDeductGreen, updateRoastStock, deleteRoastStock, addRecipe, updateRecipe, deleteRecipe } = useStore();
  const { critical, low } = settings.thresholds.roastStock;

  const [activeTab, setActiveTab] = useState<'stock' | 'recipes'>('stock');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // --- STATE YAPISI ---
  const [batchCount, setBatchCount] = useState<number>(1);
  const BATCH_CAPACITY = 60; // 1 Parti = 60kg Yeşil Çekirdek

  const [stockForm, setStockForm] = useState<Omit<RoastStock, 'id'>>({ name: '', roastLevel: 'Medium', stockKg: 0, roastDate: new Date().toISOString().split('T')[0] });
  const [recipeForm, setRecipeForm] = useState<{name: string, description: string, ingredients: BlendIngredient[]}>({ name: '', description: '', ingredients: [{ roastId: '', ratio: 0 }] });
  const [sourceGreenId, setSourceGreenId] = useState<string>('');

  const getNameById = (id: string) => roastStocks.find(s => s.id === id)?.name || 'Bilinmeyen Kahve';

  // --- HESAPLAMALAR ---
  const totalGreenUsed = batchCount * BATCH_CAPACITY;
  const selectedGreenCoffee = greenCoffees.find(g => g.id === sourceGreenId);
  const hasEnoughGreenStock = selectedGreenCoffee ? selectedGreenCoffee.stockKg >= totalGreenUsed : false;

  // TAHMİNİ MALİYET HESABI (MODAL İÇİN)
  // Formül: (Toplam Yeşil Maliyeti) / (Çıkan Net Kavrulmuş Miktar)
  const estimatedRoastCost = useMemo(() => {
    if (!selectedGreenCoffee || stockForm.stockKg <= 0) return 0;
    const totalInputCost = (selectedGreenCoffee.averageCost || 0) * totalGreenUsed;
    return totalInputCost / stockForm.stockKg; // Fire verilmiş haliyle birim maliyet
  }, [selectedGreenCoffee, totalGreenUsed, stockForm.stockKg]);

  // REÇETE MALİYET HESABI
  const calculateRecipeCost = (ingredients: BlendIngredient[]) => {
    return ingredients.reduce((acc, ing) => {
        const roast = roastStocks.find(r => r.id === ing.roastId);
        if (roast && roast.unitCost) {
            return acc + (roast.unitCost * (ing.ratio / 100));
        }
        return acc;
    }, 0);
  };

  // Helper: Para Birimi
  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const openStockModal = (stock?: RoastStock) => {
    if (stock) { 
      setEditingStockId(stock.id); 
      setStockForm({ name: stock.name, roastLevel: stock.roastLevel, stockKg: stock.stockKg, roastDate: stock.roastDate }); 
      setSourceGreenId(stock.sourceGreenId || ''); 
      setBatchCount(0); 
    } else { 
      setEditingStockId(null); 
      setStockForm({ name: '', roastLevel: 'Medium', stockKg: 0, roastDate: new Date().toISOString().split('T')[0] }); 
      setSourceGreenId('');
      setBatchCount(1);
    }
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStockId) { 
      updateRoastStock({ ...stockForm, id: editingStockId, sourceGreenId: sourceGreenId }); 
    } else {
      if (!sourceGreenId) return alert("Yeşil çekirdek seçiniz!");
      if (!hasEnoughGreenStock) return alert("Yetersiz yeşil çekirdek stoğu!");
      
      addRoastAndDeductGreen(
        { ...stockForm, id: `RST-${Math.floor(Math.random()*9000)+1000}` }, 
        sourceGreenId,
        totalGreenUsed
      );
    }
    setIsStockModalOpen(false);
  };

  const openRecipeModal = (recipe?: BlendRecipe) => {
    if (recipe) { setEditingRecipeId(recipe.id); setRecipeForm({ name: recipe.name, description: recipe.description || '', ingredients: [...recipe.ingredients] }); } 
    else { setEditingRecipeId(null); setRecipeForm({ name: '', description: '', ingredients: [{ roastId: '', ratio: 0 }] }); }
    setIsRecipeModalOpen(true);
  };

  const handleRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = recipeForm.ingredients.reduce((acc, curr) => acc + curr.ratio, 0);
    if (total !== 100) return alert(`Toplam %100 olmalı. Şu an: %${total}`);
    if (editingRecipeId) updateRecipe({ ...recipeForm, id: editingRecipeId });
    else addRecipe({ ...recipeForm, id: `BLD-${Math.floor(Math.random()*9000)+1000}` });
    setIsRecipeModalOpen(false);
  };

  const addIngredient = () => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { roastId: '', ratio: 0 }] });
  const removeIngredient = (i: number) => { const newIng = [...recipeForm.ingredients]; newIng.splice(i, 1); setRecipeForm({ ...recipeForm, ingredients: newIng }); };
  const updateIngredient = (i: number, f: keyof BlendIngredient, v: any) => { const newIng = [...recipeForm.ingredients]; newIng[i] = { ...newIng[i], [f]: v }; setRecipeForm({ ...recipeForm, ingredients: newIng }); };
  
  const currentTotalRatio = recipeForm.ingredients.reduce((sum, i) => sum + (i.ratio || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
            <div><h1 className="text-4xl font-light text-neutral-900">KAVURMA</h1><p className="text-neutral-500 mt-1 font-light">Üretim stoğu ve harman formülleri</p></div>
            <button onClick={() => activeTab === 'stock' ? openStockModal() : openRecipeModal()} className="flex gap-3 bg-neutral-900 text-white px-6 py-4 font-light tracking-wide hover:bg-neutral-800"><Plus size={18}/> {activeTab === 'stock' ? 'YENİ KAVURMA' : 'YENİ REÇETE'}</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
         <div className="grid grid-cols-2 gap-4 max-w-lg">
            <button onClick={() => setActiveTab('stock')} className={`py-4 text-sm font-light tracking-wide border ${activeTab === 'stock' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600'}`}>KAVRULMUŞ STOK</button>
            <button onClick={() => setActiveTab('recipes')} className={`py-4 text-sm font-light tracking-wide border ${activeTab === 'recipes' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600'}`}>HARMAN REÇETELERİ</button>
          </div>

        {activeTab === 'stock' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roastStocks.map((stock) => {
                const isCritical = stock.stockKg < critical;
                const isLow = stock.stockKg < low;
                const barColor = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-neutral-900';
                const totalValue = (stock.unitCost || 0) * stock.stockKg;

                return (
                  <div key={stock.id} className="bg-white p-8 border border-neutral-200 flex flex-col justify-between hover:border-neutral-400 transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-block px-3 py-1 text-[10px] font-light uppercase tracking-wider bg-neutral-100 text-neutral-600">{stock.roastLevel}</span>
                        <div className="flex gap-2">
                          <button onClick={() => openStockModal(stock)} className="text-neutral-400 hover:text-neutral-900"><Pencil size={16}/></button>
                          <button onClick={() => deleteRoastStock(stock.id)} className="text-neutral-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                      </div>
                      <h3 className="font-light text-neutral-900 text-2xl leading-tight tracking-wide mb-2">{stock.name}</h3>
                      <div className="text-xs text-neutral-400 font-light mb-8 flex items-center gap-2"><Flame size={14}/> {new Date(stock.roastDate).toLocaleDateString('tr-TR')}</div>
                    </div>
                    
                    {/* STOK VE MALİYET BİLGİSİ */}
                    <div className="space-y-4">
                        {/* Maliyet Satırı */}
                        <div className="flex items-center justify-between py-2 border-t border-b border-neutral-50">
                             <div className="flex flex-col">
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Birim Maliyet</span>
                                <span className="text-sm font-light text-neutral-900 flex items-center gap-1">
                                    <Coins size={12} className="text-neutral-300"/>
                                    {stock.unitCost ? formatCurrency(stock.unitCost) : '-'}
                                </span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Toplam Değer</span>
                                <span className="text-sm font-medium text-neutral-900">
                                    {totalValue > 0 ? formatCurrency(totalValue) : '-'}
                                </span>
                             </div>
                        </div>

                        <div>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Mevcut Stok</span>
                                <span className="text-3xl font-light text-neutral-900">{stock.stockKg.toFixed(1)} <span className="text-sm text-neutral-400">kg</span></span>
                            </div>
                            <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${barColor}`} style={{width: `${Math.min((stock.stockKg/100)*100, 100)}%`}}></div>
                            </div>
                        </div>
                    </div>
                  </div>
                )
            })}
            {roastStocks.length === 0 && <div className="col-span-full border border-dashed border-neutral-300 p-12 text-center text-neutral-400 font-light">Kavrulmuş kahve stoğu yok. <button onClick={() => openStockModal()} className="text-neutral-900 underline ml-2">Yeni Ekle</button></div>}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => {
                const recipeCost = calculateRecipeCost(recipe.ingredients);
                return (
                <div key={recipe.id} className="bg-white p-8 border border-neutral-200 group hover:border-neutral-400 transition-colors flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center"><Layers size={20} strokeWidth={1.5} /></div>
                       <div><h3 className="font-light text-neutral-900 text-xl tracking-wide">{recipe.name}</h3><p className="text-xs text-neutral-500 font-light mt-0.5">{recipe.description || 'Harman Reçetesi'}</p></div>
                    </div>
                    <div className="flex gap-2"><button onClick={() => openRecipeModal(recipe)} className="p-2 text-neutral-400 hover:text-neutral-900"><Pencil size={18}/></button><button onClick={() => {if(window.confirm('Silinsin mi?')) deleteRecipe(recipe.id)}} className="p-2 text-neutral-400 hover:text-red-600"><Trash2 size={18}/></button></div>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm font-light text-neutral-900 w-12 text-right">{ing.ratio}%</span>
                        <div className="flex-1 h-px bg-neutral-200 relative"><div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-neutral-900" style={{width: `${ing.ratio}%`}}/></div>
                        <span className="text-sm font-light text-neutral-600 flex-1 truncate">{getNameById(ing.roastId)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center">
                      <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Maliyet (Teorik)</span>
                      <div className="flex items-center gap-2 text-sm font-light text-neutral-900">
                          <Coins size={14} className="text-neutral-400"/>
                          {recipeCost > 0 ? `${formatCurrency(recipeCost)} / kg` : 'Hesaplanamadı'}
                      </div>
                  </div>
                </div>
              )})}
          </div>
        )}
      </div>

      {/* --- STOCK MODAL --- */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={editingStockId ? "STOĞU DÜZENLE" : "YENİ KAVURMA OPERASYONU"}>
        <form onSubmit={handleStockSubmit} className="space-y-6">
            
            {/* 1. KAYNAK SEÇİMİ */}
            {(!editingStockId || sourceGreenId) && (
            <div className={`space-y-3 ${editingStockId ? 'opacity-70 pointer-events-none' : ''}`}>
              <label className="block text-xs font-medium text-neutral-500 flex items-center gap-2 uppercase tracking-wider"><Factory size={16} strokeWidth={1.5}/> Kaynak Yeşil Çekirdek</label>
              <select required value={sourceGreenId} onChange={e => {setSourceGreenId(e.target.value); const selected = greenCoffees.find(g => g.id === e.target.value); if(selected && !editingStockId) setStockForm(prev => ({...prev, name: selected.name}));}} className="w-full px-4 py-3 border border-neutral-300 bg-white outline-none font-light focus:border-neutral-900 appearance-none">
                <option value="">Yeşil Çekirdek Seçiniz...</option>
                {greenCoffees.map(g => (<option key={g.id} value={g.id}>{g.name} (Stok: {g.stockKg} kg) - Ort. Mal: {g.averageCost?.toFixed(2)} ₺</option>))}
              </select>
            </div>
          )}
          
          {/* 2. PARTİ GİRİŞİ (SADECE YENİ KAYITTA) */}
          {!editingStockId && (
            <div className="bg-neutral-100 p-4 border border-neutral-200 space-y-4">
                <div className="flex items-center gap-2 text-neutral-900 text-sm font-medium uppercase tracking-wide">
                    <Package size={16}/> Girdi Miktarı (Batch Hesabı)
                </div>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Parti Sayısı</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={batchCount} 
                            onChange={e => setBatchCount(Number(e.target.value))} 
                            className="w-full px-3 py-2 border border-neutral-300 outline-none font-light focus:border-neutral-900 text-center"
                        />
                    </div>
                    <div className="pb-2 text-neutral-400 font-light">x</div>
                    <div className="flex-1">
                        <label className="block text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Kapasite</label>
                        <div className="w-full px-3 py-2 bg-neutral-200 text-neutral-500 border border-neutral-200 text-center font-light cursor-not-allowed">
                            {BATCH_CAPACITY} kg
                        </div>
                    </div>
                    <div className="pb-2 text-neutral-400 font-light">=</div>
                    <div className="flex-1">
                        <label className="block text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Düşülecek</label>
                        <div className="w-full px-3 py-2 bg-neutral-900 text-white border border-neutral-900 text-center font-medium">
                            {totalGreenUsed} kg
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* 3. ÇIKTI BİLGİSİ VE MALİYET TAHMİNİ */}
          <div className="space-y-4 pt-2">
            <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Oluşacak Kavrulmuş Ürün Adı</label><input required type="text" value={stockForm.name} onChange={e => setStockForm({...stockForm, name: e.target.value})} className="w-full px-4 py-3 border border-neutral-300 outline-none font-light focus:border-neutral-900" /></div>
            
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Kavurma Profili</label><select value={stockForm.roastLevel} onChange={e => setStockForm({...stockForm, roastLevel: e.target.value as any})} className="w-full px-4 py-3 border border-neutral-300 bg-white outline-none font-light focus:border-neutral-900 appearance-none"><option value="Light">Light</option><option value="Medium">Medium</option><option value="Dark">Dark</option><option value="Omni">Omni</option></select></div>
                
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">NET ÇIKTI (Kavrulmuş)</label>
                  <div className="relative"><input required type="number" step="0.1" value={stockForm.stockKg} onChange={e => setStockForm({...stockForm, stockKg: Number(e.target.value)})} className="w-full px-4 py-3 border border-neutral-300 outline-none font-light focus:border-neutral-900" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-light">KG</span></div>
                </div>
            </div>

            {/* FİRE VE MALİYET TAHMİNİ */}
            {!editingStockId && estimatedRoastCost > 0 && (
                <div className="bg-white border border-neutral-200 p-3 flex justify-between items-center text-sm">
                    <span className="text-neutral-500 font-light">Tahmini Fire Oranı:</span>
                    <div className="flex flex-col items-end">
                        <span className="font-medium text-neutral-900">
                             % {(((totalGreenUsed - stockForm.stockKg) / totalGreenUsed) * 100).toFixed(1)}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                            {formatCurrency(estimatedRoastCost)} / kg
                        </span>
                    </div>
                </div>
            )}
          </div>

          {/* UYARI ALANI */}
          {!editingStockId && sourceGreenId && (
            <div className={`p-4 text-xs border flex items-start gap-3 ${hasEnoughGreenStock ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
               <AlertCircle size={16} className="shrink-0 mt-0.5" />
               <div>
                  <div className="font-bold mb-1 uppercase tracking-wide">{hasEnoughGreenStock ? 'STOK YETERLİ' : 'YETERSİZ YEŞİL STOK!'}</div>
                  <div>
                    {totalGreenUsed} kg yeşil çekirdek düşülecek. {hasEnoughGreenStock && selectedGreenCoffee && `(Mevcut: ${selectedGreenCoffee.stockKg} kg)`}
                  </div>
               </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!editingStockId && (!hasEnoughGreenStock || !sourceGreenId)}
            className="w-full bg-neutral-900 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-4 font-light tracking-wide hover:bg-neutral-800 transition-all active:scale-[0.99]"
          >
            {editingStockId ? 'KAYDI GÜNCELLE' : 'KAVURMAYI TAMAMLA'}
          </button>
        </form>
      </Modal>

      {/* --- RECIPE MODAL --- */}
      <Modal isOpen={isRecipeModalOpen} onClose={() => setIsRecipeModalOpen(false)} title={editingRecipeId ? "REÇETEYİ DÜZENLE" : "YENİ REÇETE"}>
        <form onSubmit={handleRecipeSubmit} className="space-y-6">
          <div><label className="block text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wider">Reçete Adı</label><input required type="text" value={recipeForm.name} onChange={e => setRecipeForm({...recipeForm, name: e.target.value})} className="w-full px-4 py-3 border border-neutral-300 outline-none font-light focus:border-neutral-900" /></div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">Bileşenler</label>
                <span className={`text-xs font-medium ${currentTotalRatio === 100 ? 'text-green-600' : 'text-amber-500'}`}>Toplam: %{currentTotalRatio}</span>
            </div>
            
            <div className="w-full h-2 bg-neutral-100 rounded flex overflow-hidden">
                <div className={`h-full transition-all duration-300 ${currentTotalRatio > 100 ? 'bg-red-500' : currentTotalRatio === 100 ? 'bg-green-500' : 'bg-amber-400'}`} style={{width: `${Math.min(currentTotalRatio, 100)}%`}}></div>
            </div>

            {recipeForm.ingredients.map((ing, index) => (
              <div key={index} className="flex gap-3 items-start">
                <select required value={ing.roastId} onChange={e => updateIngredient(index, 'roastId', e.target.value)} className="flex-1 px-4 py-3 border border-neutral-300 bg-white text-sm outline-none font-light focus:border-neutral-900 appearance-none">
                  <option value="">Kahve Seçiniz...</option>
                  {roastStocks.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roastLevel})</option>)}
                </select>
                <div className="relative w-24">
                  <input required type="number" min="1" max="100" value={ing.ratio} onChange={e => updateIngredient(index, 'ratio', Number(e.target.value))} className="w-full px-3 py-3 border border-neutral-300 text-sm outline-none font-light focus:border-neutral-900" />
                  <span className="absolute right-3 top-3 text-neutral-400 text-xs font-light">%</span>
                </div>
                <button type="button" onClick={() => removeIngredient(index)} className="p-3 text-neutral-400 hover:text-red-600"><X size={18}/></button>
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="w-full py-3 border border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-900">+ BİLEŞEN EKLE</button>
          </div>
          <button type="submit" disabled={currentTotalRatio !== 100} className="w-full bg-neutral-900 disabled:bg-neutral-300 text-white py-4 font-light tracking-wide hover:bg-neutral-800">REÇETEYİ KAYDET</button>
        </form>
      </Modal>
    </div>
  );
};