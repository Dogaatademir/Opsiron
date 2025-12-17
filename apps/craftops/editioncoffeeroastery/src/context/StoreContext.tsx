import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// --- TYPE DEFINITIONS ---

export interface GreenCoffee { id: string; name: string; origin: string; process: string; stockKg: number; entryDate: string; averageCost?: number; }
export interface RoastStock { id: string; name: string; roastLevel: 'Light' | 'Medium' | 'Dark' | 'Omni'; stockKg: number; roastDate: string; sourceGreenId?: string; unitCost?: number; }
export interface BlendIngredient { roastId: string; ratio: number; }
export interface BlendRecipe { id: string; name: string; description?: string; ingredients: BlendIngredient[]; }
export interface ProductionLog { id: string; status: 'Active' | 'Voided'; voidReason?: string; voidDate?: string; date: string; productName: string; brand: 'Edition' | 'Hisaraltı'; packSize: 250 | 1000; packCount: number; totalCoffeeKg: number; unitCost?: number; totalCost?: number; }
export interface OrderItem { sku: string; productName: string; brand: string; packSize: number; quantity: number; }
export interface Quote { id: string; customerName: string; date: string; items: OrderItem[]; totalOfferAmount: number; estimatedCost: number; status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected'; note?: string; }
export interface PackagingItem { id: string; category: 'Bag' | 'Label' | 'Box'; brand: 'Edition' | 'Hisaraltı' | 'Genel'; name: string; variant?: string; labelType?: 'Front' | 'Back'; color?: 'White' | 'Black'; stockQuantity: number; minThreshold: number; averageCost?: number; }
export interface ThresholdSettings { greenCoffee: { critical: number; low: number }; roastStock: { critical: number; low: number }; bag: { critical: number; low: number }; label: { critical: number; low: number }; box: { critical: number; low: number }; finishedProduct: { critical: number; low: number }; }
export interface SystemSettings { companyName: string; currency: string; thresholds: ThresholdSettings; }

// --- FİNANS & STOK HAREKET TİPLERİ ---

export interface Party {
  id: string;
  type: 'Customer' | 'Supplier' | 'Both';
  name: string;
  phone?: string;
  email?: string;
  taxNo?: string;
  note?: string;
  status: 'Active' | 'Voided';
}

export interface Category {
  id: string;
  type: 'Income' | 'Expense';
  name: string;
  status: 'Active' | 'Voided';
}

export interface LedgerEntry {
  id: string;
  date: string;
  partyId?: string; 
  categoryId: string;
  direction: 'Debit' | 'Credit'; 
  amount: number;
  currency: 'TRY';
  sourceType: 'Purchase' | 'Sale' | 'Payment' | 'Adjustment';
  sourceId: string; 
  note?: string;
  status: 'Active' | 'Voided';
}

export interface Payment {
  id: string;
  date: string;
  partyId: string;
  type: 'Inbound' | 'Outbound'; 
  method: 'Cash' | 'Bank' | 'Card' | 'Other';
  amount: number;
  currency: 'TRY';
  note?: string;
  status: 'Active' | 'Voided';
  voidReason?: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  itemType: 'GreenCoffee' | 'RoastStock' | 'Packaging' | 'FinishedProduct';
  itemId: string; 
  qtyDelta: number; // Giriş (+), Çıkış (-)
  uom: 'kg' | 'qty'; 
  reason: 'Production' | 'Sale' | 'Purchase' | 'Usage' | 'Void' | 'Adjustment';
  sourceType: 'ProductionLog' | 'Order' | 'PurchaseLog' | 'Manual' | 'Sale'; 
  sourceId: string;
  unitCost?: number;
  totalCost?: number; 
  status: 'Active' | 'Voided';
}

export interface Order {
  id: string;
  customerId: string; 
  customerName: string; 
  createDate: string;
  status: 'Pending' | 'Shipped' | 'Cancelled' | 'Voided';
  voidReason?: string;
  voidDate?: string;
  shipDate?: string;
  items: OrderItem[];
  note?: string;
  totalQuantity: number;
  deliveryDate?: string;
  totalAmount?: number;
  linkedSaleId?: string; 
}

export interface Sale {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Active' | 'Voided';
  voidReason?: string;
  voidDate?: string;
}

export interface PurchaseLog {
  id: string;
  date: string;
  dueDate?: string; 
  supplierId?: string;
  supplier: string;
  categoryId?: string; 
  category: 'GreenCoffee' | 'Packaging';
  itemId: string;
  itemName: string;
  quantity: number;
  cost?: number;
  unitCost?: number;
  status?: 'Active' | 'Voided'; 
  voidReason?: string;
}

type PackagingUsage = { bagId: string; frontLabelId?: string; backLabelId?: string; boxId?: string; boxCount: number; };

// --- SYSTEM DEFAULTS ---

const DEFAULT_SETTINGS: SystemSettings = { 
  companyName: 'Edition Coffee Roastery', 
  currency: 'TRY', 
  thresholds: { 
    greenCoffee: { critical: 50, low: 100 }, 
    roastStock: { critical: 10, low: 20 }, 
    bag: { critical: 100, low: 300 }, 
    label: { critical: 200, low: 500 }, 
    box: { critical: 50, low: 100 }, 
    finishedProduct: { critical: 20, low: 50 } 
  } 
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'CAT-001', type: 'Expense', name: 'Hammadde (Yeşil Çekirdek)', status: 'Active' },
  { id: 'CAT-002', type: 'Expense', name: 'Ambalaj & Paketleme', status: 'Active' },
  { id: 'CAT-003', type: 'Income', name: 'Ürün Satışı', status: 'Active' },
  { id: 'CAT-004', type: 'Expense', name: 'Kargo & Lojistik', status: 'Active' },
  { id: 'CAT-005', type: 'Expense', name: 'Genel Giderler', status: 'Active' },
  { id: 'CAT-006', type: 'Income', name: 'Tahsilat / Ödeme', status: 'Active' },
  { id: 'CAT-COGS', type: 'Expense', name: 'Satılan Malın Maliyeti (COGS)', status: 'Active' },
];

interface StoreContextType {
  greenCoffees: GreenCoffee[];
  roastStocks: RoastStock[];
  recipes: BlendRecipe[];
  productionLogs: ProductionLog[];
  packagingItems: PackagingItem[];
  orders: Order[];
  sales: Sale[];
  quotes: Quote[];
  purchases: PurchaseLog[];
  settings: SystemSettings;
  
  parties: Party[];
  categories: Category[];
  ledgerEntries: LedgerEntry[];
  payments: Payment[];
  inventoryMovements: InventoryMovement[];

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
  
  recordProduction: (logData: Omit<ProductionLog, 'id' | 'status'>, packagingUsage: PackagingUsage, recipe?: BlendRecipe, singleOriginId?: string) => void;
  voidProductionLog: (id: string, reason?: string) => void;
  
  addOrder: (order: Order) => void;
  shipOrder: (orderId: string, date: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  voidSale: (saleId: string, reason?: string) => void;
  
  recordPurchase: (log: PurchaseLog) => void;
  voidPurchase: (id: string, reason?: string) => void;
  
  recordPayment: (payment: Payment) => void;
  voidPayment: (id: string, reason?: string) => void;
  
  addQuote: (quote: Quote) => void;
  deleteQuote: (id: string) => void;
  updateSettings: (newSettings: SystemSettings) => void;
  addParty: (party: Party) => void;
  updateParty: (party: Party) => void;
  voidParty: (id: string) => void;
  addCategory: (category: Category) => void;
  voidCategory: (id: string) => void;
  
  getPartyBalance: (partyId: string) => number;
  getOnHand: (itemType: string, itemId: string) => number;

  importSystemData: (data: any) => void;
  resetSystem: () => void;
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

  // --- INITIALIZATION ---
  const [greenCoffees, setGreenCoffees] = usePersistedState<GreenCoffee[]>('greenCoffees', []);
  const [roastStocks, setRoastStocks] = usePersistedState<RoastStock[]>('roastStocks', []);
  const [recipes, setRecipes] = usePersistedState<BlendRecipe[]>('recipes', []);
  const [packagingItems, setPackagingItems] = usePersistedState<PackagingItem[]>('packagingItems', []);
  const [productionLogs, setProductionLogs] = usePersistedState<ProductionLog[]>('productionLogs', []);
  const [orders, setOrders] = usePersistedState<Order[]>('orders', []);
  const [sales, setSales] = usePersistedState<Sale[]>('sales', []);
  const [quotes, setQuotes] = usePersistedState<Quote[]>('quotes', []);
  const [purchases, setPurchases] = usePersistedState<PurchaseLog[]>('purchases', []);
  const [settings, setSettings] = usePersistedState<SystemSettings>('systemSettings', DEFAULT_SETTINGS);

  const [parties, setParties] = usePersistedState<Party[]>('parties', []);
  const [categories, setCategories] = usePersistedState<Category[]>('categories', DEFAULT_CATEGORIES); 
  const [ledgerEntries, setLedgerEntries] = usePersistedState<LedgerEntry[]>('ledgerEntries', []);
  const [payments, setPayments] = usePersistedState<Payment[]>('payments', []);
  const [inventoryMovements, setInventoryMovements] = usePersistedState<InventoryMovement[]>('inventoryMovements', []);

  // --- ACTIONS ---
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
    
    setGreenCoffees(prev => prev.map(g => (g.id === greenId ? { ...g, stockKg: g.stockKg - deductedGreenKg } : g)));
    setRoastStocks(prev => [...prev, { ...roast, unitCost: calculatedRoastUnitCost }]);
    
    const greenMove: InventoryMovement = {
        id: `MOV-ROAST-${Date.now()}`, date: new Date().toISOString(), itemType: 'GreenCoffee', itemId: greenId,
        qtyDelta: -deductedGreenKg, uom: 'kg', reason: 'Usage', sourceType: 'Manual', sourceId: roast.id,
        status: 'Active'
    };
    setInventoryMovements(prev => [...prev, greenMove]);
  };
  
  const updateRoastStock = (roast: RoastStock) => setRoastStocks(prev => prev.map(r => (r.id === roast.id ? roast : r)));
  const deleteRoastStock = (id: string) => setRoastStocks(prev => prev.filter(r => r.id !== id));
  const addRecipe = (recipe: BlendRecipe) => setRecipes(prev => [...prev, recipe]);
  const updateRecipe = (recipe: BlendRecipe) => setRecipes(prev => prev.map(r => (r.id === recipe.id ? recipe : r)));
  const deleteRecipe = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id));
  const addPackagingItem = (item: PackagingItem) => setPackagingItems(prev => [...prev, item]);
  const updatePackagingItem = (item: PackagingItem) => setPackagingItems(prev => prev.map(p => (p.id === item.id ? item : p)));
  const deletePackagingItem = (id: string) => setPackagingItems(prev => prev.filter(p => p.id !== id));

  const getOnHand = (itemType: string, itemId: string) => {
      return inventoryMovements
        .filter(m => m.itemType === itemType && m.itemId === itemId && m.status === 'Active')
        .reduce((sum, m) => sum + m.qtyDelta, 0);
  };

  const voidInventoryMovementsBySource = (sourceType: string, sourceId: string) => {
      const relatedMovements = inventoryMovements.filter(m => m.sourceType === sourceType && m.sourceId === sourceId && m.status === 'Active');
      if (relatedMovements.length === 0) return;

      const correctionMovements: InventoryMovement[] = relatedMovements.map(m => ({
          id: `MOV-VOID-${m.id}-${Date.now()}`,
          date: new Date().toISOString(),
          itemType: m.itemType,
          itemId: m.itemId,
          qtyDelta: -m.qtyDelta,
          uom: m.uom,
          reason: 'Void',
          sourceType: m.sourceType,
          sourceId: m.sourceId,
          status: 'Active',
          unitCost: m.unitCost,
          totalCost: m.totalCost ? -m.totalCost : undefined
      }));
      
      setInventoryMovements(prev => [...prev, ...correctionMovements]);
  };

  const voidLedgerEntriesBySource = (sourceType: string, sourceId: string) => {
      const relatedEntries = ledgerEntries.filter(l => l.sourceType === sourceType && l.sourceId === sourceId && l.status === 'Active');
      if (relatedEntries.length === 0) return;

      const correctionEntries: LedgerEntry[] = relatedEntries.map(l => ({
          id: `LED-VOID-${l.id}-${Date.now()}`,
          date: new Date().toISOString(),
          partyId: l.partyId,
          categoryId: l.categoryId,
          direction: l.direction === 'Debit' ? 'Credit' : 'Debit',
          amount: l.amount,
          currency: l.currency,
          sourceType: l.sourceType,
          sourceId: l.sourceId,
          status: 'Active',
          note: `İPTAL KAYDI: ${l.note || ''}`
      }));

      setLedgerEntries(prev => [...prev, ...correctionEntries]);
  };

  // --- TRANSACTIONS ---

  // 1. SATIN ALMA (MALİYET HESAPLAMALI)
  const recordPurchase = (log: PurchaseLog) => {
    const logId = log.id || `PUR-${Date.now()}`;
    const date = log.date;
    const currentTransactionUnitCost = log.cost && log.quantity > 0 ? log.cost / log.quantity : 0;
    
    const newLogWithUnitCost = { ...log, id: logId, unitCost: currentTransactionUnitCost, status: 'Active' as const };
    setPurchases(prev => [newLogWithUnitCost, ...prev]);

    // Finansal Kayıt
    if (log.cost && log.cost > 0) {
      setLedgerEntries(prev => [...prev, {
        id: `LED-${Date.now()}`, date, partyId: log.supplierId, 
        categoryId: log.categoryId || (log.category === 'GreenCoffee' ? 'CAT-001' : 'CAT-002'),
        direction: 'Debit', amount: log.cost || 0, currency: 'TRY', sourceType: 'Purchase', sourceId: logId, status: 'Active',
        note: `Satın Alım: ${log.itemName}`
      }]);
    }

    // Stok Hareketi Kaydı
    setInventoryMovements(prev => [...prev, {
        id: `MOV-PUR-${logId}`, date, itemType: log.category === 'GreenCoffee' ? 'GreenCoffee' : 'Packaging', itemId: log.itemId,
        qtyDelta: log.quantity, uom: log.category === 'GreenCoffee' ? 'kg' : 'qty', reason: 'Purchase', sourceType: 'PurchaseLog', sourceId: logId,
        unitCost: currentTransactionUnitCost, totalCost: log.cost, status: 'Active'
    }]);

    // --- KRİTİK GÜNCELLEME: AĞIRLIKLI ORTALAMA MALİYET HESABI ---
    if (log.category === 'GreenCoffee') {
      setGreenCoffees(prev => prev.map(g => {
        if (g.id === log.itemId) {
            const currentStock = g.stockKg || 0;
            const currentAvgCost = g.averageCost || 0;
            
            const currentTotalValue = currentStock * currentAvgCost;
            const newPurchaseValue = log.cost || 0;
            
            const newTotalStock = currentStock + log.quantity;
            let newAvgCost = 0;
            
            // Eğer yeni stok 0'dan büyükse ortalama al, yoksa 0 (bölme hatasını önle)
            if (newTotalStock > 0) {
                newAvgCost = (currentTotalValue + newPurchaseValue) / newTotalStock;
            }

            return { 
                ...g, 
                stockKg: newTotalStock,
                averageCost: newAvgCost
            };
        }
        return g;
      }));
    } else {
      // Aynı işlemi Packaging için de yapıyoruz
      setPackagingItems(prev => prev.map(p => {
        if (p.id === log.itemId) {
            const currentStock = p.stockQuantity || 0;
            const currentAvgCost = p.averageCost || 0;

            const currentTotalValue = currentStock * currentAvgCost;
            const newPurchaseValue = log.cost || 0;

            const newTotalStock = currentStock + log.quantity;
            let newAvgCost = 0;

            if (newTotalStock > 0) {
                newAvgCost = (currentTotalValue + newPurchaseValue) / newTotalStock;
            }

            return { 
                ...p, 
                stockQuantity: newTotalStock,
                averageCost: newAvgCost
            };
        }
        return p;
      }));
    }
  };

  const voidPurchase = (id: string, reason?: string) => {
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'Voided', voidReason: reason } : p));
      voidInventoryMovementsBySource('PurchaseLog', id);
      voidLedgerEntriesBySource('PurchaseLog', id);
      // Not: İptal durumunda ortalama maliyeti geriye döndürmek matematiksel olarak çok karmaşıktır (hangi andaki maliyeti düşeceğiz?).
      // Basit sistemlerde genellikle stok düşülür ama maliyet "o anki ortalama" üzerinden devam eder veya manuel düzeltme gerekir.
      // Burada sadece miktar iadesi yapılıyor (movement void ile), maliyet averageCost olarak kalıyor.
  };

  // 2. ÜRETİM
  const recordProduction = (logData: Omit<ProductionLog, 'id' | 'status'>, packagingUsage: PackagingUsage, recipe?: BlendRecipe, singleOriginId?: string) => {
    const newLogId = `PRD-${Date.now()}`;
    const date = logData.date;
    const movements: InventoryMovement[] = [];

    let totalCoffeeCost = 0;
    
    if (recipe) {
      recipe.ingredients.forEach(ing => {
        const roast = roastStocks.find(r => r.id === ing.roastId);
        const amountUsed = logData.totalCoffeeKg * (ing.ratio / 100);
        const cost = (roast?.unitCost || 0) * amountUsed;
        totalCoffeeCost += cost;
        movements.push({
            id: `MOV-PRD-RST-${ing.roastId}-${Date.now()}`, date, itemType: 'RoastStock', itemId: ing.roastId,
            qtyDelta: -amountUsed, uom: 'kg', reason: 'Usage', sourceType: 'ProductionLog', sourceId: newLogId, unitCost: roast?.unitCost, totalCost: cost, status: 'Active'
        });
      });
      setRoastStocks(prev => {
         const next = [...prev];
         recipe.ingredients.forEach(ing => {
             const idx = next.findIndex(r => r.id === ing.roastId);
             if(idx !== -1) next[idx] = { ...next[idx], stockKg: next[idx].stockKg - (logData.totalCoffeeKg * (ing.ratio / 100)) };
         });
         return next;
      });
    } else if (singleOriginId) {
      const roast = roastStocks.find(r => r.id === singleOriginId);
      const amountUsed = logData.totalCoffeeKg;
      const cost = (roast?.unitCost || 0) * amountUsed;
      totalCoffeeCost += cost;
      movements.push({
          id: `MOV-PRD-RST-${singleOriginId}-${Date.now()}`, date, itemType: 'RoastStock', itemId: singleOriginId,
          qtyDelta: -amountUsed, uom: 'kg', reason: 'Usage', sourceType: 'ProductionLog', sourceId: newLogId, unitCost: roast?.unitCost, totalCost: cost, status: 'Active'
      });
      setRoastStocks(prev => prev.map(r => r.id === singleOriginId ? { ...r, stockKg: r.stockKg - amountUsed } : r));
    }

    let totalPackagingCost = 0;
    const processPackItem = (id: string | undefined, qty: number) => {
        if (!id || qty <= 0) return;
        const item = packagingItems.find(p => p.id === id);
        const cost = (item?.averageCost || 0) * qty;
        totalPackagingCost += cost;
        movements.push({
            id: `MOV-PRD-PKG-${id}-${Date.now()}`, date, itemType: 'Packaging', itemId: id,
            qtyDelta: -qty, uom: 'qty', reason: 'Usage', sourceType: 'ProductionLog', sourceId: newLogId, unitCost: item?.averageCost, totalCost: cost, status: 'Active'
        });
        setPackagingItems(prev => prev.map(p => p.id === id ? { ...p, stockQuantity: p.stockQuantity - qty } : p));
    };
    processPackItem(packagingUsage.bagId, logData.packCount);
    processPackItem(packagingUsage.frontLabelId, logData.packCount);
    processPackItem(packagingUsage.backLabelId, logData.packCount);
    processPackItem(packagingUsage.boxId, packagingUsage.boxCount);

    const grandTotalCost = totalCoffeeCost + totalPackagingCost;
    const unitCost = logData.packCount > 0 ? grandTotalCost / logData.packCount : 0;

    movements.push({
        id: `MOV-PRD-FIN-${newLogId}`, date, itemType: 'FinishedProduct', itemId: `${logData.brand}-${logData.productName}-${logData.packSize}`,
        qtyDelta: logData.packCount, uom: 'qty', reason: 'Production', sourceType: 'ProductionLog', sourceId: newLogId,
        unitCost: unitCost, totalCost: grandTotalCost, status: 'Active'
    });

    setInventoryMovements(prev => [...prev, ...movements]);
    setProductionLogs(prev => [{ ...logData, id: newLogId, status: 'Active', unitCost, totalCost: grandTotalCost }, ...prev]);
  };

  const voidProductionLog = (id: string, reason?: string) => {
    setProductionLogs(prev => prev.map(l => l.id === id ? { ...l, status: 'Voided', voidReason: reason || 'İptal', voidDate: new Date().toISOString() } : l));
    voidInventoryMovementsBySource('ProductionLog', id);
  };

  // 3. SEVKİYAT VE SATIŞ
  const shipOrder = (orderId: string, date: string) => { 
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const newSaleId = `SALE-${Date.now()}`;
    const newSale: Sale = {
        id: newSaleId,
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        date: date,
        items: [...order.items],
        totalAmount: order.totalAmount || 0,
        status: 'Active'
    };
    setSales(prev => [newSale, ...prev]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Shipped', shipDate: date, linkedSaleId: newSaleId } : o));

    let totalCOGS = 0;
    const movements: InventoryMovement[] = [];

    order.items.forEach((item, idx) => {
        const itemId = `${item.brand}-${item.productName}-${item.packSize}`;
        
        const productionMoves = inventoryMovements.filter(m => 
            m.itemType === 'FinishedProduct' && 
            m.itemId === itemId && 
            m.reason === 'Production' && 
            m.status === 'Active'
        );
        const totalProducedCost = productionMoves.reduce((s, m) => s + (m.totalCost || 0), 0);
        const totalProducedQty = productionMoves.reduce((s, m) => s + m.qtyDelta, 0);
        const avgUnitCost = totalProducedQty > 0 ? totalProducedCost / totalProducedQty : 0;

        const lineCost = avgUnitCost * item.quantity;
        totalCOGS += lineCost;

        movements.push({
            id: `MOV-SALE-${newSaleId}-${idx}`, date, itemType: 'FinishedProduct', itemId: itemId,
            qtyDelta: -item.quantity, uom: 'qty', reason: 'Sale', sourceType: 'Sale', sourceId: newSaleId, status: 'Active',
            unitCost: avgUnitCost, totalCost: lineCost
        });
    });
    
    setInventoryMovements(prev => [...prev, ...movements]);

    const newLedgerEntries: LedgerEntry[] = [];
    if (order.totalAmount && order.totalAmount > 0) {
      newLedgerEntries.push({
        id: `LED-SALE-${Date.now()}`, date, partyId: order.customerId, categoryId: 'CAT-003', direction: 'Credit', amount: order.totalAmount || 0,
        currency: 'TRY', sourceType: 'Sale', sourceId: newSaleId, status: 'Active', note: `Satış Geliri: #${newSaleId}`
      });
    }

    if (totalCOGS > 0) {
        newLedgerEntries.push({
            id: `LED-COGS-${Date.now()}`, date, partyId: undefined, categoryId: 'CAT-COGS', direction: 'Debit', amount: totalCOGS,
            currency: 'TRY', sourceType: 'Sale', sourceId: newSaleId, status: 'Active', note: `COGS (Maliyet): #${newSaleId}`
        });
    }

    setLedgerEntries(prev => [...prev, ...newLedgerEntries]);
  };

  const voidSale = (saleId: string, reason?: string) => {
      setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'Voided', voidReason: reason, voidDate: new Date().toISOString() } : s));
      voidInventoryMovementsBySource('Sale', saleId);
      voidLedgerEntriesBySource('Sale', saleId);
  };

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Voided', voidReason: reason, voidDate: new Date().toISOString() } : o));
  };

  // 4. ÖDEMELER
  const recordPayment = (payment: Payment) => {
    setPayments(prev => [payment, ...prev]);
    setLedgerEntries(prev => [...prev, {
      id: `LED-${Date.now()}`, date: payment.date, partyId: payment.partyId, categoryId: 'CAT-006',
      direction: payment.type === 'Inbound' ? 'Credit' : 'Debit', amount: payment.amount, currency: 'TRY',
      sourceType: 'Payment', sourceId: payment.id, status: 'Active', note: `${payment.type === 'Inbound' ? 'Tahsilat' : 'Ödeme'} (${payment.method})`
    }]);
  };

  const voidPayment = (id: string, reason?: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Voided', note: reason ? `${p.note || ''} [İptal: ${reason}]` : p.note, voidReason: reason } : p));
    voidLedgerEntriesBySource('Payment', id);
  };

  // --- OTHERS ---
  const addQuote = (quote: Quote) => setQuotes(prev => [quote, ...prev]);
  const deleteQuote = (id: string) => setQuotes(prev => prev.filter(q => q.id !== id));
  const addParty = (party: Party) => setParties(prev => [...prev, party]);
  const updateParty = (party: Party) => setParties(prev => prev.map(p => p.id === party.id ? party : p));
  const voidParty = (id: string) => setParties(prev => prev.map(p => p.id === id ? { ...p, status: 'Voided' } : p));
  const addCategory = (category: Category) => setCategories(prev => [...prev, category]);
  const voidCategory = (id: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, status: 'Voided' } : c));

  const getPartyBalance = (partyId: string) => {
    const purchases = ledgerEntries
      .filter(l => l.partyId === partyId && l.sourceType === 'Purchase' && l.status === 'Active')
      .reduce((sum, l) => sum + (l.direction === 'Debit' ? l.amount : -l.amount), 0);

    const sales = ledgerEntries
      .filter(l => l.partyId === partyId && l.sourceType === 'Sale' && l.status === 'Active')
      .reduce((sum, l) => sum + (l.direction === 'Credit' ? l.amount : -l.amount), 0);

    const netPaymentFlow = ledgerEntries
      .filter(l => l.partyId === partyId && l.sourceType === 'Payment' && l.status === 'Active')
      .reduce((sum, l) => sum + (l.direction === 'Credit' ? l.amount : -l.amount), 0);

    const party = parties.find(p => p.id === partyId);
    
    if (party?.type === 'Supplier') {
        return purchases + netPaymentFlow;
    } else if (party?.type === 'Customer') {
        return sales - netPaymentFlow;
    } else {
        return (sales - purchases) - netPaymentFlow;
    }
  };

  // --- DATA MANAGEMENT ---
  
  const importSystemData = (data: any) => {
      try {
          if(data.greenCoffees) setGreenCoffees(data.greenCoffees);
          if(data.roastStocks) setRoastStocks(data.roastStocks);
          if(data.recipes) setRecipes(data.recipes);
          if(data.packagingItems) setPackagingItems(data.packagingItems);
          if(data.productionLogs) setProductionLogs(data.productionLogs);
          if(data.orders) setOrders(data.orders);
          if(data.sales) setSales(data.sales);
          if(data.quotes) setQuotes(data.quotes);
          if(data.purchases) setPurchases(data.purchases);
          if(data.settings) setSettings(data.settings);
          if(data.parties) setParties(data.parties);
          if(data.categories) setCategories(data.categories);
          if(data.ledgerEntries) setLedgerEntries(data.ledgerEntries);
          if(data.payments) setPayments(data.payments);
          if(data.inventoryMovements) setInventoryMovements(data.inventoryMovements);
          alert('Sistem verileri başarıyla yüklendi.');
      } catch (error) {
          alert('Veri yükleme hatası: Dosya bozuk veya uyumsuz.');
          console.error(error);
      }
  };

const resetSystem = () => {
    setGreenCoffees([]);
    setRoastStocks([]);
    setRecipes([]);
    setPackagingItems([]);
    setProductionLogs([]);
    setOrders([]);
    setSales([]);
    setQuotes([]);
    setPurchases([]);
    setParties([]);
    setCategories(DEFAULT_CATEGORIES);
    setLedgerEntries([]);
    setPayments([]);
    setInventoryMovements([]);
    
    if (typeof window !== 'undefined') {
        localStorage.removeItem('greenCoffees');
        localStorage.removeItem('roastStocks');
        localStorage.removeItem('recipes');
        localStorage.removeItem('packagingItems');
        localStorage.removeItem('productionLogs');
        localStorage.removeItem('orders');
        localStorage.removeItem('sales');
        localStorage.removeItem('quotes');
        localStorage.removeItem('purchases');
        localStorage.removeItem('parties');
        localStorage.removeItem('ledgerEntries');
        localStorage.removeItem('payments');
        localStorage.removeItem('inventoryMovements');
    }
};

  return (
    <StoreContext.Provider
      value={{
        greenCoffees, roastStocks, recipes, productionLogs, packagingItems, orders, sales, quotes, purchases, settings,
        parties, categories, ledgerEntries, payments,
        inventoryMovements,
        addGreenCoffee, updateGreenCoffee, deleteGreenCoffee,
        addRoastAndDeductGreen, updateRoastStock, deleteRoastStock,
        addRecipe, updateRecipe, deleteRecipe,
        addPackagingItem, updatePackagingItem, deletePackagingItem,
        
        recordProduction, voidProductionLog,
        addOrder, shipOrder, cancelOrder, voidSale,
        addQuote, deleteQuote,
        recordPurchase, voidPurchase,
        updateSettings,
        addParty, updateParty, voidParty,
        addCategory, voidCategory,
        recordPayment, voidPayment,
        
        getPartyBalance,
        getOnHand,
        importSystemData,
        resetSystem
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