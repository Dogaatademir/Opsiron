import { RawMaterial, Product, Log } from '../context/InventoryContext';

// --- HAMMADDELER (25 Kalem) ---
export const INITIAL_MATERIALS: RawMaterial[] = [
  // AHŞAP GRUBU
  { id: 'RM-001', name: 'Ham Meşe Kereste', category: 'Ahşap', unit: 'Adet', stock: 145, minLimit: 20 },
  { id: 'RM-002', name: 'Ceviz Kaplama', category: 'Ahşap', unit: 'm2', stock: 500, minLimit: 50 },
  { id: 'RM-003', name: 'MDF Plaka (18mm)', category: 'Ahşap', unit: 'Plaka', stock: 80, minLimit: 15 },
  { id: 'RM-004', name: 'Kontrplak (Huș)', category: 'Ahşap', unit: 'Plaka', stock: 35, minLimit: 10 },
  { id: 'RM-005', name: 'Gürgen Lata', category: 'Ahşap', unit: 'Mt', stock: 1200, minLimit: 200 },
  
  // HIRDAVAT & METAL
  { id: 'RM-006', name: 'Montaj Vidası (4x50)', category: 'Hırdavat', unit: 'Kutu', stock: 45, minLimit: 5 },
  { id: 'RM-007', name: 'Minifiks Bağlantı Seti', category: 'Hırdavat', unit: 'Adet', stock: 2000, minLimit: 500 },
  { id: 'RM-008', name: 'Çekmece Rayı (Teleskopik)', category: 'Hırdavat', unit: 'Tk', stock: 120, minLimit: 30 },
  { id: 'RM-009', name: 'Menteşe (Frenli)', category: 'Hırdavat', unit: 'Adet', stock: 650, minLimit: 100 },
  { id: 'RM-010', name: 'Metal Profil (40x40)', category: 'Metal', unit: 'Mt', stock: 300, minLimit: 50 },
  
  // KİMYASAL & BOYA
  { id: 'RM-011', name: 'Ahşap Tutkalı (D3)', category: 'Kimyasal', unit: 'Kg', stock: 60, minLimit: 10 },
  { id: 'RM-012', name: 'Mat Vernik', category: 'Kimyasal', unit: 'Lt', stock: 85, minLimit: 20 },
  { id: 'RM-013', name: 'Dolgu Verniği', category: 'Kimyasal', unit: 'Lt', stock: 100, minLimit: 20 },
  { id: 'RM-014', name: 'Tiner (Selülozik)', category: 'Kimyasal', unit: 'Tnk', stock: 12, minLimit: 3 },
  { id: 'RM-015', name: 'Ceviz Boya', category: 'Kimyasal', unit: 'Lt', stock: 25, minLimit: 5 },

  // TEKSTİL & DÖŞEME
  { id: 'RM-016', name: 'Döşemelik Kumaş (Gri)', category: 'Tekstil', unit: 'Mt', stock: 240, minLimit: 30 },
  { id: 'RM-017', name: 'Döşemelik Kumaş (Bej)', category: 'Tekstil', unit: 'Mt', stock: 110, minLimit: 30 },
  { id: 'RM-018', name: 'Sünger (32 Dansite)', category: 'Tekstil', unit: 'Plaka', stock: 40, minLimit: 10 },
  { id: 'RM-019', name: 'Elyaf (300gr)', category: 'Tekstil', unit: 'Rulo', stock: 8, minLimit: 2 },

  // AMBALAJ
  { id: 'RM-020', name: 'Balonlu Naylon', category: 'Ambalaj', unit: 'Rulo', stock: 15, minLimit: 3 },
  { id: 'RM-021', name: 'Koli Bandı', category: 'Ambalaj', unit: 'Adet', stock: 150, minLimit: 20 },
  { id: 'RM-022', name: 'Karton Köşebent', category: 'Ambalaj', unit: 'Adet', stock: 1000, minLimit: 200 },
  { id: 'RM-023', name: 'Streç Film', category: 'Ambalaj', unit: 'Rulo', stock: 45, minLimit: 10 },
];

// --- YARI MAMÜLLER & BİTMİŞ ÜRÜNLER ---
export const INITIAL_PRODUCTS: Product[] = [
  // YARI MAMÜLLER (Semi-Finished)
  { 
    id: 'SM-001', 
    name: 'Torna Masa Ayağı (Ham)', 
    type: 'semi', 
    unit: 'Adet', 
    stock: 48, 
    recipe: [
      { itemId: 'RM-001', type: 'raw', quantity: 0.25 } // Çeyrek kereste
    ]
  },
  { 
    id: 'SM-002', 
    name: 'Masa Tablası (Zımparalanmış)', 
    type: 'semi', 
    unit: 'Adet', 
    stock: 12, 
    recipe: [
      { itemId: 'RM-001', type: 'raw', quantity: 4 },
      { itemId: 'RM-011', type: 'raw', quantity: 0.5 } // Tutkal
    ]
  },
  { 
    id: 'SM-003', 
    name: 'Sandalye İskeleti', 
    type: 'semi', 
    unit: 'Adet', 
    stock: 24, 
    recipe: [
      { itemId: 'RM-005', type: 'raw', quantity: 3 }, // 3mt gürgen
      { itemId: 'RM-011', type: 'raw', quantity: 0.2 }
    ]
  },
  { 
    id: 'SM-004', 
    name: 'Çekmece Kasası (Montajsız)', 
    type: 'semi', 
    unit: 'Adet', 
    stock: 60, 
    recipe: [
      { itemId: 'RM-003', type: 'raw', quantity: 0.2 },
      { itemId: 'RM-004', type: 'raw', quantity: 0.1 }
    ]
  },
  { 
    id: 'SM-005', 
    name: 'Boyalı Metal Ayak', 
    type: 'semi', 
    unit: 'Adet', 
    stock: 100, 
    recipe: [
      { itemId: 'RM-010', type: 'raw', quantity: 1.5 } // 1.5mt profil
    ]
  },

  // BİTMİŞ ÜRÜNLER (Finished Goods)
  { 
    id: 'PRD-001', 
    name: 'Retro Yemek Masası (6 Kişilik)', 
    type: 'finished', 
    unit: 'Adet', 
    stock: 5, 
    recipe: [
      { itemId: 'SM-002', type: 'semi', quantity: 1 }, // Tabla
      { itemId: 'SM-001', type: 'semi', quantity: 4 }, // 4 Ayak
      { itemId: 'RM-012', type: 'raw', quantity: 0.5 }, // Vernik
      { itemId: 'RM-007', type: 'raw', quantity: 12 }   // Bağlantı
    ]
  },
  { 
    id: 'PRD-002', 
    name: 'İskandinav Sandalye (Gri)', 
    type: 'finished', 
    unit: 'Adet', 
    stock: 18, 
    recipe: [
      { itemId: 'SM-003', type: 'semi', quantity: 1 }, // İskelet
      { itemId: 'RM-016', type: 'raw', quantity: 1.2 }, // Kumaş
      { itemId: 'RM-018', type: 'raw', quantity: 1 },   // Sünger
      { itemId: 'RM-012', type: 'raw', quantity: 0.2 }   // Vernik
    ]
  },
  { 
    id: 'PRD-003', 
    name: 'Çalışma Masası (Metal Ayaklı)', 
    type: 'finished', 
    unit: 'Adet', 
    stock: 8, 
    recipe: [
      { itemId: 'SM-002', type: 'semi', quantity: 1 }, // Tabla
      { itemId: 'SM-005', type: 'semi', quantity: 2 }, // 2 Metal çerçeve ayak
      { itemId: 'RM-006', type: 'raw', quantity: 16 }  // Vida
    ]
  },
  { 
    id: 'PRD-004', 
    name: '3 Çekmeceli Keson', 
    type: 'finished', 
    unit: 'Adet', 
    stock: 15, 
    recipe: [
      { itemId: 'SM-004', type: 'semi', quantity: 3 }, // 3 Çekmece
      { itemId: 'RM-003', type: 'raw', quantity: 0.5 }, // Gövde MDF
      { itemId: 'RM-008', type: 'raw', quantity: 3 },   // 3 Ray Takımı
      { itemId: 'RM-009', type: 'raw', quantity: 6 }    // Kulp vs
    ]
  },
  { 
    id: 'PRD-005', 
    name: 'TV Ünitesi (Ceviz)', 
    type: 'finished', 
    unit: 'Adet', 
    stock: 2, 
    recipe: [
      { itemId: 'RM-003', type: 'raw', quantity: 1.5 },
      { itemId: 'RM-002', type: 'raw', quantity: 3 }, // Kaplama
      { itemId: 'RM-009', type: 'raw', quantity: 4 }, // Menteşe
      { itemId: 'SM-001', type: 'semi', quantity: 5 } // 5 Ayak
    ]
  }
];

// --- GEÇMİŞ LOGLAR ---
export const INITIAL_LOGS: Log[] = [
  { id: 'LOG-001', date: '2023-12-25T09:30:00', type: 'production', message: '5 adet Retro Yemek Masası üretildi.' },
  { id: 'LOG-002', date: '2023-12-25T11:15:00', type: 'production', message: '20 adet Torna Masa Ayağı (Yarı Mamül) işlendi.' },
  { id: 'LOG-003', date: '2023-12-26T14:20:00', type: 'restock', message: 'Depoya 50 tabaka MDF girişi yapıldı.' },
  { id: 'LOG-004', date: '2023-12-27T10:00:00', type: 'production', message: '12 adet İskandinav Sandalye montajı tamamlandı.' },
  { id: 'LOG-005', date: '2023-12-28T16:45:00', type: 'shipment', message: '8 adet Çalışma Masası sevk edildi.' },
];