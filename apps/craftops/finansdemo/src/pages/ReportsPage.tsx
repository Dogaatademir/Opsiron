import { useMemo } from 'react';
import { PieChart, TrendingUp, TrendingDown, LayoutDashboard } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function ReportsPage() {
  const { transactions, getFinancialStats } = useFinance();
  const stats = getFinancialStats();

  const fmt = (num: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(num);

  // Kategori Bazlı Rapor
  const getCategoryStats = (type: 'income' | 'expense') => {
    // DÖNEMSEL ANALİZ → Ödenmiş + Bekleyen tüm işlemler
    // ÖNEMLİ: Mükerrer sayımı önlemek için parentTransactionId'si olanları (taksit ödemelerini) hariç tutuyoruz.
    // Sadece ana borç/alacak kaydını kategori toplamına ekliyoruz.
    const relevantTrx = transactions.filter(t => t.type === type && !t.parentTransactionId);
    
    const total = relevantTrx.reduce((acc, t) => acc + t.amount, 0);

    const grouped: Record<string, number> = {};
    relevantTrx.forEach(t => {
      const key = t.category || 'Diğer';
      grouped[key] = (grouped[key] || 0) + t.amount;
    });

    return Object.keys(grouped)
      .map(cat => ({
        category: cat,
        amount: grouped[cat],
        percentage: total > 0 ? (grouped[cat] / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const incomeStats = useMemo(() => getCategoryStats('income'), [transactions]);
  const expenseStats = useMemo(() => getCategoryStats('expense'), [transactions]);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-light tracking-tight text-neutral-900">
            FİNANSAL RAPORLAR
          </h1>
          <p className="text-neutral-500 mt-1 font-light">
            Dönemsel kârlılık ve kategori bazlı gelir/gider analizi
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ÖZET KARTLAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 text-white p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2 opacity-80">
              <LayoutDashboard size={18} />
              <span className="text-xs font-bold tracking-widest uppercase">
                NET KÂRLILIK
              </span>
            </div>
            <div className="text-3xl font-light">{fmt(stats.netFlow)}</div>
            <div className="text-xs text-neutral-400 mt-2">
              Tüm gelir ve giderleri (ödenmiş + bekleyen) kapsar.
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 tracking-widest uppercase block mb-1">
                TOPLAM GELİR
              </span>
              <span className="text-2xl font-light text-neutral-900">
                {fmt(stats.totalIncome)}
              </span>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>

          <div className="bg-white border border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 tracking-widest uppercase block mb-1">
                TOPLAM GİDER
              </span>
              <span className="text-2xl font-light text-neutral-900">
                {fmt(stats.totalExpense)}
              </span>
            </div>
            <TrendingDown className="text-red-500" size={24} />
          </div>
        </div>

        {/* GELİR / GİDER DAĞILIMI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GELİR */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-500">
                  GELİR DAĞILIMI
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Satış ve gelir kalemlerinin kategori bazlı dağılımı.
                </p>
              </div>
              <div className="p-2 rounded-full bg-green-50 text-green-600">
                <PieChart size={18} />
              </div>
            </div>

            {incomeStats.length === 0 ? (
              <div className="text-sm text-neutral-400 py-8 text-center">
                Henüz gelir kaydı yok.
              </div>
            ) : (
              <div className="space-y-3">
                {incomeStats.map(item => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-neutral-800">
                        {item.category}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        %{item.percentage.toFixed(1)} | {fmt(item.amount)}
                      </div>
                    </div>
                    <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden ml-4">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GİDER */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-500">
                  GİDER DAĞILIMI
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Hammadde, personel ve diğer giderlerin kategori bazlı dağılımı.
                </p>
              </div>
              <div className="p-2 rounded-full bg-red-50 text-red-600">
                <PieChart size={18} />
              </div>
            </div>

            {expenseStats.length === 0 ? (
              <div className="text-sm text-neutral-400 py-8 text-center">
                Henüz gider kaydı yok.
              </div>
            ) : (
              <div className="space-y-3">
                {expenseStats.map(item => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-neutral-800">
                        {item.category}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        %{item.percentage.toFixed(1)} | {fmt(item.amount)}
                      </div>
                    </div>
                    <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden ml-4">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}