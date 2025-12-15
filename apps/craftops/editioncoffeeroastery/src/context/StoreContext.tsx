import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// --- TYPE DEFINITIONS ---

export interface GreenCoffee {
  id: string;
  name: string;
  origin: string;
  process: string;
  stockKg: number;
  entryDate: string;
  averageCost?: number;
}

export interface RoastStock {
  id: string;
  name: string;
  roastLevel: 'Light' | 'Medium' | 'Dark' | 'Omni';
  stockKg: number;
  roastDate: string;
  sourceGreenId?: string;
  unitCost?: number;
}

export interface BlendIngredient {
  roastId: string;
  ratio: number;
}

export interface BlendRecipe {
  id: string;
  name: string;
  description?: string;
  ingredients: BlendIngredient[];
}

export interface ProductionLog {
  id: string;
  date: string;
  productName: string;
  brand: 'Edition' | 'Hisaraltı';
  packSize: 250 | 1000;
  packCount: number;
  totalCoffeeKg: number;
  unitCost?: number;
  totalCost?: number;
}

export interface SalesLog {
  id: string;
  date: string;
  orderId: string;
  productName: string;
  brand: string;
  packSize: number;
  quantity: number;
}

export interface OrderItem {
  sku: string;
  productName: string;
  brand: string;
  packSize: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  createDate: string;
  status: 'Pending' | 'Shipped' | 'Cancelled';
  shipDate?: string;
  items: OrderItem[];
  note?: string;
  totalQuantity: number;
  deliveryDate?: string;
  totalAmount?: number;
}

// YENİ: TEKLİF YAPISI
export interface Quote {
  id: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalOfferAmount: number; // Müşteriye verilen fiyat
  estimatedCost: number;    // O anki maliyet
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  note?: string;
}

export interface PackagingItem {
  id: string;
  category: 'Bag' | 'Label' | 'Box';
  brand: 'Edition' | 'Hisaraltı' | 'Genel';
  name: string;
  variant?: string;
  labelType?: 'Front' | 'Back';
  color?: 'White' | 'Black';
  stockQuantity: number;
  minThreshold: number;
  averageCost?: number;
}

export interface PurchaseLog {
  id: string;
  date: string;
  supplier: string;
  category: 'GreenCoffee' | 'Packaging';
  itemId: string;
  itemName: string;
  quantity: number;
  cost?: number;
  unitCost?: number;
}

export interface ThresholdSettings {
  greenCoffee: { critical: number; low: number };
  roastStock: { critical: number; low: number };
  bag: { critical: number; low: number };
  label: { critical: number; low: number };
  box: { critical: number; low: number };
  finishedProduct: { critical: number; low: number };
}

export interface SystemSettings {
  companyName: string;
  currency: string;
  thresholds: ThresholdSettings;
}

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'Edition Coffee Roastery',
  currency: 'TRY',
  thresholds: {
    greenCoffee: { critical: 120, low: 200 },
    roastStock: { critical: 20, low: 50 },
    bag: { critical: 100, low: 300 },
    label: { critical: 200, low: 500 },
    box: { critical: 50, low: 100 },
    finishedProduct: { critical: 20, low: 50 }
  }
};

type PackagingUsage = {
  bagId: string;
  frontLabelId?: string;
  backLabelId?: string;
  boxId?: string;
  boxCount: number;
};

// --- DUMMY DATA ---
const DUMMY_GREENS: GreenCoffee[] = [
  { id: 'GC-001', name: 'Brazil Rio Brilhante', origin: 'Brazil', process: 'Natural', stockKg: 60, entryDate: '2023-10-01', averageCost: 280 },
  { id: 'GC-002', name: 'Ethiopia Yirgacheffe', origin: 'Ethiopia', process: 'Washed', stockKg: 40, entryDate: '2023-10-05', averageCost: 450 },
];
const DUMMY_PACKAGING: PackagingItem[] = [
  { id: 'PKG-001', category: 'Bag', brand: 'Edition', name: 'Beyaz Valfli Torba', variant: '250g', color: 'White', stockQuantity: 500, minThreshold: 50, averageCost: 8.50 },
  { id: 'PKG-002', category: 'Label', brand: 'Edition', name: 'Ön Etiket (Standart)', variant: '250g', labelType: 'Front', stockQuantity: 1000, minThreshold: 100, averageCost: 3.25 },
  { id: 'PKG-003', category: 'Label', brand: 'Edition', name: 'Arka Etiket (Bilgi)', variant: '250g', labelType: 'Back', stockQuantity: 1000, minThreshold: 100, averageCost: 1.50 },
  { id: 'PKG-004', category: 'Box', brand: 'Genel', name: 'Kargo Kolisi', variant: '12li', stockQuantity: 50, minThreshold: 10, averageCost: 15.00 },
];
const DUMMY_ROASTS: RoastStock[] = [
  { id: 'RST-001', name: 'Brazil Espresso Roast', roastLevel: 'Medium', stockKg: 10, roastDate: '2023-10-25', sourceGreenId: 'GC-001', unitCost: 350 },
  { id: 'RST-002', name: 'Ethiopia Filter Roast', roastLevel: 'Light', stockKg: 5, roastDate: '2023-10-26', sourceGreenId: 'GC-002', unitCost: 529.41 },
];
const DUMMY_RECIPES: BlendRecipe[] = [
  { id: 'BLD-001', name: 'Morning Blend', description: 'Sabah kahvesi için ideal', ingredients: [{ roastId: 'RST-001', ratio: 70 }, { roastId: 'RST-002', ratio: 30 }] }
];
const DUMMY_PURCHASES: PurchaseLog[] = [
  { id: 'PUR-001', date: '2023-10-01', supplier: 'Kahve İthalat A.Ş.', category: 'GreenCoffee', itemId: 'GC-001', itemName: 'Brazil Rio Brilhante', quantity: 100, cost: 28000, unitCost: 280 },
  { id: 'PUR-002', date: '2023-10-02', supplier: 'Ambalaj Dünyası', category: 'Packaging', itemId: 'PKG-001', itemName: 'Beyaz Valfli Torba', quantity: 1000, cost: 8500, unitCost: 8.50 },
];

interface StoreContextType {
  greenCoffees: GreenCoffee[];
  roastStocks: RoastStock[];
  recipes: BlendRecipe[];
  productionLogs: ProductionLog[];
  salesLogs: SalesLog[];
  packagingItems: PackagingItem[];
  orders: Order[];
  quotes: Quote[]; // YENİ
  settings: SystemSettings;
  purchases: PurchaseLog[];

  addGreenCoffee: (coffee: GreenCoffee) => void;
  updateGreenCoffee: (coffee: GreenCoffee) => void;
  deleteGreenCoffee: (id: string) => void;

  addRoastAndDeductGreen: (roast: RoastStock, greenId: string, deductedGreenKg: number) => void;
  updateRoastStock: (roast: RoastStock) => void;
  deleteRoastStock: (id: string) => void;

  addRecipe: (recipe: BlendRecipe) => void;
  updateRecipe: (recipe: BlendRecipe) => void;
  deleteRecipe: (id: string) => void;

  addPackagingItem: (item: PackagingItem) => void;
  updatePackagingItem: (item: PackagingItem) => void;
  deletePackagingItem: (id: string) => void;

  recordProduction: (logData: Omit<ProductionLog, 'id'>, packagingUsage: PackagingUsage, recipe?: BlendRecipe, singleOriginId?: string) => void;
  deleteProductionLog: (id: string) => void;
  updateProductionLog: (id: string, newQuantity: number) => void;

  addOrder: (order: Order) => void;
  shipOrder: (orderId: string, date: string) => void;
  cancelOrder: (orderId: string) => void;

  // YENİ QUOTE FONKSİYONLARI
  addQuote: (quote: Quote) => void;
  deleteQuote: (id: string) => void;

  recordPurchase: (log: PurchaseLog) => void;
  updateSettings: (newSettings: SystemSettings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const usePersistedState = <T,>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : initial;
    });
    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(state));
      }
    }, [key, state]);
    return [state, setState];
  };

  const [greenCoffees, setGreenCoffees] = usePersistedState<GreenCoffee[]>('greenCoffees', DUMMY_GREENS);
  const [roastStocks, setRoastStocks] = usePersistedState<RoastStock[]>('roastStocks', DUMMY_ROASTS);
  const [recipes, setRecipes] = usePersistedState<BlendRecipe[]>('recipes', DUMMY_RECIPES);
  const [packagingItems, setPackagingItems] = usePersistedState<PackagingItem[]>('packagingItems', DUMMY_PACKAGING);
  const [productionLogs, setProductionLogs] = usePersistedState<ProductionLog[]>('productionLogs', []);
  const [salesLogs, setSalesLogs] = usePersistedState<SalesLog[]>('salesLogs', []);
  const [orders, setOrders] = usePersistedState<Order[]>('orders', []);
  const [quotes, setQuotes] = usePersistedState<Quote[]>('quotes', []); // YENİ
  const [purchases, setPurchases] = usePersistedState<PurchaseLog[]>('purchases', DUMMY_PURCHASES);
  const [settings, setSettings] = usePersistedState<SystemSettings>('systemSettings', DEFAULT_SETTINGS);

  const updateSettings = (newSettings: SystemSettings) => setSettings(newSettings);

  const addGreenCoffee = (coffee: GreenCoffee) => setGreenCoffees(prev => [...prev, coffee]);
  const updateGreenCoffee = (coffee: GreenCoffee) => setGreenCoffees(prev => prev.map(c => (c.id === coffee.id ? coffee : c)));
  const deleteGreenCoffee = (id: string) => setGreenCoffees(prev => prev.filter(c => c.id !== id));

  const addRoastAndDeductGreen = (roast: RoastStock, greenId: string, deductedGreenKg: number) => {
    const green = greenCoffees.find(g => g.id === greenId);
    if (!green) return;
    if (green.stockKg < deductedGreenKg) { alert(`Yetersiz yeşil çekirdek.`); return; }
    const totalInputCost = (green.averageCost || 0) * deductedGreenKg;
    const calculatedRoastUnitCost = roast.stockKg > 0 ? totalInputCost / roast.stockKg : 0;
    const roastWithCost = { ...roast, unitCost: calculatedRoastUnitCost };
    setGreenCoffees(prev => prev.map(g => (g.id === greenId ? { ...g, stockKg: g.stockKg - deductedGreenKg } : g)));
    setRoastStocks(prev => [...prev, roastWithCost]);
  };

  const updateRoastStock = (roast: RoastStock) => setRoastStocks(prev => prev.map(r => (r.id === roast.id ? roast : r)));
  const deleteRoastStock = (id: string) => setRoastStocks(prev => prev.filter(r => r.id !== id));
  const addRecipe = (recipe: BlendRecipe) => setRecipes(prev => [...prev, recipe]);
  const updateRecipe = (recipe: BlendRecipe) => setRecipes(prev => prev.map(r => (r.id === recipe.id ? recipe : r)));
  const deleteRecipe = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id));
  const addPackagingItem = (item: PackagingItem) => setPackagingItems(prev => [...prev, item]);
  const updatePackagingItem = (item: PackagingItem) => setPackagingItems(prev => prev.map(p => (p.id === item.id ? item : p)));
  const deletePackagingItem = (id: string) => setPackagingItems(prev => prev.filter(p => p.id !== id));

  const recordPurchase = (log: PurchaseLog) => {
    const currentTransactionUnitCost = log.cost && log.quantity > 0 ? log.cost / log.quantity : 0;
    const newLogWithUnitCost = { ...log, unitCost: currentTransactionUnitCost };
    setPurchases(prev => [newLogWithUnitCost, ...prev]);
    if (log.category === 'GreenCoffee') {
      setGreenCoffees(prevGreens => {
        return prevGreens.map(g => {
          if (g.id === log.itemId) {
            const currentStock = Math.max(0, g.stockKg); 
            const currentAvgCost = g.averageCost || 0;
            const newTotalStock = currentStock + log.quantity;
            let newAverageCost = currentAvgCost;
            if (log.cost && log.cost > 0 && newTotalStock > 0) { const totalValue = (currentStock * currentAvgCost) + log.cost; newAverageCost = totalValue / newTotalStock; }
            return { ...g, stockKg: newTotalStock, averageCost: newAverageCost };
          }
          return g;
        });
      });
    } else if (log.category === 'Packaging') {
      setPackagingItems(prevPacks => {
        return prevPacks.map(p => {
          if (p.id === log.itemId) {
            const currentStock = Math.max(0, p.stockQuantity);
            const currentAvgCost = p.averageCost || 0;
            const newTotalStock = currentStock + log.quantity;
            let newAverageCost = currentAvgCost;
            if (log.cost && log.cost > 0 && newTotalStock > 0) { const totalValue = (currentStock * currentAvgCost) + log.cost; newAverageCost = totalValue / newTotalStock; }
            return { ...p, stockQuantity: newTotalStock, averageCost: newAverageCost };
          }
          return p;
        });
      });
    }
  };

  const recordProduction = (logData: Omit<ProductionLog, 'id'>, packagingUsage: PackagingUsage, recipe?: BlendRecipe, singleOriginId?: string) => {
    let totalCoffeeCostPerKg = 0;
    if (recipe) {
      recipe.ingredients.forEach(ing => {
        const roast = roastStocks.find(r => r.id === ing.roastId);
        if (roast && roast.unitCost) { totalCoffeeCostPerKg += (roast.unitCost * (ing.ratio / 100)); }
      });
    } else if (singleOriginId) {
      const roast = roastStocks.find(r => r.id === singleOriginId);
      if (roast && roast.unitCost) { totalCoffeeCostPerKg = roast.unitCost; }
    }
    const packSizeInKg = logData.packSize / 1000;
    const coffeeCostPerPack = totalCoffeeCostPerKg * packSizeInKg;
    let packagingCostPerPack = 0;
    const findPackCost = (id?: string) => { const item = packagingItems.find(p => p.id === id); return item?.averageCost || 0; };
    packagingCostPerPack += findPackCost(packagingUsage.bagId);
    if (packagingUsage.frontLabelId) packagingCostPerPack += findPackCost(packagingUsage.frontLabelId);
    if (packagingUsage.backLabelId) packagingCostPerPack += findPackCost(packagingUsage.backLabelId);
    if (packagingUsage.boxId && packagingUsage.boxCount > 0 && logData.packCount > 0) {
       const boxItemCost = findPackCost(packagingUsage.boxId);
       const totalBoxCost = boxItemCost * packagingUsage.boxCount;
       packagingCostPerPack += (totalBoxCost / logData.packCount);
    }
    const totalUnitCost = coffeeCostPerPack + packagingCostPerPack;
    const grandTotalCost = totalUnitCost * logData.packCount;

    if (recipe) {
      setRoastStocks(prev => {
        const newRoasts = [...prev];
        for (const ing of recipe.ingredients) { const amount = logData.totalCoffeeKg * (ing.ratio / 100); const idx = newRoasts.findIndex(r => r.id === ing.roastId); if (idx >= 0) newRoasts[idx].stockKg -= amount; }
        return newRoasts;
      });
    } else if (singleOriginId) {
      setRoastStocks(prev => prev.map(r => r.id === singleOriginId ? { ...r, stockKg: r.stockKg - logData.totalCoffeeKg } : r));
    }
    setPackagingItems(prev => {
       const newPackaging = [...prev];
       const deduct = (id: string, qty: number) => { const idx = newPackaging.findIndex(p => p.id === id); if (idx >= 0) newPackaging[idx].stockQuantity -= qty; };
       deduct(packagingUsage.bagId, logData.packCount);
       if (packagingUsage.frontLabelId) deduct(packagingUsage.frontLabelId, logData.packCount);
       if (packagingUsage.backLabelId) deduct(packagingUsage.backLabelId, logData.packCount);
       if (packagingUsage.boxId) deduct(packagingUsage.boxId, packagingUsage.boxCount);
       return newPackaging;
    });
    const newLog: ProductionLog = { ...logData, id: `PRD-${Date.now()}`, unitCost: totalUnitCost, totalCost: grandTotalCost };
    setProductionLogs(prev => [newLog, ...prev]);
  };

  const deleteProductionLog = (id: string) => setProductionLogs(prev => prev.filter(l => l.id !== id));
  const updateProductionLog = (id: string, newQuantity: number) => setProductionLogs(prev => prev.map(l => l.id === id ? { ...l, packCount: newQuantity } : l));
  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const shipOrder = (orderId: string, date: string) => { 
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const newSales: SalesLog[] = order.items.map(item => ({ id: `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`, date, orderId, productName: item.productName, brand: item.brand, packSize: item.packSize, quantity: item.quantity }));
    setSalesLogs(prev => [...newSales, ...prev]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Shipped', shipDate: date } : o));
  };
  const cancelOrder = (orderId: string) => setOrders(prev => prev.filter(o => o.id !== orderId));

  // --- YENİ QUOTE ACTIONS ---
  const addQuote = (quote: Quote) => setQuotes(prev => [quote, ...prev]);
  const deleteQuote = (id: string) => setQuotes(prev => prev.filter(q => q.id !== id));

  return (
    <StoreContext.Provider
      value={{
        greenCoffees, roastStocks, recipes, productionLogs, salesLogs, packagingItems, orders, quotes, purchases, settings,
        addGreenCoffee, updateGreenCoffee, deleteGreenCoffee,
        addRoastAndDeductGreen, updateRoastStock, deleteRoastStock,
        addRecipe, updateRecipe, deleteRecipe,
        addPackagingItem, updatePackagingItem, deletePackagingItem,
        recordProduction, deleteProductionLog, updateProductionLog,
        addOrder, shipOrder, cancelOrder,
        addQuote, deleteQuote,
        recordPurchase, updateSettings
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};