import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFinance, Transaction } from '../context/FinanceContext';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownLeft, FileText, Tag, 
  Banknote, Landmark, CreditCard, Calendar, Briefcase, 
  Clock, Wallet, CheckCircle2, PieChart 
} from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'NAKİT / KASA' },
  { value: 'bank', label: 'HAVALE / EFT' },
  { value: 'card', label: 'KREDİ KARTI' },
];

export default function EntityDetailPage() {
  const { id } = useParams();
  const { entities, transactions, addTransaction } = useFinance();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  
  // Modal Form State
  const [paymentForm, setPaymentForm] = useState({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      description: '',
      isFullPayment: true,
      remainingDebt: 0 // Modal açıldığında kalan borcu tutmak için
  });

  const entity = entities.find(e => e.id === id);
  
  // Bu cariye ait tüm işlemler
  const entityTransactions = useMemo(() => {
    return transactions
      .filter(t => t.entityId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, id]);

  const fmt = (num: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(num);

  // --- YARDIMCI FONKSİYON: Bir işlemin ne kadarı ödenmiş? ---
  const getTransactionProgress = (trx: Transaction) => {
      // Bu işleme ait (parentTransactionId'si bu işlem olan) ödemeleri bul
      const relatedPayments = entityTransactions.filter(t => t.parentTransactionId === trx.id);
      
      const paidAmount = relatedPayments.reduce((acc, t) => acc + t.amount, 0);
      const remaining = trx.amount - paidAmount;
      
      // Eğer floating point hatası olursa (0.000001 gibi) sıfıra yuvarla
      const cleanRemaining = remaining < 0.01 ? 0 : remaining;
      
      return { 
          paid: paidAmount, 
          remaining: cleanRemaining, 
          isFullyPaid: cleanRemaining === 0,
          isPartiallyPaid: paidAmount > 0 && cleanRemaining > 0
      };
  };

  // --- ACTIONS ---

  const openPaymentModal = (trx: Transaction) => {
      const { remaining } = getTransactionProgress(trx); // Kalan tutarı hesapla

      setSelectedTrx(trx);
      setPaymentForm({
          amount: remaining.toString(), // Varsayılan olarak kalanı getir
          date: new Date().toISOString().split('T')[0],
          method: 'cash',
          description: trx.type === 'income' ? `Tahsilat: ${trx.description}` : `Ödeme: ${trx.description}`,
          isFullPayment: true,
          remainingDebt: remaining
      });
      setIsPaymentModalOpen(true);
  };

  const handlePaymentSave = () => {
      if(!selectedTrx || !paymentForm.amount) return;
      const amount = Number(paymentForm.amount);
      if(amount <= 0) return alert("Geçerli bir tutar giriniz.");
      if(amount > paymentForm.remainingDebt) return alert("Kalan tutardan fazla ödeme yapılamaz.");

      const newTrx: Transaction = {
          id: crypto.randomUUID(),
          date: new Date(paymentForm.date).toISOString(),
          description: paymentForm.description,
          amount: amount,
          type: selectedTrx.type, 
          paymentStatus: 'paid', // Ödeme yapıldığı için 'paid'
          category: selectedTrx.category,
          entityId: selectedTrx.entityId,
          paymentMethod: paymentForm.method as 'cash' | 'bank' | 'card',
          project: selectedTrx.project,
          parentTransactionId: selectedTrx.id // <--- ÖNEMLİ: Ana işleme bağlıyoruz
      };

      addTransaction(newTrx);
      setIsPaymentModalOpen(false);
  };

  const toggleFullPayment = (isFull: boolean) => {
      if(isFull) {
          setPaymentForm(prev => ({ ...prev, isFullPayment: true, amount: prev.remainingDebt.toString() }));
      } else {
          setPaymentForm(prev => ({ ...prev, isFullPayment: false, amount: '' }));
      }
  };

  // İstatistikler (Global bakiyeyi etkilemez, sadece gösterim)
  const stats = useMemo(() => {
    // Toplam Tahsilat: 'paid' statüsündeki gelirler
    const collectedIn = entityTransactions
      .filter(t => t.type === 'income' && t.paymentStatus === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);

    // Toplam Ödeme: 'paid' statüsündeki giderler
    const paidOut = entityTransactions
      .filter(t => t.type === 'expense' && t.paymentStatus === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);

    // Açık Alacak: 'pending' olanların KALAN tutarları
    const openReceivable = entityTransactions
      .filter(t => t.type === 'income' && t.paymentStatus === 'pending')
      .reduce((acc, t) => acc + getTransactionProgress(t).remaining, 0);

    // Açık Borç: 'pending' olanların KALAN tutarları
    const openPayable = entityTransactions
      .filter(t => t.type === 'expense' && t.paymentStatus === 'pending')
      .reduce((acc, t) => acc + getTransactionProgress(t).remaining, 0);

    return { collectedIn, paidOut, openReceivable, openPayable };
  }, [entityTransactions]);

  if (!entity) return <div className="p-10 text-center">Kayıt bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link to="/entities" className="inline-flex items-center text-neutral-500 hover:text-neutral-900 mb-6 transition-colors text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> LİSTEYE DÖN
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-neutral-900 mb-2">{entity.name}</h1>
              <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${entity.type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {entity.type === 'customer' ? 'MÜŞTERİ' : 'TEDARİKÇİ'}
              </span>
            </div>
            <div className="text-right bg-neutral-50 p-4 rounded border border-neutral-100 min-w-[200px]">
              <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">GÜNCEL BAKİYE</div>
              <div className={`text-3xl font-light ${entity.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(Math.abs(entity.balance))}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-neutral-400">{entity.balance >= 0 ? 'BİZ ALACAKLIYIZ' : 'BİZ BORÇLUYUZ'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* ÖZET KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 border border-neutral-200 shadow-sm flex justify-between items-center">
             <div><div className="text-[10px] font-bold text-neutral-400 uppercase">TOPLAM TAHSİLAT</div><div className="text-xl font-light mt-1">{fmt(stats.collectedIn)}</div></div>
             <div className="p-2 bg-green-50 text-green-600 rounded-full"><ArrowDownLeft size={18}/></div>
          </div>
          <div className="bg-white p-4 border border-neutral-200 shadow-sm flex justify-between items-center">
             <div><div className="text-[10px] font-bold text-neutral-400 uppercase">TOPLAM ÖDEME</div><div className="text-xl font-light mt-1">{fmt(stats.paidOut)}</div></div>
             <div className="p-2 bg-red-50 text-red-600 rounded-full"><ArrowUpRight size={18}/></div>
          </div>
          <div className="bg-white p-4 border border-neutral-200 shadow-sm flex justify-between items-center">
             <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase">AÇIK HESAPLAR</div>
                <div className="text-[11px] mt-2 space-y-1">
                   <div className="flex justify-between w-full gap-4"><span>ALACAK:</span> <span className="text-green-600">{fmt(stats.openReceivable)}</span></div>
                   <div className="flex justify-between w-full gap-4"><span>BORÇ:</span> <span className="text-red-600">{fmt(stats.openPayable)}</span></div>
                </div>
             </div>
             <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><Briefcase size={18}/></div>
          </div>
        </div>

        {/* TABLO */}
        <div className="bg-white border border-neutral-200 shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/50">
            <FileText size={20} className="text-neutral-400" />
            <h2 className="text-lg font-light text-neutral-900">Hesap Ekstresi</h2>
          </div>
          <table className="w-full text-left">
              <thead className="bg-neutral-50 text-xs text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4">TARİH</th>
                  <th className="px-6 py-4">AÇIKLAMA</th>
                  <th className="px-6 py-4 text-center">DURUM</th>
                  <th className="px-6 py-4 text-right">TUTAR</th>
                  <th className="px-6 py-4 text-center w-24">İŞLEM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {entityTransactions.map(t => {
                    // Sadece 'pending' olanlar ana satırdır veya 'paid' olup parent'i olmayanlar (direkt nakit işlem).
                    // 'paid' olup parentTransactionId'si olanları burada GİZLİYORUZ, çünkü onlar ana satırın içinde özetlenecek.
                    if (t.paymentStatus === 'paid' && t.parentTransactionId) return null;

                    const progress = getTransactionProgress(t);
                    
                    // Eğer işlem tamamen ödendiyse ve 'pending' ise, görsel olarak 'paid' gibi gösterelim mi?
                    // Hayır, kullanıcı "Tamamen kapandığına dair yazı" istedi.
                    
                    return (
                    <tr key={t.id} className="hover:bg-neutral-50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-neutral-500 font-light whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2"><Calendar size={14} className="text-neutral-300"/>{new Date(t.date).toLocaleDateString('tr-TR')}</div>
                          {t.dueDate && t.paymentStatus === 'pending' && progress.remaining > 0 && (
                            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-max">
                              <Clock size={10} /><span>Vade: {new Date(t.dueDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">{t.description}</div>
                        <div className="text-xs text-neutral-400 mt-1">{t.category}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* DURUM SÜTUNU MANTIĞI */}
                        {t.paymentStatus === 'paid' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 size={12}/> ÖDENDİ</span>
                        ) : (
                            // BEKLİYOR DURUMUNDAKİLER İÇİN KISMİ/TAMAMLANDI KONTROLÜ
                            progress.isFullyPaid ? (
                                <div className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                                    <CheckCircle2 size={12}/> KAPANDI
                                </div>
                            ) : progress.isPartiallyPaid ? (
                                <div className="flex flex-col items-center">
                                    <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-1">
                                        <PieChart size={12}/> KISMEN ÖDENDİ
                                    </div>
                                    <span className="text-[10px] text-neutral-400 font-medium">
                                        {fmt(progress.paid)} / {fmt(t.amount)}
                                    </span>
                                    <span className="text-[10px] text-orange-600 font-bold">
                                        (Kalan: {fmt(progress.remaining)})
                                    </span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                    <Clock size={12}/> BEKLİYOR
                                </div>
                            )
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                          {/* Sadece borcu kalmışsa buton göster */}
                          {t.paymentStatus === 'pending' && progress.remaining > 0 && (
                              <button onClick={() => openPaymentModal(t)} className="bg-neutral-900 text-white p-2 rounded hover:bg-neutral-800 transition-colors" title="Ödeme/Tahsilat Yap">
                                <Wallet size={16} />
                              </button>
                          )}
                      </td>
                    </tr>
                )})}
              </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={selectedTrx?.type === 'income' ? "TAHSİLAT GİRİŞİ" : "ÖDEME ÇIKIŞI"}>
         {selectedTrx && (
             <div className="space-y-6">
                 <div className="bg-neutral-50 p-4 rounded border border-neutral-200 text-center">
                    <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-2">GÜNCEL KALAN TUTAR</div>
                    <div className="text-3xl font-light text-neutral-900">{fmt(paymentForm.remainingDebt)}</div>
                    <div className="text-xs text-neutral-400 mt-1">Toplam İşlem: {fmt(selectedTrx.amount)}</div>
                 </div>

                 <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
                    <button onClick={() => toggleFullPayment(true)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${paymentForm.isFullPayment ? 'bg-white shadow text-neutral-900' : 'text-neutral-400'}`}>
                        KALANIN TAMAMI ({fmt(paymentForm.remainingDebt)})
                    </button>
                    <button onClick={() => toggleFullPayment(false)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${!paymentForm.isFullPayment ? 'bg-white shadow text-neutral-900' : 'text-neutral-400'}`}>
                        KISMİ TAHİSLAT/ÖDEME
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div><label className="text-xs font-bold text-neutral-500 mb-2 block">TARİH</label><input type="date" className="w-full p-3 border border-neutral-300 rounded outline-none text-sm" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}/></div>
                     <div><label className="text-xs font-bold text-neutral-500 mb-2 block">TUTAR</label><input type="number" className="w-full p-3 border border-neutral-300 rounded outline-none text-sm font-bold" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} disabled={paymentForm.isFullPayment}/></div>
                 </div>
                 
                 <CustomSelect label="ÖDEME YÖNTEMİ" options={PAYMENT_METHODS} value={paymentForm.method} onChange={v => setPaymentForm({...paymentForm, method: v})}/>
                 
                 <div><label className="text-xs font-bold text-neutral-500 mb-2 block">AÇIKLAMA</label><input className="w-full p-3 border border-neutral-300 rounded outline-none text-sm font-light" value={paymentForm.description} onChange={e => setPaymentForm({...paymentForm, description: e.target.value})}/></div>

                 <button onClick={handlePaymentSave} className={`w-full py-4 text-white font-bold tracking-widest rounded transition-opacity hover:opacity-90 ${selectedTrx.type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}>
                     {selectedTrx.type === 'income' ? 'TAHSİLAT KAYDET' : 'ÖDEME YAP'}
                 </button>
             </div>
         )}
      </Modal>
    </div>
  );
}