import { useMemo } from 'react';
import { useFinance, Transaction } from '../context/FinanceContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Landmark,
  Banknote,
  Tag,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinanceDashboard() {
  const { transactions, getFinancialStats, entities } = useFinance();
  const stats = getFinancialStats();

  // YARDIMCI: Bir işlemin kalan tutarını hesaplar
  const getRemainingAmount = (trx: Transaction) => {
    // Bu işleme ait (parentTransactionId'si bu işlem olan) ödemeleri bul
    const relatedPayments = transactions.filter(t => t.parentTransactionId === trx.id);
    const paidAmount = relatedPayments.reduce((acc, t) => acc + t.amount, 0);
    return trx.amount - paidAmount;
  };

  // SON İŞLEMLER
  const recentTrx = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // VADESİ YAKLAŞAN BORÇLAR (DÜZELTİLDİ)
  const upcomingDebts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions
      .filter(t => 
          // 1. Sadece Giderler
          t.type === 'expense' &&
          // 2. Sadece Bekleyenler
          t.paymentStatus === 'pending' &&
          // 3. Sadece Ana İşlemler (Taksit ödemeleri burada listelenmesin)
          !t.parentTransactionId &&
          // 4. Vadesi Bugün veya Gelecekte Olanlar
          t.dueDate && new Date(t.dueDate) >= today
      )
      // Önce her işlemin kalan borcunu hesaplayıp objeye ekleyelim
      .map(t => ({
          ...t,
          remainingAmount: getRemainingAmount(t)
      }))
      // Borcu bitmiş (0 kalmış) ama statüsü güncellenmemiş olanları gizleyelim
      .filter(t => t.remainingAmount > 0)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [transactions]);

  // En riskli cariler (en yüksek mutlak bakiye)
  const topRiskEntities = useMemo(() => {
    return [...entities]
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, 4);
  }, [entities]);

  const fmt = (num: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(num);

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('tr-TR');
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-light tracking-tight text-neutral-900">
            GENEL BAKIŞ
          </h1>
          <p className="text-neutral-500 mt-1 font-light">
            Nakit akışı, kârlılık ve cari risklerini tek ekranda gör.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ÜST KPI KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* NET KÂRLILIK */}
          <div className="bg-neutral-900 text-white p-6 shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
                NET KÂRLILIK
              </span>
              <div className="p-2 rounded-full bg-neutral-800 text-neutral-200">
                <Wallet size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-light tracking-tight">
                {fmt(stats.netFlow)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">
                Dönem toplam gelir - gider (ödenmiş + bekleyen).
              </p>
            </div>
          </div>

          {/* BEKLEYEN TAHSİLAT */}
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
                BEKLEYEN TAHSİLAT
              </span>
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-light text-neutral-900">
                {fmt(stats.pendingIncome)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">
                Kesilmiş ancak henüz tahsil edilmemiş faturalar (alacak).
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/20" />
          </div>

          {/* BEKLEYEN ÖDEME */}
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
                BEKLEYEN ÖDEME
              </span>
              <div className="p-2 rounded-full bg-red-50 text-red-600">
                <TrendingDown size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-light text-neutral-900">
                {fmt(stats.pendingExpense)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">
                Vadesi gelen ancak henüz ödenmemiş borçlar.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500/20" />
          </div>

          {/* TOPLAM CİRO */}
          <div className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
                TOPLAM CİRO
              </span>
              <div className="p-2 rounded-full bg-orange-50 text-orange-600">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-light text-neutral-900">
                {fmt(stats.totalIncome)}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-light">
                Dönem boyunca kesilen tüm gelir kayıtları (ödenmiş + bekleyen).
              </p>
            </div>
          </div>
        </div>

        {/* KASA & BANKA DURUMU + CARİ RİSK */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KASA / BANKA */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-500">
                  NAKİT DURUMU
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Sadece ödenmiş işlemlerden gelen gerçek kasa & banka bakiyesi.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-neutral-200 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-neutral-50">
                    <Banknote size={16} className="text-green-600" />
                  </div>
                  <span className="text-[11px] font-bold uppercase text-neutral-400">
                    KASA
                  </span>
                </div>
                <div className="text-xl font-light">
                  {fmt(stats.cashBalance)}
                </div>
              </div>
              <div className="border border-neutral-200 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-neutral-50">
                    <Landmark size={16} className="text-blue-600" />
                  </div>
                  <span className="text-[11px] font-bold uppercase text-neutral-400">
                    BANKA
                  </span>
                </div>
                <div className="text-xl font-light">
                  {fmt(stats.bankBalance)}
                </div>
              </div>
              <div className="border border-neutral-200 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-neutral-900 text-white">
                    <Wallet size={16} />
                  </div>
                  <span className="text-[11px] font-bold uppercase text-neutral-400">
                    TOPLAM LİKİDİTE
                  </span>
                </div>
                <div className="text-xl font-light">
                  {fmt(stats.cashBalance + stats.bankBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* CARİ RİSK KARTI */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-500">
                  CARİ RİSK TABLOSU
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  En yüksek borç/alacak bakiyesine sahip cariler.
                </p>
              </div>
              <div className="p-2 rounded-full bg-neutral-50">
                <Users size={18} className="text-neutral-700" />
              </div>
            </div>

            {topRiskEntities.length === 0 ? (
              <div className="text-sm text-neutral-400 py-6 text-center">
                Henüz cari kaydı yok.
              </div>
            ) : (
              <div className="space-y-3">
                {topRiskEntities.map(ent => (
                  <Link
                    key={ent.id}
                    to={`/entities/${ent.id}`}
                    className="flex items-center justify-between text-sm border border-neutral-100 hover:border-neutral-300 rounded px-3 py-2 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-800">
                        {ent.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 uppercase">
                        {ent.type === 'customer' ? 'MÜŞTERİ' : 'TEDARİKÇİ'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          ent.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {fmt(Math.abs(ent.balance))}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {ent.balance >= 0 ? 'Biz alacaklıyız' : 'Biz borçluyuz'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ALT BÖLÜM: SON İŞLEMLER & VADESİ YAKLAŞANLAR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SON İŞLEMLER */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-500">
                  SON İŞLEMLER
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  En son kaydedilen 5 gelir/gider hareketi.
                </p>
              </div>
            </div>

            {recentTrx.length === 0 ? (
              <div className="text-sm text-neutral-400 py-6 text-center">
                Henüz finansal işlem yok.
              </div>
            ) : (
              <div className="space-y-2">
                {recentTrx.map(trx => (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between text-sm border border-neutral-100 rounded px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          trx.type === 'income'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {trx.type === 'income' ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownLeft size={16} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-800">
                          {trx.description}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {formatDate(trx.date)}
                          </span>
                          {trx.project && (
                            <span className="flex items-center gap-1">
                              <Tag size={10} /> {trx.project}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          trx.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {fmt(trx.amount)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {trx.paymentStatus === 'paid'
                          ? 'Ödendi'
                          : 'Beklemede'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VADESİ YAKLAŞAN BORÇLAR - DÜZELTİLEN ALAN */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-500">
                  VADESİ YAKLAŞAN BORÇLAR
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Ödenmemiş giderler içinde vadesi yaklaşan ilk 5 kayıt.
                </p>
              </div>
              <div className="p-2 rounded-full bg-amber-50 text-amber-600">
                <AlertCircle size={18} />
              </div>
            </div>

            {upcomingDebts.length === 0 ? (
              <div className="text-sm text-neutral-400 py-6 text-center">
                Vadesi yaklaşan borç görünmüyor.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDebts.map(trx => (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between text-sm border border-neutral-100 rounded px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-800">
                        {trx.description}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        Vade: {formatDate(trx.dueDate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        {fmt(trx.remainingAmount)} {/* DÜZELTME: Kalan tutar */}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {/* Kısmi ödeme varsa bilgi verelim */}
                        {trx.amount !== trx.remainingAmount 
                            ? 'Kısmi Ödendi' 
                            : (trx.entityId ? 'Ödeme bekliyor' : 'Cari yok')
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ALT NAV */}
        <div className="flex justify-end">
          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-600 hover:text-neutral-900"
          >
            TÜM İŞLEMLERİ GÖR
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}