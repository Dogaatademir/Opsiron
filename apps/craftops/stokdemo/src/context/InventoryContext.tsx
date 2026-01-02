import React, { createContext, useContext, useState, ReactNode } from 'react';
import { INITIAL_MATERIALS, INITIAL_PRODUCTS, INITIAL_LOGS } from '../data/dummyData';

// --- TİPLER (Aynen Kalıyor) ---
export interface RawMaterial { id: string; name: string; category: string; unit: string; stock: number; minLimit: number; }
export interface RecipeItem { itemId: string; type: 'raw' | 'semi'; quantity: number; }
export interface Product { id: string; name: string; type: 'semi' | 'finished'; unit: string; stock: number; recipe: RecipeItem[]; }
export interface Log { id: string; date: string; message: string; type: 'production' | 'restock' | 'shipment' | 'system'; }

interface InventoryContextType {
  materials: RawMaterial[];
  products: Product[];
  logs: Log[];
  
  addMaterial: (item: RawMaterial) => void;
  addProduct: (item: Product) => void;
  removeMaterial: (id: string) => void;
  removeProduct: (id: string) => void;
  produceItem: (productId: string, quantity: number) => { success: boolean; message: string };
  restockItem: (id: string, quantity: number) => void;
  getAllIngredients: () => { id: string; name: string; type: 'raw' | 'semi'; stock: number; unit: string }[];
  
  // YENİ EKLENEN FONKSİYONLAR
  clearAllData: () => void;
  loadDemoData: () => void;
  updateCompanySettings: (name: string) => void;
  companyName: string;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<RawMaterial[]>(INITIAL_MATERIALS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [logs, setLogs] = useState<Log[]>(INITIAL_LOGS);
  const [companyName, setCompanyName] = useState("CraftOps Fabrika");

  // Mevcut Actions...
  const addMaterial = (item: RawMaterial) => setMaterials(prev => [item, ...prev]);
  const addProduct = (item: Product) => setProducts(prev => [item, ...prev]);
  const removeMaterial = (id: string) => setMaterials(prev => prev.filter(m => m.id !== id));
  const removeProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const produceItem = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Ürün bulunamadı.' };

    for (const item of product.recipe) {
      const requiredQty = item.quantity * quantity;
      if (item.type === 'raw') {
        const mat = materials.find(m => m.id === item.itemId);
        if (!mat || mat.stock < requiredQty) return { success: false, message: `Yetersiz Hammadde: ${mat?.name || item.itemId}` };
      } else {
        const semi = products.find(p => p.id === item.itemId);
        if (!semi || semi.stock < requiredQty) return { success: false, message: `Yetersiz Yarı Mamül: ${semi?.name || item.itemId}` };
      }
    }

    setMaterials(prev => prev.map(m => {
      const usage = product.recipe.find(r => r.type === 'raw' && r.itemId === m.id);
      return usage ? { ...m, stock: m.stock - (usage.quantity * quantity) } : m;
    }));

    setProducts(prev => prev.map(p => {
      const usage = product.recipe.find(r => r.type === 'semi' && r.itemId === p.id);
      if (usage) return { ...p, stock: p.stock - (usage.quantity * quantity) };
      if (p.id === productId) return { ...p, stock: p.stock + quantity };
      return p;
    }));

    setLogs(prev => [{ id: crypto.randomUUID(), date: new Date().toISOString(), message: `${quantity} adet ${product.name} üretildi.`, type: 'production' }, ...prev]);
    return { success: true, message: 'Üretim başarılı.' };
  };

  const restockItem = (id: string, quantity: number) => {
    let itemName = '';
    setMaterials(prev => prev.map(m => { if (m.id === id) { itemName = m.name; return { ...m, stock: m.stock + quantity }; } return m; }));
    if(itemName) setLogs(prev => [{ id: crypto.randomUUID(), date: new Date().toISOString(), message: `${quantity} adet ${itemName} stoğa eklendi.`, type: 'restock' }, ...prev]);
  };

  const getAllIngredients = () => {
    const rawList = materials.map(m => ({ id: m.id, name: m.name, type: 'raw' as const, stock: m.stock, unit: m.unit }));
    const semiList = products.filter(p => p.type === 'semi').map(p => ({ id: p.id, name: p.name, type: 'semi' as const, stock: p.stock, unit: p.unit }));
    return [...rawList, ...semiList];
  };

  // --- YENİ EKLENEN YETENEKLER ---
  
  const clearAllData = () => {
    setMaterials([]);
    setProducts([]);
    setLogs([{ id: crypto.randomUUID(), date: new Date().toISOString(), message: 'Sistem verileri sıfırlandı.', type: 'system' }]);
  };

  const loadDemoData = () => {
    setMaterials(INITIAL_MATERIALS);
    setProducts(INITIAL_PRODUCTS);
    setLogs([{ id: crypto.randomUUID(), date: new Date().toISOString(), message: 'Demo verileri yüklendi.', type: 'system' }, ...INITIAL_LOGS]);
  };

  const updateCompanySettings = (name: string) => {
    setCompanyName(name);
  };

  return (
    <InventoryContext.Provider value={{ 
      materials, products, logs, companyName,
      addMaterial, addProduct, removeMaterial, removeProduct, produceItem, restockItem, getAllIngredients,
      clearAllData, loadDemoData, updateCompanySettings
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
}