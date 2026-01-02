import { Transaction, Entity, Material, Recipe } from '../context/FinanceContext';

// --- SABİT VERİLER (STOK/RECIPE) ---

export const INITIAL_MATERIALS: Material[] = [
  { id: 'mat_1', name: 'Çimento (50kg Torba)', unit: 'adet', unitCost: 180 },
  { id: 'mat_2', name: 'İnşaat Demiri (Ø12)', unit: 'ton', unitCost: 18500 },
  { id: 'mat_3', name: 'Tuğla (13.5)', unit: 'adet', unitCost: 4.5 },
  { id: 'mat_4', name: 'Kum (İnce)', unit: 'm3', unitCost: 600 },
  { id: 'mat_5', name: 'Dış Cephe Boyası', unit: 'lt', unitCost: 120 },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec_1',
    name: '1 m³ C30 Beton',
    items: [
      { materialId: 'mat_1', amount: 7 }, 
      { materialId: 'mat_4', amount: 1.2 }, 
    ],
    laborCost: 500,
    totalCost: 2480,
    suggestedPrice: 3500
  },
  {
    id: 'rec_2',
    name: '100 m² Duvar Örme',
    items: [
      { materialId: 'mat_3', amount: 2500 },
      { materialId: 'mat_1', amount: 10 },
    ],
    laborCost: 15000,
    totalCost: 28050,
    suggestedPrice: 40000
  }
];

// --- HAM CARİ LİSTESİ (BAKİYELER 0) ---
// Bakiyeler en altta işlemlerden hesaplanıp güncellenecek.
const RAW_ENTITIES: Entity[] = [
  { id: 'ent_1', name: 'Yılmazlar İnşaat Malz.', type: 'supplier', balance: 0, contact: 'Ahmet Yılmaz' },
  { id: 'ent_2', name: 'BetonSA A.Ş.', type: 'supplier', balance: 0, contact: 'Merkez Ofis' },
  { id: 'ent_3', name: 'Ayşe Demir (Mimar)', type: 'supplier', balance: 0, contact: '555-0001' },
  { id: 'ent_4', name: 'Güneş Sitesi Yöneticiliği', type: 'customer', balance: 0, contact: 'Mehmet Bey' },
  { id: 'ent_5', name: 'Kuzey Villa Projesi', type: 'customer', balance: 0, contact: 'Proje Ofisi' },
  { id: 'ent_6', name: 'Ofis Plaza Yön.', type: 'customer', balance: 0, contact: 'İdari İşler' },
  { id: 'ent_7', name: 'Nalbur Hüseyin', type: 'supplier', balance: 0, contact: 'Hüseyin Usta' },
];

// --- İŞLEM OLUŞTURUCU ---

const generateData = () => {
  const transactions: Transaction[] = [];
  const uuid = () => crypto.randomUUID();

  // YARDIMCI: Hem fatura hem ödeme ekleyerek bakiyeyi nötrler (Geçmiş işlemler için)
  const addClosedTransaction = (
    date: string, 
    entityId: string | null, 
    type: 'income' | 'expense', 
    amount: number, 
    desc: string, 
    category: string,
    project: string = ''
  ) => {
    // 1. ADIM: BORÇLANMA / TAHAKKUK (Pending)
    const accrualId = uuid();
    transactions.push({
      id: accrualId,
      date: date,
      description: desc, // Örn: Malzeme Alımı
      amount: amount,
      type: type,
      category: category,
      paymentStatus: 'pending', // İlk başta bekliyor olarak girer, bakiyeyi etkiler
      paymentMethod: 'bank',
      entityId: entityId,
      project: project
    });

    // 2. ADIM: ÖDEME / KAPATMA (Paid)
    // Bu işlem bakiyeyi ters yönde etkileyip sıfırlar.
    transactions.push({
      id: uuid(),
      date: date, // Aynı gün ödenmiş varsayıyoruz veya 1 gün sonra
      description: type === 'income' ? `Tahsilat: ${desc}` : `Ödeme: ${desc}`,
      amount: amount,
      type: type, // Tip aynı kalmalı (FinanceContext mantığı)
      category: category,
      paymentStatus: 'paid', // ÖDENDİ statüsü bakiyeyi düşer
      paymentMethod: 'bank',
      entityId: entityId,
      project: project,
      parentTransactionId: accrualId // Ana işleme bağla
    });
  };

  // YARDIMCI: Sadece açık işlem ekler (Bakiyeyi etkiler)
  const addOpenTransaction = (
    date: string,
    dueDate: string,
    entityId: string | null,
    type: 'income' | 'expense',
    amount: number,
    desc: string,
    category: string,
    project: string = ''
  ) => {
    transactions.push({
      id: uuid(),
      date: date,
      dueDate: dueDate,
      description: desc,
      amount: amount,
      type: type,
      category: category,
      paymentStatus: 'pending',
      paymentMethod: 'bank',
      entityId: entityId,
      project: project
    });
  };

  // --- 1. GEÇMİŞ (KAPANMIŞ) İŞLEMLER ---
  // Bunlar bakiyeyi değiştirmez (Girdi - Çıktı = 0), ama ekstrede görünür.

  // 2025 Boyunca Genel Giderler (Entitysiz - Nakit akışını doldurur)
  for (let m = 1; m <= 12; m++) {
    const d = `2025-${m.toString().padStart(2, '0')}-01`;
    // Kira (Entity yok, direkt ödeme)
    transactions.push({
        id: uuid(), date: d, description: 'Kira Ödemesi', amount: 15000, 
        type: 'expense', paymentStatus: 'paid', category: 'Atölye Giderleri', 
        paymentMethod: 'bank', entityId: null
    });
  }

  // Tedarikçi Geçmiş İşlemleri (Ödenmiş)
  addClosedTransaction('2025-05-10', 'ent_1', 'expense', 50000, 'Kaba İnşaat Malzemeleri', 'Hammadde / Malzeme', 'Kuzey Villa');
  addClosedTransaction('2025-06-15', 'ent_2', 'expense', 120000, 'C30 Beton Dökümü', 'Hammadde / Malzeme', 'Kuzey Villa');
  addClosedTransaction('2025-08-20', 'ent_3', 'expense', 25000, 'Mimari Proje Çizimi', 'Personel / Usta', 'Kuzey Villa');

  // Müşteri Geçmiş İşlemleri (Tahsil Edilmiş)
  addClosedTransaction('2025-04-01', 'ent_5', 'income', 200000, 'Villa Projesi Peşinat', 'Satış / Hakediş', 'Kuzey Villa');
  addClosedTransaction('2025-07-01', 'ent_5', 'income', 300000, 'Villa Projesi 1. Hakediş', 'Satış / Hakediş', 'Kuzey Villa');
  addClosedTransaction('2025-09-01', 'ent_4', 'income', 15000, 'Site Peyzaj Bakımı', 'Hizmet Geliri', 'Güneş Sitesi');


  // --- 2. GÜNCEL / AÇIK İŞLEMLER (BAKİYE YARATANLAR) ---
  // Bugün: 1 Ocak 2026

  // SENARYO 1: Yılmazlar İnşaat'a borcumuz var (Vadesi geçmiş)
  addOpenTransaction('2025-12-15', '2025-12-30', 'ent_1', 'expense', 75000, 'Aralık Ayı Çimento Alımı', 'Hammadde / Malzeme', 'Kuzey Villa');

  // SENARYO 2: Kuzey Villa'dan büyük bir alacağımız var
  addOpenTransaction('2025-12-20', '2026-01-15', 'ent_5', 'income', 500000, 'Villa Projesi 2. Hakediş', 'Satış / Hakediş', 'Kuzey Villa');

  // SENARYO 3: Güneş Sitesi'nden düzenli aidat alacağı (Gelecek vadeli)
  addOpenTransaction('2026-01-01', '2026-01-31', 'ent_4', 'income', 25000, 'Ocak 2026 Bakım Bedeli', 'Hizmet Geliri', 'Güneş Sitesi');

  // SENARYO 4: BetonSA'ya yeni borçlanma
  addOpenTransaction('2026-01-02', '2026-02-02', 'ent_2', 'expense', 45000, 'Şap Kumu ve Çimento', 'Hammadde / Malzeme', 'Ofis Plaza');

  // SENARYO 5: Parçalı Ödeme Örneği (Yılmazlar İnşaat'a 75.000 borcun 25.000'ini ödedik)
  // Yukarıdaki id'yi bilmediğimiz için yeni bir borç yaratıp kısmi ödeyelim.
  
  // A) Borç Yarat
  const partialDebtId = uuid();
  transactions.push({
      id: partialDebtId,
      date: '2025-12-01', dueDate: '2025-12-31',
      description: 'Geçen Yıl Kalan Bakiye',
      amount: 100000,
      type: 'expense', category: 'Hammadde / Malzeme',
      paymentStatus: 'pending', paymentMethod: 'bank',
      entityId: 'ent_1', project: 'Genel'
  });
  // B) Kısmi Ödeme Yap (Bugün)
  transactions.push({
      id: uuid(),
      date: '2026-01-01',
      description: 'Geçen Yıl Bakiyesi Kısmi Ödeme',
      amount: 25000, // 100.000 borcun 25.000'i ödendi. Kalan 75.000 sistemde görünmeli.
      type: 'expense', category: 'Hammadde / Malzeme',
      paymentStatus: 'paid', paymentMethod: 'bank',
      entityId: 'ent_1', project: 'Genel',
      parentTransactionId: partialDebtId
  });


  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const INITIAL_TRANSACTIONS = generateData();

// --- BAKİYE HESAPLAYICI ---
// Oluşturulan işlemlere göre Entity bakiyelerini hesaplayıp güncelliyoruz.
// FinanceContext mantığı: 
// Pending Income (+), Pending Expense (-) -> Borç/Alacak Yaratır
// Paid Income (-), Paid Expense (+) -> Bakiyeyi Kapatır

const calculateBalances = () => {
    return RAW_ENTITIES.map(entity => {
        let balance = 0;
        
        const entityTrx = INITIAL_TRANSACTIONS.filter(t => t.entityId === entity.id);
        
        entityTrx.forEach(t => {
            let change = 0;
            if (t.paymentStatus === 'pending') {
                // Bekleyen işlem: Cariyi borçlandırır veya alacaklandırır
                change = t.type === 'income' ? t.amount : -t.amount;
            } else {
                // Ödenen işlem: Mevcut bakiyeyi düşer (ters işlem)
                change = t.type === 'income' ? -t.amount : t.amount;
            }
            balance += change;
        });

        // Floating point hatalarını temizle
        balance = Math.round(balance * 100) / 100;

        return { ...entity, balance };
    });
};

export const INITIAL_ENTITIES = calculateBalances();