import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  INITIAL_ENTITIES,
  INITIAL_TRANSACTIONS,
  INITIAL_MATERIALS,
  INITIAL_RECIPES
} from '../data/dummyData';

// --- TİP TANIMLAMALARI ---

export interface Entity {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  balance: number;
  contact: string;
}

export interface Transaction {
  id: string;
  date: string;
  dueDate?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  entityId: string | null;
  paymentMethod: 'cash' | 'bank' | 'card';
  paymentStatus: 'paid' | 'pending';
  project?: string;
  
  parentTransactionId?: string;

  relatedRecipeId?: string;
  relatedMaterialId?: string;
  quantity?: number;
  unit?: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
}

export interface RecipeItem {
  materialId: string;
  amount: number;
}

export interface Recipe {
  id: string;
  name: string;
  items: RecipeItem[];
  laborCost: number;
  totalCost: number;
  suggestedPrice: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  cashBalance: number;
  bankBalance: number;
  pendingIncome: number;
  pendingExpense: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Satış / Hakediş', type: 'income' },
  { id: 'cat2', name: 'Hammadde / Malzeme', type: 'expense' },
  { id: 'cat3', name: 'Personel / Usta', type: 'expense' },
  { id: 'cat4', name: 'Atölye Giderleri', type: 'expense' },
  { id: 'cat5', name: 'Nakliye / Montaj', type: 'expense' },
  { id: 'cat6', name: 'Vergi / Resmi', type: 'expense' },
  { id: 'cat7', name: 'Şahsi / Diğer', type: 'expense' },
  { id: 'cat8', name: 'Diğer Gelirler', type: 'income' }
];

interface FinanceContextType {
  entities: Entity[];
  transactions: Transaction[];
  categories: Category[];
  materials: Material[];
  recipes: Recipe[];

  addTransaction: (trx: Transaction) => void;
  updateTransaction: (id: string, updatedTrx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addEntity: (ent: Entity) => void;
  addCategory: (name: string, type: 'income' | 'expense') => void;
  removeCategory: (id: string) => void;

  addMaterial: (mat: Material) => void;
  updateMaterialCost: (id: string, newCost: number) => void;
  addRecipe: (rec: Recipe) => void;

  calculateRecipeCost: (items: RecipeItem[], labor: number) => number;
  getFinancialStats: () => FinancialStats;

  clearAllData: () => void;
  loadDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);

  // --- CARİ BAKİYE GÜNCELLEME MANTIĞI ---
  const updateEntityBalance = (
    entityId: string,
    amount: number,
    type: 'income' | 'expense',
    status: 'paid' | 'pending',
    operation: 'add' | 'remove'
  ) => {
    setEntities(prev =>
      prev.map(e => {
        if (e.id !== entityId) return e;

        let change = 0;

        if (status === 'pending') {
          change = type === 'income' ? amount : -amount;
        } else {
          change = type === 'income' ? -amount : amount;
        }

        if (operation === 'remove') change = -change;

        return { ...e, balance: e.balance + change };
      })
    );
  };

  // --- ACTIONS ---
  const addTransaction = (trx: Transaction) => {
    setTransactions(prev => [trx, ...prev]);
    if (trx.entityId) {
      updateEntityBalance(trx.entityId, trx.amount, trx.type, trx.paymentStatus, 'add');
    }
  };

  const updateTransaction = (id: string, updatedTrx: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        if (t.entityId) {
          updateEntityBalance(t.entityId, t.amount, t.type, t.paymentStatus, 'remove');
        }
        const newTrx: Transaction = { ...t, ...updatedTrx };
        if (newTrx.entityId) {
          updateEntityBalance(newTrx.entityId, newTrx.amount, newTrx.type, newTrx.paymentStatus, 'add');
        }
        return newTrx;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const trx = transactions.find(t => t.id === id);
    if (trx && trx.entityId) {
      updateEntityBalance(trx.entityId, trx.amount, trx.type, trx.paymentStatus, 'remove');
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addEntity = (ent: Entity) => {
    setEntities(prev => [ent, ...prev]);
  };

  const addCategory = (name: string, type: 'income' | 'expense') => {
    setCategories(prev => [...prev, { id: crypto.randomUUID(), name, type }]);
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addMaterial = (mat: Material) => {
    setMaterials(prev => [...prev, mat]);
  };

  const updateMaterialCost = (id: string, newCost: number) => {
    setMaterials(prev => prev.map(m => (m.id === id ? { ...m, unitCost: newCost } : m)));
  };

  const addRecipe = (rec: Recipe) => {
    setRecipes(prev => [...prev, rec]);
  };

  const calculateRecipeCost = (items: RecipeItem[], labor: number) => {
    let totalMaterialCost = 0;
    items.forEach(item => {
      const mat = materials.find(m => m.id === item.materialId);
      if (mat) totalMaterialCost += mat.unitCost * item.amount;
    });
    return totalMaterialCost + labor;
  };

  // --- İSTATİSTİKLER ---
  const getFinancialStats = (): FinancialStats => {
    // 1) TÜM İŞLEMLER (DÖNEM KÂRLILIĞI)
    const allIncome = transactions
      .filter(t => t.type === 'income' && !t.parentTransactionId)
      .reduce((acc, t) => acc + t.amount, 0);
      
    const allExpense = transactions
      .filter(t => t.type === 'expense' && !t.parentTransactionId)
      .reduce((acc, t) => acc + t.amount, 0);

    // 2) SADECE ÖDENMİŞLER → NAKİT
    const paidTrx = transactions.filter(t => t.paymentStatus === 'paid');

    const cashIn = paidTrx
      .filter(t => t.type === 'income' && t.paymentMethod === 'cash')
      .reduce((acc, t) => acc + t.amount, 0);
    const cashOut = paidTrx
      .filter(t => t.type === 'expense' && t.paymentMethod === 'cash')
      .reduce((acc, t) => acc + t.amount, 0);

    const bankIn = paidTrx
      .filter(t => t.type === 'income' && t.paymentMethod !== 'cash')
      .reduce((acc, t) => acc + t.amount, 0);
    const bankOut = paidTrx
      .filter(t => t.type === 'expense' && t.paymentMethod !== 'cash')
      .reduce((acc, t) => acc + t.amount, 0);

    // 3) BEKLEYENLER (DÜZELTİLDİ: Sadece kalan tutarlar toplanıyor)
    
    // Yardımcı: Bir ana işleme ne kadar ödeme yapıldığını bulur
    const getPaidAmount = (parentId: string) => {
        return transactions
            .filter(t => t.parentTransactionId === parentId)
            .reduce((acc, t) => acc + t.amount, 0);
    };

    // Bekleyen ana işlemleri filtrele
    const pendingTrx = transactions.filter(t => t.paymentStatus === 'pending' && !t.parentTransactionId);
    
    // Her bir bekleyen işlem için: (Ana Tutar - Ödenen Tutar)
    const pendingIncome = pendingTrx
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
          const paid = getPaidAmount(t.id);
          const remaining = t.amount - paid;
          return acc + (remaining > 0 ? remaining : 0);
      }, 0);

    const pendingExpense = pendingTrx
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
          const paid = getPaidAmount(t.id);
          const remaining = t.amount - paid;
          return acc + (remaining > 0 ? remaining : 0);
      }, 0);

    return {
      totalIncome: allIncome,
      totalExpense: allExpense,
      netFlow: allIncome - allExpense,
      cashBalance: cashIn - cashOut,
      bankBalance: bankIn - bankOut,
      pendingIncome,
      pendingExpense
    };
  };

  const clearAllData = () => {
    setEntities([]);
    setTransactions([]);
    setMaterials([]);
    setRecipes([]);
    setCategories(DEFAULT_CATEGORIES);
  };

  const loadDemoData = () => {
    setEntities(INITIAL_ENTITIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setMaterials(INITIAL_MATERIALS);
    setRecipes(INITIAL_RECIPES);
    setCategories(DEFAULT_CATEGORIES);
  };

  return (
    <FinanceContext.Provider
      value={{
        entities, transactions, categories, materials, recipes,
        addTransaction, updateTransaction, deleteTransaction,
        addEntity, addCategory, removeCategory, addMaterial, updateMaterialCost,
        addRecipe, calculateRecipeCost, getFinancialStats,
        clearAllData, loadDemoData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};