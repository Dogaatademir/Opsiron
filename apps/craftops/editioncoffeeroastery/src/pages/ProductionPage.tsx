import { useState, useMemo } from 'react';
import { ClipboardList, Check, AlertTriangle, Package, Sticker, Coffee, Box, ArrowRight, Coins } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';
import { useStore } from '../context/StoreContext';

export const ProductionPage = () => {
  const { recipes, roastStocks, packagingItems, recordProduction, productionLogs } = useStore();

  // --- FORM STATE ---
  const [brand, setBrand] = useState<'Edition' | 'Hisaraltı'>('Edition');
  const [productType, setProductType] = useState<'Espresso' | 'Filter' | 'Turkish' | 'Dibek'>('Espresso');
  const [sourceType, setSourceType] = useState<'Blend' | 'Single'>('Blend');
  
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [selectedStockId, setSelectedStockId] = useState('');
  
  const [packSize, setPackSize] = useState<250 | 1000>(250);
  const [packCount, setPackCount] = useState<number>(0);

  // Packaging Selections
  const [selectedBagId, setSelectedBagId] = useState('');
  const [selectedFrontLabelId, setSelectedFrontLabelId] = useState('');
  const [selectedBackLabelId, setSelectedBackLabelId] = useState('');
  
  const [selectedBoxId, setSelectedBoxId] = useState('');
  const [packsPerBox, setPacksPerBox] = useState<number>(12);

  // UI STATE
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- FILTERS ---
  const availableBags = useMemo(() => {
    return packagingItems.filter(p => 
      p.category === 'Bag' && 
      (p.brand === brand || p.brand === 'Genel') && 
      p.variant?.includes(packSize.toString())
    );
  }, [packagingItems, brand, packSize]);

  const availableFrontLabels = useMemo(() => {
    return packagingItems.filter(p => 
      p.category === 'Label' && 
      p.labelType === 'Front' &&
      (p.brand === brand || p.brand === 'Genel') &&
      p.variant?.includes(packSize.toString())
    );
  }, [packagingItems, brand, packSize]);

  const availableBackLabels = useMemo(() => {
    return packagingItems.filter(p => 
      p.category === 'Label' && 
      p.labelType === 'Back' &&
      (p.brand === brand || p.brand === 'Genel') &&
      (p.variant === 'Genel' || p.variant?.includes(packSize.toString()))
    );
  }, [packagingItems, brand, packSize]);

  const availableBoxes = useMemo(() => {
    return packagingItems.filter(p => p.category === 'Box');
  }, [packagingItems]);

  // --- HESAPLAMALAR ---
  const totalCoffeeNeeded = (packCount * packSize) / 1000;
  const boxesNeeded = selectedBoxId && packsPerBox > 0 ? Math.ceil(packCount / packsPerBox) : 0;
  
  // İsim Bulucular
  const getRecipeName = () => recipes.find(r => r.id === selectedRecipeId)?.name;
  const getStockName = () => roastStocks.find(s => s.id === selectedStockId)?.name;
  const getItemName = (id: string) => packagingItems.find(p => p.id === id)?.name || '-';
  const selectedBagItem = packagingItems.find(p => p.id === selectedBagId);

  // --- ANLIK MALİYET HESABI (PREVIEW) ---
  const calculateEstimatedCost = () => {
    let coffeeCost = 0;
    
    // 1. Kahve Maliyeti (Birim KG)
    if (sourceType === 'Blend' && selectedRecipeId) {
        const recipe = recipes.find(r => r.id === selectedRecipeId);
        if (recipe) {
            recipe.ingredients.forEach(ing => {
                const roast = roastStocks.find(r => r.id === ing.roastId);
                if (roast && roast.unitCost) {
                    coffeeCost += (roast.unitCost * (ing.ratio / 100));
                }
            });
        }
    } else if (sourceType === 'Single' && selectedStockId) {
        const roast = roastStocks.find(r => r.id === selectedStockId);
        if (roast && roast.unitCost) {
            coffeeCost = roast.unitCost;
        }
    }

    // Paket içi kahve maliyeti
    const coffeePerPack = coffeeCost * (packSize / 1000);

    // 2. Ambalaj Maliyeti
    let packCost = 0;
    const findCost = (id: string) => packagingItems.find(p => p.id === id)?.averageCost || 0;

    packCost += findCost(selectedBagId);
    if (selectedFrontLabelId && selectedFrontLabelId !== 'no_label') packCost += findCost(selectedFrontLabelId);
    if (selectedBackLabelId && selectedBackLabelId !== 'no_label') packCost += findCost(selectedBackLabelId);
    
    if (selectedBoxId && boxesNeeded > 0 && packCount > 0) {
        const totalBoxCost = findCost(selectedBoxId) * boxesNeeded;
        packCost += (totalBoxCost / packCount);
    }

    return coffeePerPack + packCost;
  };

  const estimatedUnitCost = calculateEstimatedCost();

  // Stok Kontrolü
  const checkStock = () => {
    let coffeeStatus = { enough: true, message: '' };
    
    if (sourceType === 'Blend') {
      const recipe = recipes.find(r => r.id === selectedRecipeId);
      if (recipe) {
        for (const ing of recipe.ingredients) {
          const stock = roastStocks.find(s => s.id === ing.roastId);
          const needed = totalCoffeeNeeded * (ing.ratio / 100);
          if (!stock || stock.stockKg < needed) {
            coffeeStatus = { enough: false, message: `Yetersiz Stok: ${stock?.name || 'Bilinmeyen Kahve'}` };
            break;
          }
        }
      } else if (selectedRecipeId) {
         coffeeStatus = { enough: false, message: 'Reçete Bulunamadı' };
      }
    } else {
      const stock = roastStocks.find(s => s.id === selectedStockId);
      if (selectedStockId && (!stock || stock.stockKg < totalCoffeeNeeded)) {
        coffeeStatus = { enough: false, message: `Yetersiz Stok: ${stock?.name}` };
      }
    }

    const bag = packagingItems.find(p => p.id === selectedBagId);
    const front = selectedFrontLabelId !== 'no_label' ? packagingItems.find(p => p.id === selectedFrontLabelId) : null;
    const back = selectedBackLabelId !== 'no_label' ? packagingItems.find(p => p.id === selectedBackLabelId) : null;
    const box = packagingItems.find(p => p.id === selectedBoxId);

    if (selectedBagId && bag && bag.stockQuantity < packCount) return { valid: false, msg: `Yetersiz Torba: ${bag.name}` };
    if (selectedFrontLabelId !== 'no_label' && front && front.stockQuantity < packCount) return { valid: false, msg: `Yetersiz Ön Etiket: ${front.name}` };
    if (selectedBackLabelId !== 'no_label' && back && back.stockQuantity < packCount) return { valid: false, msg: `Yetersiz Arka Etiket: ${back.name}` };
    if (selectedBoxId && box && box.stockQuantity < boxesNeeded) return { valid: false, msg: `Yetersiz Koli: ${box.name}` };

    if (!coffeeStatus.enough) return { valid: false, msg: coffeeStatus.message };

    if (!selectedRecipeId && !selectedStockId) return { valid: false, msg: 'Lütfen Kahve Kaynağı Seçiniz' };
    if (!selectedBagId) return { valid: false, msg: 'Lütfen Torba Seçiniz' };
    if (!selectedFrontLabelId) return { valid: false, msg: 'Lütfen Ön Etiket Durumunu Seçiniz' };

    return { valid: true, msg: 'Üretim İçin Uygun' };
  };

  const status = checkStock();

  const initiateProduction = () => {
    if (!status.valid) return alert(status.msg);
    setIsConfirmModalOpen(true);
  };

  const finalizeProduction = () => {
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    const productName = sourceType === 'Blend' ? recipe?.name || 'Blend' : roastStocks.find(s => s.id === selectedStockId)?.name || 'Single';

    recordProduction(
      {
        date: new Date().toISOString(),
        productName: productName,
        brand,
        packSize,
        packCount,
        totalCoffeeKg: totalCoffeeNeeded
      },
      {
        bagId: selectedBagId,
        frontLabelId: selectedFrontLabelId === 'no_label' ? undefined : selectedFrontLabelId,
        backLabelId: selectedBackLabelId === 'no_label' ? undefined : (selectedBackLabelId || undefined),
        boxId: selectedBoxId || undefined,
        boxCount: boxesNeeded
      },
      sourceType === 'Blend' ? recipe : undefined,
      sourceType === 'Single' ? selectedStockId : undefined
    );

    setIsConfirmModalOpen(false);
    alert(`Üretim Başarıyla Tamamlandı!\nToplam ${packCount} paket stoktan düşüldü.`);
    setPackCount(0); 
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-neutral-900">
                ÜRETİM
              </h1>
              <p className="text-neutral-500 mt-1 font-light">Üretim & Stok Yönetimi</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <ClipboardList className="text-white" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 md:pb-0">
      
      {/* SOL KOLON: ÜRETİM FORMU */}
      <div className="lg:col-span-2 space-y-6">

        {/* 1. ÜRÜN SEÇİMİ */}
        <div className="bg-white p-8 border border-neutral-200">
            {/* ... (Bu kısımlar değişmedi, önceki kod ile aynı) ... */}
            <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-sm font-light">1</span>
            </div>
            <h2 className="text-xl font-light tracking-tight text-neutral-900">ÜRÜN TÜRÜ</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">MARKA</label>
              <div className="grid grid-cols-2 gap-3">
                {['Edition', 'Hisaraltı'].map((b) => (
                  <button 
                    key={b} 
                    onClick={() => { setBrand(b as any); setSelectedFrontLabelId(''); setSelectedBackLabelId(''); }}
                    className={`py-4 text-sm font-light tracking-wide border transition-all ${
                      brand === b 
                        ? 'bg-neutral-900 text-white border-neutral-900' 
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {b.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">KAHVE TÜRÜ</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'Espresso', label: 'Espresso' },
                  { id: 'Filter', label: 'Filtre' },
                  { id: 'Turkish', label: 'Türk Kahvesi' },
                  { id: 'Dibek', label: 'Dibek' }
                ].map((t) => (
                  <button 
                    key={t.id} 
                    onClick={() => setProductType(t.id as any)}
                    className={`py-4 text-sm font-light tracking-wide border transition-all ${
                      productType === t.id 
                        ? 'bg-neutral-900 text-white border-neutral-900' 
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {t.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">KAHVE KAYNAĞI</label>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    sourceType === 'Blend' ? 'border-neutral-900' : 'border-neutral-300'
                  }`}>
                    {sourceType === 'Blend' && <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />}
                  </div>
                  <input 
                    type="radio" 
                    checked={sourceType === 'Blend'} 
                    onChange={() => setSourceType('Blend')} 
                    className="sr-only"
                  />
                  <span className="text-sm font-light text-neutral-700">Harman (Reçete)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    sourceType === 'Single' ? 'border-neutral-900' : 'border-neutral-300'
                  }`}>
                    {sourceType === 'Single' && <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />}
                  </div>
                  <input 
                    type="radio" 
                    checked={sourceType === 'Single'} 
                    onChange={() => setSourceType('Single')} 
                    className="sr-only"
                  />
                  <span className="text-sm font-light text-neutral-700">Single Origin</span>
                </label>
              </div>
             
             {sourceType === 'Blend' ? (
               <CustomSelect
                 label="Harman Seçimi"
                 value={selectedRecipeId}
                 onChange={setSelectedRecipeId}
                 options={recipes.map(r => ({ value: r.id, label: r.name, subLabel: 'Reçete' }))}
                 placeholder="Harman Seçiniz..."
                 icon={Coffee}
               />
             ) : (
               <CustomSelect
                 label="Stok Kahve Seçimi"
                 value={selectedStockId}
                 onChange={setSelectedStockId}
                 options={roastStocks.map(s => ({ value: s.id, label: s.name, subLabel: `Profil: ${s.roastLevel} | Stok: ${s.stockKg}kg` }))}
                 placeholder="Stoktan Kahve Seçiniz..."
                 icon={Coffee}
               />
             )}
            </div>
          </div>
        </div>

        {/* 2. PAKETLEME DETAYLARI */}
        <div className="bg-white p-8 border border-neutral-200">
           {/* ... (Değişmedi, önceki kod ile aynı) ... */}
           <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-sm font-light">2</span>
            </div>
            <h2 className="text-xl font-light tracking-tight text-neutral-900">PAKETLEME</h2>
          </div>
          
          <div className="space-y-6">
            
            {/* Paket Boyutu Butonları */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">PAKET BOYUTU</label>
              <div className="grid grid-cols-2 gap-3">
                {[250, 1000].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => { setPackSize(s as any); setSelectedBagId(''); setSelectedFrontLabelId(''); setSelectedBackLabelId(''); }}
                    className={`py-4 text-sm font-light tracking-wide border transition-all ${
                      packSize === s 
                        ? 'bg-neutral-900 text-white border-neutral-900' 
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {s}G
                  </button>
                ))}
              </div>
            </div>
          
            {/* 1. Satır: Torba (Tam Genişlik) */}
            <div>
              <CustomSelect
                label="TORBA SEÇİMİ"
                value={selectedBagId}
                onChange={setSelectedBagId}
                options={availableBags.map(b => ({ value: b.id, label: `${b.name} (${b.color})`, subLabel: `Stok: ${b.stockQuantity} adet` }))}
                placeholder="Torba Seçiniz..."
                icon={Package}
              />
            </div>

            {/* 2. Satır: Etiketler (Yan Yana) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <CustomSelect
                label="ÖN ETİKET"
                value={selectedFrontLabelId}
                onChange={setSelectedFrontLabelId}
                options={[
                  { value: 'no_label', label: '✕ Etiket Kullanılmıyor', subLabel: 'Stok düşümü yapılmaz' },
                  ...availableFrontLabels.map(l => ({ value: l.id, label: l.name, subLabel: `Stok: ${l.stockQuantity} adet` }))
                ]}
                placeholder="Ön Etiket Seçiniz..."
                icon={Sticker}
              />
               
              <CustomSelect
                label="ARKA ETİKET"
                value={selectedBackLabelId}
                onChange={setSelectedBackLabelId}
                options={[
                  { value: 'no_label', label: '✕ Etiket Kullanılmıyor', subLabel: 'Stok düşümü yapılmaz' },
                  ...availableBackLabels.map(l => ({ value: l.id, label: l.name, subLabel: `Stok: ${l.stockQuantity} adet` }))
                ]}
                placeholder="Arka Etiket Seçiniz (Opsiyonel)..."
                icon={Sticker}
              />
            </div>

            {/* Koli Bölümü (Alt Çizgi ile Ayrılmış) */}
            <div className="pt-6 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomSelect
                label="KOLİ SEÇİMİ (OPSİYONEL)"
                value={selectedBoxId}
                onChange={setSelectedBoxId}
                options={[
                  { value: '', label: 'Koli Kullanılmıyor' },
                  ...availableBoxes.map(b => ({ value: b.id, label: b.name, subLabel: `Stok: ${b.stockQuantity} adet` }))
                ]}
                placeholder="Koli Seçiniz..."
                icon={Box}
              />
              
              {selectedBoxId && (
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">KOLİ İÇİ ADET</label>
                  <input 
                    type="number" 
                    min="1"
                    value={packsPerBox} 
                    onChange={e => setPacksPerBox(Number(e.target.value))}
                    className="w-full px-4 py-4 bg-white border border-neutral-300 outline-none text-sm font-light focus:border-neutral-900 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. MİKTAR VE ONAY */}
        <div className="bg-white p-8 border border-neutral-200">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-sm font-light">3</span>
            </div>
            <h2 className="text-xl font-light tracking-tight text-neutral-900">ÜRETİM MİKTARI</h2>
          </div>
          
          <div className="flex items-center gap-6 mb-6">
            <input 
              type="number" 
              min="1" 
              value={packCount} 
              onChange={e => setPackCount(Number(e.target.value))} 
              className="w-32 p-4 text-3xl font-light border border-neutral-300 outline-none focus:border-neutral-900 transition-colors text-center"
            />
            <span className="text-neutral-500 font-light tracking-wide">PAKET</span>
          </div>

          {!status.valid && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-600" strokeWidth={1.5} />
              <span className="text-sm font-light text-red-800">{status.msg}</span>
            </div>
          )}

          {status.valid && packCount > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 flex items-center gap-3">
              <Check size={18} className="text-green-600" strokeWidth={1.5} />
              <span className="text-sm font-light text-green-800">Üretim İçin Hazır</span>
            </div>
          )}

          <button 
            disabled={!status.valid || packCount <= 0}
            onClick={initiateProduction}
            className="w-full bg-neutral-900 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-5 font-light text-base tracking-widest hover:bg-neutral-800 transition-all active:scale-[0.99]"
          >
            ÜRETİMİ TAMAMLA
          </button>
        </div>
      </div>

      {/* SAĞ KOLON: GEÇMİŞ */}
      <div className="space-y-6">
        <h2 className="text-xl font-light tracking-tight text-neutral-900">SON ÜRETİMLER</h2>
        <div className="space-y-3">
          {productionLogs.slice(0, 8).map(log => (
            <div key={log.id} className="bg-white p-6 border border-neutral-200 hover:border-neutral-400 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="font-light text-neutral-900 tracking-wide">{log.productName}</span>
                <span className="text-xs text-neutral-400 font-light">{new Date(log.date).toLocaleDateString('tr-TR', {day: '2-digit', month: 'short'})}</span>
              </div>
              <div className="text-xs text-neutral-500 mb-3 font-light tracking-wide">{log.brand} · {log.packSize}g</div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                <span className="text-neutral-400 text-xs font-light tracking-wider">MİKTAR</span>
                <div className="text-right">
                  <span className="font-light text-neutral-900 text-lg">{log.packCount}</span>
                  {/* Log'da maliyet varsa göster */}
                  {log.unitCost && (
                     <div className="text-[10px] text-neutral-400 font-light">
                        Maliyet: {log.unitCost.toFixed(2)}₺
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="ÜRETİM ÖZETİ">
        <div className="space-y-8">
          
          {/* Ürün Özeti */}
          <div className="bg-neutral-50 p-8 border border-neutral-200 text-center relative overflow-hidden">
            <div className="text-xs font-light text-neutral-400 uppercase tracking-[0.2em] mb-4">
              ÜRÜN
            </div>
            
            <div className="text-sm font-light text-neutral-500 uppercase tracking-widest leading-none mb-2">
              {brand}
            </div>
            
            <div className="text-2xl font-light text-neutral-900 leading-tight mb-4">
              {sourceType === 'Blend' ? getRecipeName() : getStockName()}
            </div>

            <div className="inline-block px-4 py-2 bg-white border border-neutral-200 text-xs font-light text-neutral-600 tracking-wider">
              {productType} · {packSize}g
            </div>
            
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <span className="text-5xl font-light text-neutral-900 tracking-tight">{packCount}</span>
              <span className="text-sm font-light text-neutral-500 ml-2 tracking-wider">PAKET</span>
            </div>

            {/* YENİ: MALİYET GÖSTERGESİ */}
            {estimatedUnitCost > 0 && (
                <div className="absolute top-4 right-4 bg-white border border-neutral-200 p-2 text-right">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Birim Maliyet</div>
                    <div className="text-sm font-medium text-neutral-900 flex items-center justify-end gap-1">
                        <Coins size={14} className="text-neutral-400"/>
                        {estimatedUnitCost.toFixed(2)} TL
                    </div>
                </div>
            )}
          </div>

          {/* Düşülecek Stoklar */}
          <div>
            <h4 className="font-light text-neutral-900 mb-4 text-sm flex items-center gap-3 tracking-wider">
              <ArrowRight size={16} className="text-neutral-400" strokeWidth={1.5}/> STOK DÜŞÜMLERİ
            </h4>
            <div className="border border-neutral-200 overflow-hidden text-sm">
              {/* Kahve */}
              <div className="flex justify-between p-4 bg-white border-b border-neutral-100">
                <span className="flex items-center gap-2 text-neutral-600 font-light">
                  <Coffee size={14} strokeWidth={1.5}/> Kavrulmuş Kahve
                </span>
                <span className="font-light text-neutral-900">{totalCoffeeNeeded.toFixed(2)} kg</span>
              </div>
              
              {/* Torba */}
              <div className="flex justify-between p-4 bg-white border-b border-neutral-100">
                <span className="flex items-center gap-2 text-neutral-600 font-light">
                  <Package size={14} strokeWidth={1.5}/> 
                  {selectedBagItem?.name}
                  {selectedBagItem?.variant && (
                    <span className="ml-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs tracking-wide">
                      {selectedBagItem.variant}
                    </span>
                  )}
                </span>
                <span className="font-light text-neutral-900">{packCount} adet</span>
              </div>

              {/* Etiketler */}
              {selectedFrontLabelId !== 'no_label' && (
                <div className="flex justify-between p-4 bg-white border-b border-neutral-100">
                  <span className="flex items-center gap-2 text-neutral-600 font-light">
                    <Sticker size={14} strokeWidth={1.5}/> Ön Etiket ({getItemName(selectedFrontLabelId)})
                  </span>
                  <span className="font-light text-neutral-900">{packCount} adet</span>
                </div>
              )}
              {selectedBackLabelId !== 'no_label' && selectedBackLabelId && (
                <div className="flex justify-between p-4 bg-white border-b border-neutral-100">
                  <span className="flex items-center gap-2 text-neutral-600 font-light">
                    <Sticker size={14} strokeWidth={1.5}/> Arka Etiket ({getItemName(selectedBackLabelId)})
                  </span>
                  <span className="font-light text-neutral-900">{packCount} adet</span>
                </div>
              )}
              {/* Koli */}
              {boxesNeeded > 0 && (
                <div className="flex justify-between p-4 bg-neutral-900 text-white">
                  <span className="flex items-center gap-2 font-light">
                    <Box size={14} strokeWidth={1.5}/> Koli ({getItemName(selectedBoxId)})
                  </span>
                  <span className="font-light">{boxesNeeded} adet</span>
                </div>
              )}
            </div>
          </div>

          {/* Butonlar */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              onClick={() => setIsConfirmModalOpen(false)} 
              className="py-4 font-light text-neutral-600 bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors tracking-wide"
            >
              İPTAL
            </button>
            <button 
              onClick={finalizeProduction} 
              className="py-4 font-light text-white bg-neutral-900 hover:bg-neutral-800 transition-colors active:scale-[0.99] tracking-wide"
            >
              ONAYLA
            </button>
          </div>

        </div>
      </Modal>

    </div>
    </div>
    </div>
  );
};