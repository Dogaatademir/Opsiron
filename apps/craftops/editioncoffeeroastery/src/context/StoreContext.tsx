import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from './supabase';
import emailjs from '@emailjs/browser';

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
  status: 'Active' | 'Voided';
  voidReason?: string;
  voidDate?: string;
  date: string;
  productName: string;
  brand: 'Edition' | 'Hisaraltı';
  packSize: 250 | 1000;
  packCount: number;
  totalCoffeeKg: number;
  unitCost?: number;
  totalCost?: number;
}

export interface OrderItem {
  sku: string;
  productName: string;
  brand: string;
  packSize: number;
  quantity: number;
}

export interface Quote {
  id: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalOfferAmount: number;
  estimatedCost: number;
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
  exchangeRates: { usd: number; eur: number }; // YENİ: Döviz Kurları
  targetEmail?: string;
  enableWeeklyReport: boolean;
  lastReportDate?: string;
}

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

type PackagingUsage = {
  bagId: string;
  frontLabelId?: string;
  backLabelId?: string;
  boxId?: string;
  boxCount: number;
};

// --- SYSTEM DEFAULTS ---

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'Edition Coffee Roastery',
  currency: 'TRY',
  targetEmail: 'info@editioncoffee.com',
  enableWeeklyReport: false,
  lastReportDate: '',
  exchangeRates: { usd: 35.0, eur: 38.0 }, // YENİ: Varsayılan Kurlar
  thresholds: {
    greenCoffee: { critical: 50, low: 100 },
    roastStock: { critical: 10, low: 20 },
    bag: { critical: 100, low: 300 },
    label: { critical: 200, low: 500 },
    box: { critical: 50, low: 100 },
    finishedProduct: { critical: 20, low: 50 },
  },
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

  recordProduction: (
    logData: Omit<ProductionLog, 'id' | 'status'>,
    packagingUsage: PackagingUsage,
    recipe?: BlendRecipe,
    singleOriginId?: string
  ) => void;
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

  importSystemData: (data: any) => Promise<void>;
  resetSystem: () => Promise<void>;
  generateTextReport: () => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // localStorage ile çalışan helper
  const usePersistedState = <T,>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      if (typeof window === 'undefined') return initial;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    });

    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(state));
      }
    }, [key, state]);

    return [state, setState];
  };

  // --- INITIALIZATION (LOCAL STATE) ---
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
  const [inventoryMovements, setInventoryMovements] =
    usePersistedState<InventoryMovement[]>('inventoryMovements', []);

  const isSupabaseReadyRef = useRef(false);

  // --- Supabase HELPER Functions ---
  const sbInsert = async (table: string, data: any) => {
    if (!isSupabaseReadyRef.current) return;
    supabase.from(table).insert(data).then(({ error }) => {
      if (error) console.error(`Insert Error (${table}):`, error);
    });
  };

  const sbUpdate = async (table: string, id: string, data: any) => {
    if (!isSupabaseReadyRef.current) return;
    supabase.from(table).update(data).eq('id', id).then(({ error }) => {
      if (error) console.error(`Update Error (${table}):`, error);
    });
  };

  const sbDelete = async (table: string, id: string) => {
    if (!isSupabaseReadyRef.current) return;
    supabase.from(table).delete().eq('id', id).then(({ error }) => {
      if (error) console.error(`Delete Error (${table}):`, error);
    });
  };

  // --- INITIAL LOAD FROM SUPABASE ---
  useEffect(() => {
    const fetchAllFromSupabase = async () => {
      try {
        const { data: gc } = await supabase.from('green_coffees').select('*');
        if (gc) setGreenCoffees(gc as GreenCoffee[]);

        const { data: rs } = await supabase.from('roast_stocks').select('*');
        if (rs) setRoastStocks(rs as RoastStock[]);

        const { data: rcps } = await supabase.from('blend_recipes').select('*');
        if (rcps) setRecipes(rcps as BlendRecipe[]);

        const { data: pkgs } = await supabase.from('packaging_items').select('*');
        if (pkgs) setPackagingItems(pkgs as PackagingItem[]);

        const { data: prods } = await supabase.from('production_logs').select('*');
        if (prods) setProductionLogs(prods as ProductionLog[]);

        const { data: ords } = await supabase.from('orders').select('*');
        if (ords) setOrders(ords as Order[]);

        const { data: sls } = await supabase.from('sales').select('*');
        if (sls) setSales(sls as Sale[]);

        const { data: qts } = await supabase.from('quotes').select('*');
        if (qts) setQuotes(qts as Quote[]);

        const { data: pchs } = await supabase.from('purchases').select('*');
        if (pchs) setPurchases(pchs as PurchaseLog[]);

        const { data: prts } = await supabase.from('parties').select('*');
        if (prts) setParties(prts as Party[]);

        const { data: cats } = await supabase.from('categories').select('*');
        if (cats && cats.length > 0) setCategories(cats as Category[]);

        const { data: leds } = await supabase.from('ledger_entries').select('*');
        if (leds) setLedgerEntries(leds as LedgerEntry[]);

        const { data: pays } = await supabase.from('payments').select('*');
        if (pays) setPayments(pays as Payment[]);

        const { data: invs } = await supabase.from('inventory_movements').select('*');
        if (invs) setInventoryMovements(invs as InventoryMovement[]);

        const { data: settingsRow } = await supabase
          .from('system_settings')
          .select('value')
          .eq('id', 'default')
          .maybeSingle();
        if (settingsRow && settingsRow.value) {
          // Merge with default to ensure new fields like exchangeRates exist
          setSettings({ ...DEFAULT_SETTINGS, ...settingsRow.value });
        }

        isSupabaseReadyRef.current = true;
      } catch (error:any) {
        console.error('Supabase initial fetch error', error);
        isSupabaseReadyRef.current = true;
      }
    };

    fetchAllFromSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- REPORTING HELPERS ---
  const getPartyBalance = (partyId: string) => {
    const purchasesSum = ledgerEntries
      .filter((l) => l.partyId === partyId && l.sourceType === 'Purchase' && l.status === 'Active')
      .reduce((sum, l) => sum + (l.direction === 'Debit' ? l.amount : -l.amount), 0);

    const salesSum = ledgerEntries
      .filter((l) => l.partyId === partyId && l.sourceType === 'Sale' && l.status === 'Active')
      .reduce((sum, l) => sum + (l.direction === 'Credit' ? l.amount : -l.amount), 0);

    const netPaymentFlow = ledgerEntries
      .filter((l) => l.partyId === partyId && l.sourceType === 'Payment' && l.status === 'Active')
      .reduce((sum, l) => sum + (l.direction === 'Credit' ? l.amount : -l.amount), 0);

    const party = parties.find((p) => p.id === partyId);

    if (party?.type === 'Supplier') {
      return purchasesSum + netPaymentFlow;
    } else if (party?.type === 'Customer') {
      return salesSum - netPaymentFlow;
    } else {
      return (salesSum - purchasesSum) - netPaymentFlow;
    }
  };

  const generateTextReport = () => {
    const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const line = "------------------------------------------------------------------------------------------\n";
    const doubleLine = "==========================================================================================\n";
    const pad = (str: string, length: number) => (str || "").toString().padEnd(length).slice(0, length);

    const activeSales = sales.filter(s => s.status === 'Active');
    const totalRevenue = activeSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const activePayments = payments.filter(p => p.status === 'Active' && p.type === 'Inbound');
    const totalCollections = activePayments.reduce((sum, p) => sum + p.amount, 0);

    let content = "";
    content += doubleLine;
    content += ` ${settings.companyName.toUpperCase()} - OTOMATİK SİSTEM RAPORU\n`;
    content += ` Tarih: ${today}\n`;
    content += doubleLine + "\n";
    content += "[1] FİNANSAL GENEL DURUM\n" + line;
    content += `${pad("Toplam Satış Cirosu", 30)}: ${totalRevenue.toLocaleString('tr-TR')} ${settings.currency}\n`;
    content += `${pad("Toplam Tahsilat", 30)}: ${totalCollections.toLocaleString('tr-TR')} ${settings.currency}\n`;
    content += `${pad("Aktif Sipariş Sayısı", 30)}: ${orders.filter(o => o.status === 'Pending').length} Adet\n\n`;

    content += "[2] YEŞİL ÇEKİRDEK STOĞU\n" + line;
    content += `${pad("ÜRÜN ADI", 30)} | ${pad("MENŞEİ", 15)} | ${pad("STOK (KG)", 10)}\n` + line;
    greenCoffees.forEach(g => { 
      content += `${pad(g.name, 30)} | ${pad(g.origin, 15)} | ${pad(g.stockKg.toFixed(2) + " kg", 10)}\n`; 
    });

    content += "\n[3] KAVRULMUŞ KAHVE STOĞU\n" + line;
    content += `${pad("ÜRÜN ADI", 30)} | ${pad("PROFİL", 20)} | ${pad("STOK (KG)", 10)}\n` + line;
    roastStocks.forEach(r => { 
      content += `${pad(r.name, 30)} | ${pad(r.roastLevel, 20)} | ${pad(r.stockKg.toFixed(2) + " kg", 10)}\n`; 
    });

    content += "\n[4] KRİTİK AMBALAJ DURUMU\n" + line;
    packagingItems.forEach(p => { 
      if (p.stockQuantity <= p.minThreshold) {
        content += `${pad(p.name, 35)} | ${pad(p.stockQuantity + " ad", 10)} [DÜŞÜK STOK]\n`; 
      }
    });
    
    return content;
  };

  // --- AUTOMATED WEEKLY REPORT LOGIC (STRICT LOCK) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndSendReport = async () => {
      if (!settings.enableWeeklyReport || !settings.targetEmail) return;

      const now = new Date();
      const currentDay = now.getDay(); // 0: Pazar, 1: Pazartesi
      const currentHour = now.getHours();
      const todayStr = now.toDateString();
      
      // 1. GÜN VE SAAT KONTROLÜ
      if (currentDay !== 1) return; // Pazartesi değilse çık
      if (currentHour < 9) return;  // Saat 09:00 öncesiyse çık

      // 2. VERİTABANI KONTROLÜ (Daha önce atıldıysa çık)
      if (settings.lastReportDate === todayStr) return;

      // 3. TARAYICI KİLİDİ (Browser Lock Mechanism)
      const lockKey = `REPORT_SENT_LOCK_${todayStr.replace(/\s/g, '_')}`;
      if (localStorage.getItem(lockKey)) {
        return;
      }

      console.log("Otomatik Pazartesi Raporu Başlatılıyor...");
      localStorage.setItem(lockKey, 'true');

      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

        if (!serviceId || !templateId || !publicKey) {
             throw new Error("EmailJS anahtarları eksik");
        }

        const reportText = generateTextReport();
        const fullData = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            settings,
            greenCoffees, roastStocks, packagingItems, recipes, productionLogs, 
            orders, sales, quotes, purchases, parties, categories, ledgerEntries, payments, inventoryMovements
        };
        const jsonString = JSON.stringify(fullData, null, 2);
        
        const templateParams = {
          to_email: settings.targetEmail,
          company_name: settings.companyName,
          report_content: reportText,
          date_time: new Date().toLocaleString('tr-TR'),
          subject: `[OTOMATİK] ${settings.companyName} Haftalık Sistem Raporu & Yedek`,
          my_file: {
              name: `Backup_${todayStr}.json`,
              data: btoa(unescape(encodeURIComponent(jsonString)))
          }
        };

        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        console.log("Otomatik rapor başarıyla gönderildi.");

        const newSettings = { ...settings, lastReportDate: todayStr };
        setSettings(newSettings);
        
        if (isSupabaseReadyRef.current) {
            supabase.from('system_settings').upsert({
              id: 'default',
              value: newSettings,
              updated_at: new Date().toISOString(),
            }).then();
        }

      } catch (error:any) {
        console.error("Otomatik rapor gönderme hatası:", error);
        localStorage.removeItem(lockKey);
      }
    };

    checkAndSendReport();
    const intervalId = setInterval(checkAndSendReport, 60000);
    return () => clearInterval(intervalId);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enableWeeklyReport, settings.lastReportDate, settings.targetEmail]); 

  // --- ACTIONS (Optimized: Direct Supabase Calls) ---

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    if (isSupabaseReadyRef.current) {
      supabase.from('system_settings').upsert({
        id: 'default',
        value: newSettings,
        updated_at: new Date().toISOString(),
      }).then();
    }
  };

  const addGreenCoffee = (coffee: GreenCoffee) => {
    setGreenCoffees((prev) => [...prev, coffee]);
    sbInsert('green_coffees', coffee);
  };

  const updateGreenCoffee = (coffee: GreenCoffee) => {
    setGreenCoffees((prev) => prev.map((c) => (c.id === coffee.id ? coffee : c)));
    sbUpdate('green_coffees', coffee.id, coffee);
  };

  const deleteGreenCoffee = (id: string) => {
    setGreenCoffees((prev) => prev.filter((c) => c.id !== id));
    sbDelete('green_coffees', id);
  };

  const addRoastAndDeductGreen = (roast: RoastStock, greenId: string, deductedGreenKg: number) => {
    const green = greenCoffees.find((g) => g.id === greenId);
    if (!green) return;
    if (green.stockKg < deductedGreenKg) {
      alert(`Yetersiz yeşil çekirdek.`);
      return;
    }

    const totalInputCost = (green.averageCost || 0) * deductedGreenKg;
    const calculatedRoastUnitCost = roast.stockKg > 0 ? totalInputCost / roast.stockKg : 0;
    const roastWithCost = { ...roast, unitCost: calculatedRoastUnitCost };

    const updatedGreen = { ...green, stockKg: green.stockKg - deductedGreenKg };
    setGreenCoffees((prev) => prev.map((g) => (g.id === greenId ? updatedGreen : g)));
    setRoastStocks((prev) => [...prev, roastWithCost]);

    const greenMove: InventoryMovement = {
      id: `MOV-ROAST-${Date.now()}`,
      date: new Date().toISOString(),
      itemType: 'GreenCoffee',
      itemId: greenId,
      qtyDelta: -deductedGreenKg,
      uom: 'kg',
      reason: 'Usage',
      sourceType: 'Manual',
      sourceId: roast.id,
      status: 'Active',
    };
    setInventoryMovements((prev) => [...prev, greenMove]);

    sbUpdate('green_coffees', greenId, updatedGreen);
    sbInsert('roast_stocks', roastWithCost);
    sbInsert('inventory_movements', greenMove);
  };

  const updateRoastStock = (roast: RoastStock) => {
    setRoastStocks((prev) => prev.map((r) => (r.id === roast.id ? roast : r)));
    sbUpdate('roast_stocks', roast.id, roast);
  };

  const deleteRoastStock = (id: string) => {
    setRoastStocks((prev) => prev.filter((r) => r.id !== id));
    sbDelete('roast_stocks', id);
  };

  const addRecipe = (recipe: BlendRecipe) => {
    setRecipes((prev) => [...prev, recipe]);
    sbInsert('blend_recipes', recipe);
  };

  const updateRecipe = (recipe: BlendRecipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? recipe : r)));
    sbUpdate('blend_recipes', recipe.id, recipe);
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    sbDelete('blend_recipes', id);
  };

  const addPackagingItem = (item: PackagingItem) => {
    setPackagingItems((prev) => [...prev, item]);
    sbInsert('packaging_items', item);
  };

  const updatePackagingItem = (item: PackagingItem) => {
    setPackagingItems((prev) => prev.map((p) => (p.id === item.id ? item : p)));
    sbUpdate('packaging_items', item.id, item);
  };

  const deletePackagingItem = (id: string) => {
    setPackagingItems((prev) => prev.filter((p) => p.id !== id));
    sbDelete('packaging_items', id);
  };

  const getOnHand = (itemType: string, itemId: string) => {
    return inventoryMovements
      .filter((m) => m.itemType === itemType && m.itemId === itemId && m.status === 'Active')
      .reduce((sum, m) => sum + m.qtyDelta, 0);
  };

  const voidInventoryMovementsBySource = (sourceType: string, sourceId: string) => {
    const relatedMovements = inventoryMovements.filter(
      (m) => m.sourceType === sourceType && m.sourceId === sourceId && m.status === 'Active'
    );
    if (relatedMovements.length === 0) return;

    const correctionMovements: InventoryMovement[] = relatedMovements.map((m) => ({
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
      totalCost: m.totalCost ? -m.totalCost : undefined,
    }));

    setInventoryMovements((prev) => [...prev, ...correctionMovements]);
    if(isSupabaseReadyRef.current) supabase.from('inventory_movements').insert(correctionMovements).then();
  };

  const voidLedgerEntriesBySource = (sourceType: string, sourceId: string) => {
    const relatedEntries = ledgerEntries.filter(
      (l) => l.sourceType === sourceType && l.sourceId === sourceId && l.status === 'Active'
    );
    if (relatedEntries.length === 0) return;

    const correctionEntries: LedgerEntry[] = relatedEntries.map((l) => ({
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
      note: `İPTAL KAYDI: ${l.note || ''}`,
    }));

    setLedgerEntries((prev) => [...prev, ...correctionEntries]);
    if(isSupabaseReadyRef.current) supabase.from('ledger_entries').insert(correctionEntries).then();
  };

  // --- TRANSACTIONS ---

  const recordPurchase = (log: PurchaseLog) => {
    const logId = log.id || `PUR-${Date.now()}`;
    const date = log.date;
    const currentTransactionUnitCost =
      log.cost && log.quantity > 0 ? (log.cost as number) / log.quantity : 0;

    const newLogWithUnitCost: PurchaseLog = {
      ...log,
      id: logId,
      unitCost: currentTransactionUnitCost,
      status: 'Active',
    };
    
    setPurchases((prev) => [newLogWithUnitCost, ...prev]);
    sbInsert('purchases', newLogWithUnitCost);

    if (log.cost && log.cost > 0) {
      const entry: LedgerEntry = {
        id: `LED-${Date.now()}`,
        date,
        partyId: log.supplierId,
        categoryId: log.categoryId || (log.category === 'GreenCoffee' ? 'CAT-001' : 'CAT-002'),
        direction: 'Debit',
        amount: log.cost || 0,
        currency: 'TRY',
        sourceType: 'Purchase',
        sourceId: logId,
        status: 'Active',
        note: `Satın Alım: ${log.itemName}`,
      };
      setLedgerEntries((prev) => [...prev, entry]);
      sbInsert('ledger_entries', entry);
    }

    const move: InventoryMovement = {
      id: `MOV-PUR-${logId}`,
      date,
      itemType: log.category === 'GreenCoffee' ? 'GreenCoffee' : 'Packaging',
      itemId: log.itemId,
      qtyDelta: log.quantity,
      uom: log.category === 'GreenCoffee' ? 'kg' : 'qty',
      reason: 'Purchase',
      sourceType: 'PurchaseLog',
      sourceId: logId,
      unitCost: currentTransactionUnitCost,
      totalCost: log.cost,
      status: 'Active',
    };
    setInventoryMovements((prev) => [...prev, move]);
    sbInsert('inventory_movements', move);

    if (log.category === 'GreenCoffee') {
      const target = greenCoffees.find(g => g.id === log.itemId);
      if(target) {
        const currentStock = target.stockKg || 0;
        const currentAvgCost = target.averageCost || 0;
        const currentTotalValue = currentStock * currentAvgCost;
        const newPurchaseValue = log.cost || 0;
        const newTotalStock = currentStock + log.quantity;
        let newAvgCost = 0;
        if (newTotalStock > 0) {
           newAvgCost = (currentTotalValue + newPurchaseValue) / newTotalStock;
        }
        const updatedTarget = { ...target, stockKg: newTotalStock, averageCost: newAvgCost };
        setGreenCoffees((prev) => prev.map((g) => (g.id === log.itemId ? updatedTarget : g)));
        sbUpdate('green_coffees', target.id, updatedTarget);
      }
    } else {
      const target = packagingItems.find(p => p.id === log.itemId);
      if(target) {
        const currentStock = target.stockQuantity || 0;
        const currentAvgCost = target.averageCost || 0;
        const currentTotalValue = currentStock * currentAvgCost;
        const newPurchaseValue = log.cost || 0;
        const newTotalStock = currentStock + log.quantity;
        let newAvgCost = 0;
        if (newTotalStock > 0) {
          newAvgCost = (currentTotalValue + newPurchaseValue) / newTotalStock;
        }
        const updatedTarget = { ...target, stockQuantity: newTotalStock, averageCost: newAvgCost };
        setPackagingItems((prev) => prev.map((p) => (p.id === log.itemId ? updatedTarget : p)));
        sbUpdate('packaging_items', target.id, updatedTarget);
      }
    }
  };

  const voidPurchase = (id: string, reason?: string) => {
    const updated = { status: 'Voided' as const, voidReason: reason };
    setPurchases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    sbUpdate('purchases', id, updated);
    voidInventoryMovementsBySource('PurchaseLog', id);
    voidLedgerEntriesBySource('PurchaseLog', id);
  };

  const recordProduction = (
    logData: Omit<ProductionLog, 'id' | 'status'>,
    packagingUsage: PackagingUsage,
    recipe?: BlendRecipe,
    singleOriginId?: string
  ) => {
    const newLogId = `PRD-${Date.now()}`;
    const date = logData.date;
    const movements: InventoryMovement[] = [];

    let totalCoffeeCost = 0;

    if (recipe) {
      recipe.ingredients.forEach((ing) => {
        const roast = roastStocks.find((r) => r.id === ing.roastId);
        const amountUsed = logData.totalCoffeeKg * (ing.ratio / 100);
        const cost = (roast?.unitCost || 0) * amountUsed;
        totalCoffeeCost += cost;
        movements.push({
          id: `MOV-PRD-RST-${ing.roastId}-${Date.now()}`,
          date,
          itemType: 'RoastStock',
          itemId: ing.roastId,
          qtyDelta: -amountUsed,
          uom: 'kg',
          reason: 'Usage',
          sourceType: 'ProductionLog',
          sourceId: newLogId,
          unitCost: roast?.unitCost,
          totalCost: cost,
          status: 'Active',
        });
      });
      
      setRoastStocks((prev) => {
        const next = [...prev];
        recipe.ingredients.forEach((ing) => {
          const idx = next.findIndex((r) => r.id === ing.roastId);
          if (idx !== -1) {
            const newStock = next[idx].stockKg - logData.totalCoffeeKg * (ing.ratio / 100);
            next[idx] = { ...next[idx], stockKg: newStock };
            sbUpdate('roast_stocks', next[idx].id, { stockKg: newStock });
          }
        });
        return next;
      });
    } else if (singleOriginId) {
      const roast = roastStocks.find((r) => r.id === singleOriginId);
      const amountUsed = logData.totalCoffeeKg;
      const cost = (roast?.unitCost || 0) * amountUsed;
      totalCoffeeCost += cost;
      movements.push({
        id: `MOV-PRD-RST-${singleOriginId}-${Date.now()}`,
        date,
        itemType: 'RoastStock',
        itemId: singleOriginId,
        qtyDelta: -amountUsed,
        uom: 'kg',
        reason: 'Usage',
        sourceType: 'ProductionLog',
        sourceId: newLogId,
        unitCost: roast?.unitCost,
        totalCost: cost,
        status: 'Active',
      });
      if(roast) {
        const newStock = roast.stockKg - amountUsed;
        setRoastStocks(prev => prev.map(r => r.id === singleOriginId ? { ...r, stockKg: newStock} : r));
        sbUpdate('roast_stocks', singleOriginId, { stockKg: newStock });
      }
    }

    let totalPackagingCost = 0;
    const processPackItem = (id: string | undefined, qty: number) => {
      if (!id || qty <= 0) return;
      const item = packagingItems.find((p) => p.id === id);
      const cost = (item?.averageCost || 0) * qty;
      totalPackagingCost += cost;
      movements.push({
        id: `MOV-PRD-PKG-${id}-${Date.now()}`,
        date,
        itemType: 'Packaging',
        itemId: id,
        qtyDelta: -qty,
        uom: 'qty',
        reason: 'Usage',
        sourceType: 'ProductionLog',
        sourceId: newLogId,
        unitCost: item?.averageCost,
        totalCost: cost,
        status: 'Active',
      });
      
      if(item) {
        const newStock = item.stockQuantity - qty;
        setPackagingItems(prev => prev.map(p => p.id === id ? { ...p, stockQuantity: newStock } : p));
        sbUpdate('packaging_items', id, { stockQuantity: newStock });
      }
    };

    processPackItem(packagingUsage.bagId, logData.packCount);
    processPackItem(packagingUsage.frontLabelId, logData.packCount);
    processPackItem(packagingUsage.backLabelId, logData.packCount);
    processPackItem(packagingUsage.boxId, packagingUsage.boxCount);

    const grandTotalCost = totalCoffeeCost + totalPackagingCost;
    const unitCost = logData.packCount > 0 ? grandTotalCost / logData.packCount : 0;

    movements.push({
      id: `MOV-PRD-FIN-${newLogId}`,
      date,
      itemType: 'FinishedProduct',
      itemId: `${logData.brand}-${logData.productName}-${logData.packSize}`,
      qtyDelta: logData.packCount,
      uom: 'qty',
      reason: 'Production',
      sourceType: 'ProductionLog',
      sourceId: newLogId,
      unitCost,
      totalCost: grandTotalCost,
      status: 'Active',
    });

    setInventoryMovements((prev) => [...prev, ...movements]);
    if(isSupabaseReadyRef.current) supabase.from('inventory_movements').insert(movements).then();

    const newLog = { ...logData, id: newLogId, status: 'Active' as const, unitCost, totalCost: grandTotalCost };
    setProductionLogs((prev) => [newLog, ...prev]);
    sbInsert('production_logs', newLog);
  };

  const voidProductionLog = (id: string, reason?: string) => {
    const updated = { status: 'Voided' as const, voidReason: reason || 'İptal', voidDate: new Date().toISOString() };
    setProductionLogs((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...updated }
          : l
      )
    );
    sbUpdate('production_logs', id, updated);
    voidInventoryMovementsBySource('ProductionLog', id);
  };

  const shipOrder = (orderId: string, date: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newSaleId = `SALE-${Date.now()}`;
    const newSale: Sale = {
      id: newSaleId,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      date,
      items: [...order.items],
      totalAmount: order.totalAmount || 0,
      status: 'Active',
    };

    setSales((prev) => [newSale, ...prev]);
    sbInsert('sales', newSale);

    const updatedOrder = { status: 'Shipped' as const, shipDate: date, linkedSaleId: newSaleId };
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, ...updatedOrder } : o
      )
    );
    sbUpdate('orders', orderId, updatedOrder);

    let totalCOGS = 0;
    const movements: InventoryMovement[] = [];

    order.items.forEach((item, idx) => {
      const itemId = `${item.brand}-${item.productName}-${item.packSize}`;

      const productionMoves = inventoryMovements.filter(
        (m) =>
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
        id: `MOV-SALE-${newSaleId}-${idx}`,
        date,
        itemType: 'FinishedProduct',
        itemId,
        qtyDelta: -item.quantity,
        uom: 'qty',
        reason: 'Sale',
        sourceType: 'Sale',
        sourceId: newSaleId,
        status: 'Active',
        unitCost: avgUnitCost,
        totalCost: lineCost,
      });
    });

    setInventoryMovements((prev) => [...prev, ...movements]);
    if(isSupabaseReadyRef.current) supabase.from('inventory_movements').insert(movements).then();

    const newLedgerEntries: LedgerEntry[] = [];
    if (order.totalAmount && order.totalAmount > 0) {
      newLedgerEntries.push({
        id: `LED-SALE-${Date.now()}`,
        date,
        partyId: order.customerId,
        categoryId: 'CAT-003',
        direction: 'Credit',
        amount: order.totalAmount || 0,
        currency: 'TRY',
        sourceType: 'Sale',
        sourceId: newSaleId,
        status: 'Active',
        note: `Satış Geliri: #${newSaleId}`,
      });
    }

    if (totalCOGS > 0) {
      newLedgerEntries.push({
        id: `LED-COGS-${Date.now()}`,
        date,
        partyId: undefined,
        categoryId: 'CAT-COGS',
        direction: 'Debit',
        amount: totalCOGS,
        currency: 'TRY',
        sourceType: 'Sale',
        sourceId: newSaleId,
        status: 'Active',
        note: `COGS (Maliyet): #${newSaleId}`,
      });
    }

    setLedgerEntries((prev) => [...prev, ...newLedgerEntries]);
    if(isSupabaseReadyRef.current) supabase.from('ledger_entries').insert(newLedgerEntries).then();
  };

  const voidSale = (saleId: string, reason?: string) => {
    const updated = { status: 'Voided' as const, voidReason: reason, voidDate: new Date().toISOString() };
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId ? { ...s, ...updated } : s
      )
    );
    sbUpdate('sales', saleId, updated);
    voidInventoryMovementsBySource('Sale', saleId);
    voidLedgerEntriesBySource('Sale', saleId);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    sbInsert('orders', order);
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const updated = { status: 'Voided' as const, voidReason: reason, voidDate: new Date().toISOString() };
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, ...updated } : o
      )
    );
    sbUpdate('orders', orderId, updated);
  };

  const recordPayment = (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
    sbInsert('payments', payment);
    
    const entry: LedgerEntry = {
      id: `LED-${Date.now()}`,
      date: payment.date,
      partyId: payment.partyId,
      categoryId: 'CAT-006',
      direction: payment.type === 'Inbound' ? 'Credit' : 'Debit',
      amount: payment.amount,
      currency: 'TRY',
      sourceType: 'Payment',
      sourceId: payment.id,
      status: 'Active',
      note: `${payment.type === 'Inbound' ? 'Tahsilat' : 'Ödeme'} (${payment.method})`,
    };
    setLedgerEntries((prev) => [...prev, entry]);
    sbInsert('ledger_entries', entry);
  };

  const voidPayment = (id: string, reason?: string) => {
    const target = payments.find(p => p.id === id);
    if(target) {
        const updated = {
            status: 'Voided' as const,
            note: reason ? `${target.note || ''} [İptal: ${reason}]` : target.note,
            voidReason: reason,
        };
        setPayments((prev) => prev.map((p) => p.id === id ? { ...p, ...updated } : p));
        sbUpdate('payments', id, updated);
        voidLedgerEntriesBySource('Payment', id);
    }
  };

  const addQuote = (quote: Quote) => {
    setQuotes((prev) => [quote, ...prev]);
    sbInsert('quotes', quote);
  };

  const deleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    sbDelete('quotes', id);
  };

  const addParty = (party: Party) => {
    setParties((prev) => [...prev, party]);
    sbInsert('parties', party);
  };

  const updateParty = (party: Party) => {
    setParties((prev) => prev.map((p) => (p.id === party.id ? party : p)));
    sbUpdate('parties', party.id, party);
  };

  const voidParty = (id: string) => {
    const updated = { status: 'Voided' as const };
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    sbUpdate('parties', id, updated);
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
    sbInsert('categories', category);
  };

  const voidCategory = (id: string) => {
    const updated = { status: 'Voided' as const };
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    sbUpdate('categories', id, updated);
  };

  const importSystemData = async (data: any) => {
    try {
        await resetSystem();

        if (data.greenCoffees) setGreenCoffees(data.greenCoffees);
        if (data.roastStocks) setRoastStocks(data.roastStocks);
        if (data.recipes) setRecipes(data.recipes);
        if (data.packagingItems) setPackagingItems(data.packagingItems);
        if (data.productionLogs) setProductionLogs(data.productionLogs);
        if (data.orders) setOrders(data.orders);
        if (data.sales) setSales(data.sales);
        if (data.quotes) setQuotes(data.quotes);
        if (data.purchases) setPurchases(data.purchases);
        if (data.settings) setSettings(data.settings);
        if (data.parties) setParties(data.parties);
        if (data.categories) setCategories(data.categories);
        if (data.ledgerEntries) setLedgerEntries(data.ledgerEntries);
        if (data.payments) setPayments(data.payments);
        if (data.inventoryMovements) setInventoryMovements(data.inventoryMovements);

        if(isSupabaseReadyRef.current) {
            if(data.parties?.length) await supabase.from('parties').insert(data.parties);
            if(data.categories?.length) await supabase.from('categories').insert(data.categories);
            if(data.settings) await supabase.from('system_settings').upsert({ id: 'default', value: data.settings });
            if(data.greenCoffees?.length) await supabase.from('green_coffees').insert(data.greenCoffees);
            if(data.roastStocks?.length) await supabase.from('roast_stocks').insert(data.roastStocks);
            if(data.packagingItems?.length) await supabase.from('packaging_items').insert(data.packagingItems);
            if(data.recipes?.length) await supabase.from('blend_recipes').insert(data.recipes);
            if(data.orders?.length) await supabase.from('orders').insert(data.orders);
            if(data.purchases?.length) await supabase.from('purchases').insert(data.purchases);
            if(data.productionLogs?.length) await supabase.from('production_logs').insert(data.productionLogs);
            if(data.sales?.length) await supabase.from('sales').insert(data.sales);
            if(data.quotes?.length) await supabase.from('quotes').insert(data.quotes);
            if(data.payments?.length) await supabase.from('payments').insert(data.payments);
            if(data.inventoryMovements?.length) await supabase.from('inventory_movements').insert(data.inventoryMovements);
            if(data.ledgerEntries?.length) await supabase.from('ledger_entries').insert(data.ledgerEntries);
        }

    } catch (error:any) {
        console.error("Import Error:", error);
        throw new Error('Veri yükleme sırasında veritabanı hatası oluştu.');
    }
  };

  const resetSystem = async () => {
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
    setSettings(DEFAULT_SETTINGS);

    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    if(isSupabaseReadyRef.current) {
        try {
            await supabase.from('inventory_movements').delete().neq('id', '0');
            await supabase.from('ledger_entries').delete().neq('id', '0');
            await supabase.from('sales').delete().neq('id', '0');
            await supabase.from('purchases').delete().neq('id', '0');
            await supabase.from('production_logs').delete().neq('id', '0');
            await supabase.from('quotes').delete().neq('id', '0');
            await supabase.from('orders').delete().neq('id', '0');
            await supabase.from('blend_recipes').delete().neq('id', '0'); 
            await supabase.from('green_coffees').delete().neq('id', '0');
            await supabase.from('roast_stocks').delete().neq('id', '0');
            await supabase.from('packaging_items').delete().neq('id', '0');
            await supabase.from('payments').delete().neq('id', '0');
            await supabase.from('parties').delete().neq('id', '0');
            await supabase.from('categories').delete().neq('id', '0'); 
            await supabase.from('system_settings').delete().neq('id', '0');
        } catch (error:any) {
            console.error("Reset Error:", error);
            throw error;
        }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        greenCoffees,
        roastStocks,
        recipes,
        productionLogs,
        packagingItems,
        orders,
        sales,
        quotes,
        purchases,
        settings,
        parties,
        categories,
        ledgerEntries,
        payments,
        inventoryMovements,
        addGreenCoffee,
        updateGreenCoffee,
        deleteGreenCoffee,
        addRoastAndDeductGreen,
        updateRoastStock,
        deleteRoastStock,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addPackagingItem,
        updatePackagingItem,
        deletePackagingItem,
        recordProduction,
        voidProductionLog,
        addOrder,
        shipOrder,
        cancelOrder,
        voidSale,
        addQuote,
        deleteQuote,
        recordPurchase,
        voidPurchase,
        updateSettings,
        addParty,
        updateParty,
        voidParty,
        addCategory,
        voidCategory,
        recordPayment,
        voidPayment,
        getPartyBalance,
        getOnHand,
        importSystemData,
        resetSystem,
        generateTextReport,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
};