import { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Edit2, Trash2, CreditCard, Banknote, Landmark, Tag, Box, TrendingUp, TrendingDown, RefreshCcw, Package, Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { useFinance, Transaction } from '../context/FinanceContext';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';

const TYPE_OPTIONS = [
  { value: 'income', label: 'GELİR (Tahsilat)' },
  { value: 'expense', label: 'GİDER (Ödeme)' },
];

const STATUS_OPTIONS = [
    { value: 'paid', label: 'ÖDENDİ / TAHSİL EDİLDİ' },
    { value: 'pending', label: 'ÖDENMEDİ / BEKLİYOR' },
];

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'NAKİT / ELDEN' },
  { value: 'bank', label: 'HAVALE / EFT' },
  { value: 'card', label: 'KREDİ KARTI' },
];

const UNIT_OPTIONS = [
    { value: 'adet', label: 'Adet' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'mt', label: 'Metre (mt)' },
    { value: 'm2', label: 'Metrekare (m2)' },
    { value: 'lt', label: 'Litre (lt)' },
    { value: 'takim', label: 'Takım' },
];

export default function TransactionsPage() {
  const { 
    transactions, addTransaction, deleteTransaction, updateTransaction, 
    entities, categories, recipes, materials, addMaterial, updateMaterialCost, addEntity 
  } = useFinance();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'NEW' | 'EDIT'>('NEW');
  const [editId, setEditId] = useState<string | null>(null);

  // Modlar
  const [isNewProjectMode, setIsNewProjectMode] = useState(false);
  const [isNewMaterialMode, setIsNewMaterialMode] = useState(false);
  const [isNewEntityMode, setIsNewEntityMode] = useState(false); // YENİ: Yeni Cari Ekleme Modu

  // Filtreler
  const [filterType, setFilterType] = useState('all');
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mevcut Projeler
  const existingProjects = useMemo(() => {
      const projects = transactions
        .map(t => t.project)
        .filter((p): p is string => !!(p && p.trim() !== ''));
      return Array.from(new Set(projects));
  }, [transactions]);

  // Form State
  const [form, setForm] = useState<{
    date: string;
    dueDate: string;
    description: string;
    amount: string;
    type: string;
    paymentStatus: string;
    category: string;
    entityId: string;
    paymentMethod: string;
    project: string;
    relatedRecipeId: string;
    relatedMaterialId: string;
    newMaterialName: string;
    newEntityName: string; // YENİ: Yeni Cari Adı
    quantity: number;
    unit: string;
  }>({ 
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '', 
    amount: '', 
    type: 'expense',
    paymentStatus: 'paid',
    category: '', 
    entityId: '',
    paymentMethod: 'cash', 
    project: '',
    relatedRecipeId: '',
    relatedMaterialId: '',
    newMaterialName: '',
    newEntityName: '',
    quantity: 1,
    unit: 'adet'
  });

  const fmt = (num: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);

  // --- OPTION HAZIRLIKLARI ---
  const relevantCategories = useMemo(() => {
      return categories.filter(c => c.type === form.type);
  }, [categories, form.type]);
  const categoryOptions = useMemo(() => relevantCategories.map(c => ({ value: c.name, label: c.name })), [relevantCategories]);

  const materialOptions = useMemo(() => {
    return materials.map(m => ({
        value: m.id,
        label: `${m.name} (Stok Maliyet: ${fmt(m.unitCost)}/${m.unit})`
    }));
  }, [materials]);

  const entityOptions = useMemo(() => {
    return [
        { value: '', label: 'Seçim Yok' },
        ...entities.map(e => ({ value: e.id, label: e.name }))
    ];
  }, [entities]);

  const recipeOptions = useMemo(() => {
    return [
        { value: '', label: 'Serbest Satış (Ürün Yok)' },
        ...recipes.map(r => ({
            value: r.id,
            label: `${r.name} (Maliyet: ${fmt(r.totalCost)})`
        }))
    ];
  }, [recipes]);

  const projectOptions = useMemo(() => {
      return existingProjects.map(p => ({ value: p, label: p }));
  }, [existingProjects]);


  // --- KONTROLLER ---
  const isMaterialExpense = useMemo(() => {
     if (form.type !== 'expense') return false;
     const catName = form.category.toLowerCase();
     return catName.includes('hammadde') || catName.includes('malzeme');
  }, [form.type, form.category]);

  const isProductSale = useMemo(() => {
      if (form.type !== 'income') return false;
      const catName = form.category.toLowerCase();
      return catName.includes('satış');
  }, [form.type, form.category]);


  const openNewModal = () => {
    setModalMode('NEW');
    setIsNewProjectMode(false);
    setIsNewMaterialMode(false);
    setIsNewEntityMode(false);
    
    const defaultType = 'expense';
    const defaultCats = categories.filter(c => c.type === defaultType);

    setForm({ 
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        description: '', 
        amount: '', 
        type: defaultType, 
        paymentStatus: 'paid',
        category: defaultCats[0]?.name || '', 
        entityId: '',
        paymentMethod: 'cash',
        project: '',
        relatedRecipeId: '',
        relatedMaterialId: '',
        newMaterialName: '',
        newEntityName: '',
        quantity: 1,
        unit: 'adet'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trx: Transaction) => {
    setModalMode('EDIT');
    setEditId(trx.id);
    const projectExists = existingProjects.includes(trx.project || '');
    setIsNewProjectMode(!projectExists && !!trx.project);
    setIsNewMaterialMode(false);
    setIsNewEntityMode(false);
    
    setForm({ 
        date: trx.date.split('T')[0],
        dueDate: trx.dueDate ? trx.dueDate.split('T')[0] : '',
        description: trx.description, 
        amount: trx.amount.toString(), 
        type: trx.type,
        paymentStatus: trx.paymentStatus || 'paid',
        category: trx.category, 
        entityId: trx.entityId || '',
        paymentMethod: trx.paymentMethod || 'cash',
        project: trx.project || '',
        relatedRecipeId: trx.relatedRecipeId || '',
        relatedMaterialId: trx.relatedMaterialId || '',
        newMaterialName: '',
        newEntityName: '',
        quantity: trx.quantity || 1,
        unit: (trx as any).unit || 'adet'
    });
    setIsModalOpen(true);
  };

  const handleTypeChange = (newType: string) => {
      const newCats = categories.filter(c => c.type === newType);
      setForm(prev => ({
          ...prev,
          type: newType,
          category: newCats[0]?.name || '',
          relatedRecipeId: '',
          relatedMaterialId: '',
          newMaterialName: '',
          unit: 'adet'
      }));
  };

  const handleSave = () => {
     if(!form.amount) return alert("Tutar zorunludur.");
     
     let finalDesc = form.description;
     let finalMaterialId = form.relatedMaterialId;
     let finalEntityId = form.entityId;

     // 1. YENİ CARİ EKLEME MANTIĞI
     if (isNewEntityMode && form.newEntityName) {
         const newEntId = crypto.randomUUID();
         // İşlem türüne göre cari tipini otomatik belirle
         const entityType = form.type === 'income' ? 'customer' : 'supplier';
         
         addEntity({
             id: newEntId,
             name: form.newEntityName,
             type: entityType,
             contact: '-',
             balance: 0
         });
         finalEntityId = newEntId;
     }
     
     // 2. HAMMADDE EKLEME MANTIĞI
     if (isMaterialExpense && isNewMaterialMode && form.newMaterialName) {
         if (!form.newMaterialName) return alert("Hammadde adı giriniz.");
         const unitCost = Number(form.amount) / Number(form.quantity);
         const newMatId = crypto.randomUUID();
         addMaterial({
             id: newMatId, name: form.newMaterialName, unit: form.unit, unitCost: unitCost 
         });
         finalMaterialId = newMatId;
         finalDesc = `${form.newMaterialName} Alımı (${form.quantity} ${form.unit})`;
     
     } else if (isMaterialExpense && !isNewMaterialMode && form.relatedMaterialId) {
         const selectedMat = materials.find(m => m.id === form.relatedMaterialId);
         if (selectedMat) {
             finalDesc = `${selectedMat.name} Alımı (${form.quantity} ${form.unit})`;
             const newUnitCost = Number(form.amount) / Number(form.quantity);
             updateMaterialCost(selectedMat.id, newUnitCost);
         }
     }
     
     if(!finalDesc) return alert("Açıklama giriniz.");

     const trxData = {
        date: new Date(form.date).toISOString(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        description: finalDesc,
        amount: Number(form.amount),
        type: form.type as 'income' | 'expense',
        paymentStatus: form.paymentStatus as 'paid' | 'pending',
        category: form.category,
        entityId: finalEntityId || null,
        paymentMethod: form.paymentMethod as 'cash'|'bank'|'card',
        project: form.project,
        relatedRecipeId: (isProductSale && form.relatedRecipeId) ? form.relatedRecipeId : undefined,
        relatedMaterialId: (isMaterialExpense) ? finalMaterialId : undefined, 
        quantity: Number(form.quantity) || 1,
        unit: form.unit
     };

     if (modalMode === 'NEW') {
        addTransaction({ id: crypto.randomUUID(), ...trxData });
     } else if (modalMode === 'EDIT' && editId) {
        updateTransaction(editId, trxData);
     }
     setIsModalOpen(false);
  };

  const filtered = useMemo(() => {
    return transactions.filter(t => {
       const matchSearch = t.description.toLowerCase().includes(query.toLowerCase()) || 
                           (t.project && t.project.toLowerCase().includes(query.toLowerCase())) ||
                           t.category.toLowerCase().includes(query.toLowerCase());
       const matchType = filterType === 'all' || t.type === filterType;
       let matchDate = true;
       if (dateRange.start) matchDate = matchDate && new Date(t.date) >= new Date(dateRange.start);
       if (dateRange.end) matchDate = matchDate && new Date(t.date) <= new Date(dateRange.end + 'T23:59:59');
       return matchSearch && matchType && matchDate;
    });
  }, [transactions, query, filterType, dateRange]);

  const getPaymentIcon = (method: string) => {
    switch(method) {
        case 'cash': return <Banknote size={16} className="text-green-600"/>;
        case 'card': return <CreditCard size={16} className="text-purple-600"/>;
        case 'bank': return <Landmark size={16} className="text-blue-600"/>;
        default: return <Banknote size={16}/>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-neutral-900">GELİR & GİDER</h1>
            <p className="text-neutral-500 mt-1 font-light">Kasa ve Banka Hareketleri</p>
          </div>
          <button onClick={openNewModal} className="bg-neutral-900 text-white px-6 py-4 flex items-center gap-2 hover:bg-neutral-800 transition-colors font-light tracking-wide">
            <Plus size={18}/> İŞLEM EKLE
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* FİLTRE BARI */}
        <div className="bg-white p-4 border border-neutral-200 shadow-sm mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
             <div className="flex flex-col md:flex-row gap-4 flex-1">
                 <div className="flex bg-neutral-100 p-1 rounded-full w-max">
                   <button onClick={() => setFilterType('all')} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${filterType === 'all' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>TÜMÜ</button>
                   <button onClick={() => setFilterType('income')} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${filterType === 'income' ? 'bg-white shadow-sm text-green-600' : 'text-neutral-500'}`}>GELİR</button>
                   <button onClick={() => setFilterType('expense')} className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${filterType === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-neutral-500'}`}>GİDER</button>
                 </div>
                 <div className="relative flex-1 max-w-sm">
                   <input value={query} onChange={e => setQuery(e.target.value)} placeholder="İşlem, proje veya kategori ara..." className="w-full p-2.5 pl-9 text-sm border border-neutral-200 bg-white outline-none focus:border-neutral-900 font-light rounded-md transition-colors"/>
                   <Search className="absolute left-3 top-3 text-neutral-400" size={16} />
                </div>
             </div>
             <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
                <input type="date" className="p-2 border border-neutral-200 text-sm outline-none rounded-md" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                <span className="text-neutral-300">-</span>
                <input type="date" className="p-2 border border-neutral-200 text-sm outline-none rounded-md" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
             </div>
        </div>

        {/* LİSTE */}
        <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden rounded-lg">
           <table className="w-full text-left">
              <thead className="bg-neutral-50 text-xs text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 tracking-wider">TARİH</th>
                  <th className="px-6 py-4 tracking-wider">AÇIKLAMA / ÜRÜN</th>
                  <th className="px-6 py-4 tracking-wider">KATEGORİ</th>
                  <th className="px-6 py-4 tracking-wider text-center">DURUM</th>
                  <th className="px-6 py-4 tracking-wider text-right">TUTAR</th>
                  <th className="px-6 py-4 tracking-wider text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                 {filtered.map(t => (
                   <tr key={t.id} className={`hover:bg-neutral-50 transition-colors group ${t.paymentStatus === 'pending' ? 'bg-red-50/10' : ''}`}>
                      <td className="px-6 py-4 text-sm text-neutral-500 font-light whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                             <Calendar size={14} className="text-neutral-300"/>
                             {new Date(t.date).toLocaleDateString('tr-TR')}
                           </div>
                           {t.dueDate && (
                               <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-max">
                                   <Clock size={10} />
                                   <span>Vade: {new Date(t.dueDate).toLocaleDateString('tr-TR')}</span>
                               </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">{t.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                            {t.project && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                    <Tag size={10}/> {t.project}
                                </div>
                            )}
                            <div className="text-xs text-neutral-400">
                                {t.entityId ? entities.find(e => e.id === t.entityId)?.name : ''}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                         <span className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200">{t.category}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${t.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {t.paymentStatus === 'paid' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                             {t.paymentStatus === 'paid' ? 'ÖDENDİ' : 'BEKLİYOR'}
                         </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                         {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(t)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={16}/></button>
                            <button onClick={() => { if(confirm('Silmek istediğinize emin misiniz?')) deleteTransaction(t.id) }} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {filtered.length === 0 && <div className="p-12 text-center text-neutral-400 font-light">Kayıt bulunamadı.</div>}
        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'NEW' ? "YENİ HAREKET" : "İŞLEMİ DÜZENLE"}>
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-medium text-neutral-500 mb-2 block tracking-wider">İŞLEM TARİHİ</label>
                 <input 
                    type="date"
                    className="w-full p-4 border border-neutral-300 outline-none font-light bg-white h-[58px]"
                    value={form.date} 
                    onChange={e => setForm({...form, date: e.target.value})}
                 />
               </div>
               <div>
                 <label className="text-xs font-medium text-neutral-500 mb-2 block tracking-wider">VADE TARİHİ (Opsiyonel)</label>
                 <input 
                    type="date"
                    className="w-full p-4 border border-neutral-300 outline-none font-light bg-white h-[58px]"
                    value={form.dueDate} 
                    onChange={e => setForm({...form, dueDate: e.target.value})}
                 />
               </div>
            </div>

            <div>
               <CustomSelect 
                  label="ÖDEME DURUMU"
                  value={form.paymentStatus} 
                  onChange={v => setForm({...form, paymentStatus: v})}
                  options={STATUS_OPTIONS}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <CustomSelect 
                    label="TÜR"
                    value={form.type} 
                    onChange={handleTypeChange}
                    options={TYPE_OPTIONS}
                 />
               </div>
               <div><CustomSelect label="ÖDEME YÖNTEMİ" value={form.paymentMethod} onChange={v => setForm({...form, paymentMethod: v})} options={PAYMENT_OPTIONS} /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <CustomSelect 
                    label="KATEGORİ" 
                    value={form.category} 
                    onChange={v => setForm({...form, category: v})} 
                    options={categoryOptions} 
                    placeholder="Seçiniz..." 
                  />
               </div>
               <div>
                   {/* YENİ: BAĞLANTILI CARİ + HIZLI EKLEME BUTONU */}
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-neutral-500 tracking-wider">BAĞLANTILI CARİ</label>
                      {!isNewEntityMode && (
                          <button onClick={() => setIsNewEntityMode(true)} className="text-[10px] font-bold text-neutral-900 hover:underline flex items-center gap-1">
                              LİSTEDE YOK MU? <span className="bg-neutral-900 text-white px-1 py-0.5">+ YENİ CARİ EKLE</span>
                          </button>
                      )}
                      {isNewEntityMode && (
                          <button onClick={() => setIsNewEntityMode(false)} className="text-[10px] font-bold text-neutral-500 hover:underline flex items-center gap-1">
                             <RefreshCcw size={10} /> LİSTEDEN SEÇ
                          </button>
                      )}
                   </div>
                   
                   {isNewEntityMode ? (
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18}/>
                            <input 
                                value={form.newEntityName} 
                                onChange={e => setForm({...form, newEntityName: e.target.value})} 
                                className="w-full p-4 pl-12 border border-neutral-300 outline-none font-light focus:border-neutral-900 bg-white" 
                                placeholder="Yeni cari adı giriniz..."
                                autoFocus={isNewEntityMode}
                            />
                        </div>
                   ) : (
                       <CustomSelect 
                            value={form.entityId}
                            onChange={v => setForm({...form, entityId: v})}
                            options={entityOptions}
                            placeholder="Seçim Yok"
                       />
                   )}
               </div>
            </div>

            {isMaterialExpense && (
                <div className="bg-orange-50 p-4 rounded border border-orange-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-orange-800">
                           <Package size={16} />
                           <span className="text-xs font-bold tracking-wider">HAMMADDE ALIMI</span>
                        </div>
                        {!isNewMaterialMode && <button onClick={() => setIsNewMaterialMode(true)} className="text-[10px] font-bold text-orange-900 bg-white border border-orange-200 px-2 py-1 rounded hover:bg-orange-100">+ YENİ HAMMADDE</button>}
                        {isNewMaterialMode && <button onClick={() => setIsNewMaterialMode(false)} className="text-[10px] font-bold text-neutral-500 hover:underline">LİSTEDEN SEÇ</button>}
                    </div>
                    <div className="space-y-3">
                         <div>
                            {isNewMaterialMode ? (
                                <input className="w-full p-4 border border-orange-300 outline-none text-sm font-bold placeholder-orange-300 focus:border-orange-500 h-[58px]" placeholder="YENİ HAMMADDE ADI" value={form.newMaterialName} onChange={e => setForm({...form, newMaterialName: e.target.value})}/>
                            ) : (
                                <CustomSelect placeholder="Hammadde Seçiniz..." value={form.relatedMaterialId} onChange={v => setForm({...form, relatedMaterialId: v})} options={materialOptions}/>
                            )}
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] text-orange-600 font-bold block mb-1">MİKTAR</label><input type="number" className="w-full p-3 border border-orange-200 text-sm outline-none bg-white font-light h-14" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})}/></div>
                            <div><label className="text-[10px] text-orange-600 font-bold block mb-1">BİRİM</label><CustomSelect value={form.unit} onChange={v => setForm({...form, unit: v})} options={UNIT_OPTIONS}/></div>
                        </div>
                    </div>
                </div>
            )}

            {isProductSale && recipes && recipes.length > 0 && (
                <div className="bg-blue-50 p-4 rounded border border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2 text-blue-800"><Box size={16} /><span className="text-xs font-bold tracking-wider">STOK / ÜRÜN SATIŞI (Reçete)</span></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2"><CustomSelect value={form.relatedRecipeId || ''} onChange={val => { const rec = recipes.find(r => r.id === val); setForm(prev => ({ ...prev, relatedRecipeId: val, description: rec ? `${rec.name} Satışı` : prev.description, amount: rec ? (rec.suggestedPrice * (prev.quantity || 1)).toString() : prev.amount })); }} options={recipeOptions} placeholder="Serbest Satış"/></div>
                        <div><input type="number" className="w-full p-3 border border-blue-200 text-sm outline-none font-light text-center h-14 bg-white" placeholder="Adet" value={form.quantity} onChange={e => { const qty = Number(e.target.value); const rec = recipes.find(r => r.id === form.relatedRecipeId); setForm(prev => ({ ...prev, quantity: qty, amount: rec ? (rec.suggestedPrice * qty).toString() : prev.amount })); }}/></div>
                    </div>
                </div>
            )}
            
            <div>
               <label className="text-xs font-medium text-neutral-500 mb-2 block tracking-wider">AÇIKLAMA</label>
               <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 border border-neutral-300 outline-none font-light focus:border-neutral-900" />
            </div>

            <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-neutral-500 tracking-wider">PROJE / İŞ ADI</label>
                  {!isNewProjectMode && <button onClick={() => setIsNewProjectMode(true)} className="text-[10px] font-bold text-neutral-900 hover:underline flex items-center gap-1">LİSTEDE YOK MU? <span className="bg-neutral-900 text-white px-1 py-0.5">+ YENİ PROJE EKLE</span></button>}
                  {isNewProjectMode && existingProjects.length > 0 && <button onClick={() => setIsNewProjectMode(false)} className="text-[10px] font-bold text-neutral-500 hover:underline flex items-center gap-1"><RefreshCcw size={10} /> LİSTEDEN SEÇ</button>}
               </div>
               <div className="relative">
                  {isNewProjectMode || existingProjects.length === 0 ? (
                      <div className="relative"><Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18}/><input value={form.project} onChange={e => setForm({...form, project: e.target.value})} className="w-full p-4 pl-12 border border-neutral-300 outline-none font-light focus:border-neutral-900 bg-white" placeholder="Yeni proje adını giriniz..." autoFocus={isNewProjectMode}/></div>
                  ) : (
                      <CustomSelect icon={Tag} value={form.project} onChange={v => setForm({...form, project: v})} options={projectOptions} placeholder="Proje Seçiniz..."/>
                  )}
               </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 mb-2 block tracking-wider">TUTAR (TL)</label>
              <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full p-4 text-xl border border-neutral-300 outline-none font-light focus:border-neutral-900" placeholder="0.00"/>
            </div>

            <button onClick={handleSave} className={`w-full py-4 text-white font-light tracking-widest mt-4 hover:opacity-90 transition-opacity ${form.type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}>
               {modalMode === 'NEW' ? 'KAYDET' : 'GÜNCELLE'}
            </button>
         </div>
      </Modal>
    </div>
  );
}