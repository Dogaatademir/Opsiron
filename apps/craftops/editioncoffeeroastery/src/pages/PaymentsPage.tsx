import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, Building2, User, Ban, AlertCircle, CalendarClock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/Modal';

export const PaymentsPage = () => {
  const { parties, payments, purchases, recordPayment, voidPayment, getPartyBalance } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Inbound' | 'Outbound'>('All');
  
  // Form State
  const [formData, setFormData] = useState<{
    partyId: string;
    type: 'Inbound' | 'Outbound';
    amount: number;
    method: 'Cash' | 'Bank' | 'Card' | 'Other';
    date: string;
    note: string;
  }>({
    partyId: '',
    type: 'Inbound',
    amount: 0,
    method: 'Bank',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return alert("Tutar 0'dan büyük olmalı.");
    if (!formData.partyId) return alert("Cari seçiniz.");

    recordPayment({
        id: `PAY-${Date.now()}`,
        status: 'Active',
        currency: 'TRY',
        ...formData
    });
    setIsModalOpen(false);
    setFormData({ ...formData, amount: 0, note: '' });
  };

  const handleVoidPayment = (id: string) => {
      const reason = window.prompt("İptal sebebi nedir?");
      if (reason) {
          voidPayment(id, reason);
      }
  };

  const filteredPayments = payments
    .filter(p => activeTab === 'All' || p.type === activeTab)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  // Vade Tarihi Hesaplama Yardımcısı
  const getNextDueInfo = (partyId: string) => {
      // Sadece aktif ve vadesi belirtilmiş satın alımları getir
      const supplierPurchases = purchases.filter(p => 
          p.supplierId === partyId && 
          p.status === 'Active' && 
          p.dueDate
      );

      // Tarihe göre sırala (En yakın tarih en üstte)
      supplierPurchases.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

      // Bugünden sonraki (veya bugünkü) ilk vadeyi bul
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const nextDue = supplierPurchases.find(p => new Date(p.dueDate!) >= today);

      if (!nextDue) return null;

      return {
          date: nextDue.dueDate,
          amount: nextDue.cost // O faturanın/alımın toplam tutarı
      };
  };

  return (
    <div className="min-h-screen bg-neutral-50">
       <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-end">
            <div><h1 className="text-4xl font-light tracking-tight text-neutral-900">KASA & BANKA</h1><p className="text-neutral-500 mt-1 font-light">Tahsilat, ödeme ve cari bakiye takibi</p></div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-neutral-900 text-white px-6 py-4 font-light tracking-wide"><Plus size={18}/><span>YENİ İŞLEM</span></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
         {/* CARİ BAKİYE ÖZETLERİ (KARTLAR) */}
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-2">
            {parties.filter(p => p.status === 'Active').map(party => {
                const balance = getPartyBalance(party.id);
                const isSupplier = party.type === 'Supplier';
                const isCustomer = party.type === 'Customer';
                
                // Borç/Alacak Renk Mantığı
                let colorClass = 'text-neutral-500';
                let subText = '(Dengeli)';
                let showDueDate = false;

                if (balance > 0) {
                    if (isSupplier) { 
                        colorClass = 'text-red-600'; 
                        subText = '(Borçluyuz)';
                        showDueDate = true; // Tedarikçiye borç varsa vade kontrolü yap
                    }
                    else if (isCustomer) { colorClass = 'text-green-600'; subText = '(Alacaklıyız)'; }
                    else { colorClass = 'text-green-600'; subText = '(Net Alacak)'; }
                } else if (balance < 0) {
                    if (isSupplier) { colorClass = 'text-green-600'; subText = '(Alacaklıyız/Avans)'; }
                    else { colorClass = 'text-red-600'; subText = '(Borçluyuz/Avans)'; }
                }

                // Vade Bilgisini Çek
                const nextDue = showDueDate ? getNextDueInfo(party.id) : null;
                
                return (
                    <div key={party.id} className="min-w-[250px] bg-white p-4 border border-neutral-200 shadow-sm flex flex-col justify-between h-auto min-h-[140px] group hover:border-neutral-400 transition-colors relative">
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-full ${isSupplier ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {isSupplier ? <Building2 size={16}/> : <User size={16}/>}
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">{isSupplier ? 'Tedarikçi' : 'Müşteri'}</span>
                             </div>
                        </div>
                        
                        <div>
                             <h3 className="text-sm font-medium text-neutral-900 truncate" title={party.name}>{party.name}</h3>
                             <div className={`text-2xl font-light mt-1 ${colorClass}`}>
                                {formatCurrency(Math.abs(balance))} <span className="text-xs text-neutral-400 font-normal align-middle">{subText}</span>
                             </div>
                        </div>

                        {/* VADE TARİHİ ALANI - Sadece Tedarikçiye Borç Varsa ve Vade Bulunduysa */}
                        {nextDue && (
                            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                                    <CalendarClock size={14} />
                                    <span>Yaklaşan Ödeme:</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-neutral-900 font-semibold">{new Date(nextDue.date!).toLocaleDateString('tr-TR')}</div>
                                    <div className="text-neutral-500">{formatCurrency(nextDue.amount!)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
         </div>

         {/* İŞLEM LİSTESİ */}
         <div className="bg-white border border-neutral-200">
            <div className="flex border-b border-neutral-200">
                {['All', 'Inbound', 'Outbound'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
                        {tab === 'All' ? 'Tüm Hareketler' : tab === 'Inbound' ? 'Tahsilatlar' : 'Ödemeler'}
                    </button>
                ))}
            </div>
            <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase font-medium">
                    <tr>
                        <th className="px-6 py-4">Tarih</th>
                        <th className="px-6 py-4">Cari</th>
                        <th className="px-6 py-4">İşlem Tipi</th>
                        <th className="px-6 py-4 text-right">Tutar</th>
                        <th className="px-6 py-4 w-20"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {filteredPayments.map(pay => {
                        const party = parties.find(p => p.id === pay.partyId);
                        const isVoided = pay.status === 'Voided';

                        return (
                            <tr key={pay.id} className={`hover:bg-neutral-50 group transition-colors ${isVoided ? 'bg-neutral-50/50' : ''}`}>
                                <td className={`px-6 py-4 text-sm ${isVoided ? 'text-neutral-400 line-through' : 'text-neutral-600'}`}>
                                    {new Date(pay.date).toLocaleDateString('tr-TR')}
                                </td>
                                <td className={`px-6 py-4 text-sm font-medium ${isVoided ? 'text-neutral-400' : 'text-neutral-900'}`}>
                                    {party?.name}
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-2 ${isVoided ? 'opacity-50' : ''}`}>
                                        {pay.type === 'Inbound' ? <ArrowDownLeft size={16} className={isVoided ? 'text-neutral-400' : 'text-green-500'}/> : <ArrowUpRight size={16} className={isVoided ? 'text-neutral-400' : 'text-red-500'}/>}
                                        <div className="flex flex-col">
                                            <span className={`text-sm ${isVoided ? 'text-neutral-500 line-through' : 'text-neutral-700'}`}>
                                                {pay.type === 'Inbound' ? 'Tahsilat' : 'Ödeme'} ({pay.method})
                                            </span>
                                            {isVoided && <span className="text-[10px] text-red-500 font-medium flex items-center gap-1"><AlertCircle size={10}/> İPTAL EDİLDİ</span>}
                                        </div>
                                    </div>
                                    {pay.note && <div className="text-xs text-neutral-400 mt-1 italic">{pay.note} {pay.voidReason && `(İptal Nedeni: ${pay.voidReason})`}</div>}
                                </td>
                                <td className={`px-6 py-4 text-right text-sm font-light ${isVoided ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                                    {formatCurrency(pay.amount)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!isVoided && (
                                        <button onClick={() => handleVoidPayment(pay.id)} className="text-neutral-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all" title="Ödemeyi İptal Et">
                                            <Ban size={16}/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {filteredPayments.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-neutral-400 italic">Kayıt bulunamadı.</td></tr>}
                </tbody>
            </table>
         </div>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="YENİ FİNANSAL İŞLEM">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setFormData({...formData, type: 'Inbound'})} className={`py-4 border text-sm ${formData.type === 'Inbound' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-neutral-200 text-neutral-500'}`}>TAHSİLAT (GİRİŞ)</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'Outbound'})} className={`py-4 border text-sm ${formData.type === 'Outbound' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-neutral-200 text-neutral-500'}`}>ÖDEME (ÇIKIŞ)</button>
                </div>
                
                <div>
                    <label className="block text-xs text-neutral-500 uppercase font-medium mb-2">Cari Seçimi</label>
                    <select required value={formData.partyId} onChange={e => setFormData({...formData, partyId: e.target.value})} className="w-full px-4 py-3 border border-neutral-300 outline-none focus:border-neutral-900">
                        <option value="">Seçiniz...</option>
                        {parties.filter(p => p.status === 'Active').map(p => <option key={p.id} value={p.id}>{p.name} ({p.type === 'Supplier' ? 'Tedarikçi' : 'Müşteri'})</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-neutral-500 uppercase font-medium mb-2">Tutar</label>
                        <input type="number" required min="0.01" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-4 py-3 border border-neutral-300 outline-none focus:border-neutral-900"/>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 uppercase font-medium mb-2">Yöntem</label>
                        <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value as any})} className="w-full px-4 py-3 border border-neutral-300 outline-none focus:border-neutral-900">
                            <option value="Bank">Banka / Havale</option>
                            <option value="Cash">Nakit</option>
                            <option value="Card">Kredi Kartı</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-neutral-500 uppercase font-medium mb-2">Açıklama</label>
                    <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full px-4 py-3 border border-neutral-300 outline-none focus:border-neutral-900"/>
                </div>

                <button type="submit" className="w-full bg-neutral-900 text-white py-4 hover:bg-neutral-800">İŞLEMİ KAYDET</button>
            </form>
         </Modal>
      </div>
    </div>
  );
};