import { useState, useEffect } from 'react';
import { 
  Search, UserPlus, Phone, Mail, FileText, Banknote, X, 
  ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle2, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Customers = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  
  // ✅ Currency sync state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);
  
  // States
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null); 
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  // Forms
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [selectedBranch]);

  const fetchCustomers = async () => {
    try {
      let url = '/customers';
      
      // ✅ FIX: store_admin aur super_admin dono handle karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) url = `/customers?branchId=${branchId}`;
      }

      const { data } = await api.get(url);
      setCustomers(data.customers || []); 
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    
    // ✅ FIX: store_admin ke liye bhi branch check karein
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    if (isAdminLevel) {
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      if (!branchId) {
        return toast.error('Branch ID is missing. Please try again.');
      }
    }

    try {
      const payload = { ...formData };
      
      // ✅ FIX: store_admin ke liye bhi branchId bhejein
      if (isAdminLevel) {
        payload.branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      }

      await api.post('/customers', payload);
      toast.success('Customer added!');
      setIsAddModalOpen(false);
      setFormData({ name: '', phone: '', email: '' });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    }
  };

  const handleOpenLedger = async (customer) => {
    try {
      const { data } = await api.get(`/customers/${customer._id}/ledger`);
      setSelectedCustomer(data.customer); 
    } catch (error) {
      toast.error('Failed to load customer ledger');
    }
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return toast.error('Enter valid amount');
    
    try {
      await api.post(`/customers/${selectedCustomer._id}/receive-payment`, { 
        amount: Number(paymentAmount),
        description: paymentNote || 'Manual Payment Received'
      });
      toast.success('Payment recorded successfully!');
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNote('');
      
      const { data } = await api.get(`/customers/${selectedCustomer._id}/ledger`);
      setSelectedCustomer(data.customer);
      
      fetchCustomers(); 
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleViewInvoice = async (saleId) => {
    try {
      const { data } = await api.get(`/customers/sales/${saleId}`);
      setSelectedInvoice(data.sale);
      setIsInvoiceModalOpen(true);
    } catch (error) {
      toast.error('Invoice details not found');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  // ✅ Currency formatter
  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  // ==========================================
  // CUSTOMER PROFILE / LEDGER PAGE (Full Window)
  // ==========================================
  if (selectedCustomer) {
    return (
      <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('customerKhata')}</h1>
            <p className="text-sm text-slate-500">Detailed history and balance for {selectedCustomer.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Customer Info & Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-teal-600"></div>
              <div className="relative z-10 mt-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-3xl font-black">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-4">{selectedCustomer.name}</h2>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Phone size={14}/> {selectedCustomer.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={14}/> {selectedCustomer.email || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 mb-4">
                  <p className="text-sm text-red-600 font-bold uppercase tracking-wide">{t('totalUdhaarPending')}</p>
                  <p className="text-4xl font-black text-red-700 mt-1">{fmt(selectedCustomer.totalUdhaar)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase">{t('totalSpent')}</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{fmt(selectedCustomer.totalSpent)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                    <p className="text-xs text-purple-500 font-bold uppercase">{t('loyaltyPoints')}</p>
                    <p className="text-lg font-bold text-purple-700 mt-1">{selectedCustomer.loyaltyPoints}</p>
                  </div>
                </div>
                <button onClick={() => setIsPaymentModalOpen(true)} className="w-full mt-6 bg-[#0f766e] hover:bg-[#115e59] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20">
                  <Banknote size={20} /> {t('receivePayment')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Transaction History (Ledger) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Clock size={20} className="text-teal-600"/> {t('transactionHistory')}</h3>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">{selectedCustomer.ledger?.length || 0} {t('entries')}</span>
              </div>

              <div className="space-y-4">
                {selectedCustomer.ledger && selectedCustomer.ledger.length > 0 ? (
                  [...selectedCustomer.ledger].reverse().map((entry, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white transition gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${entry.type === 'Payment' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {entry.type === 'Payment' ? <TrendingDown size={22}/> : <TrendingUp size={22}/>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{entry.description}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(entry.date).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center sm:flex-col justify-between sm:text-right gap-2">
                        <p className={`font-black text-lg ${entry.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {entry.amount > 0 ? '+' : ''}{fmt(entry.amount)}
                        </p>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.type === 'Payment' ? t('received') : t('newCredit')}</p>
                          {entry.saleId && (
                            <button onClick={() => handleViewInvoice(entry.saleId)} className="flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md hover:bg-teal-100 transition">
                              <Eye size={12}/> {t('viewBill')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">{t('noTransactions')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* 1. Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">{t('receivePayment')}</h2>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
              </div>
              <form onSubmit={handleReceivePayment} className="p-6 space-y-4">
                <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm font-bold text-center border border-red-100">
                  {t('totalPending')}: {fmt(selectedCustomer.totalUdhaar)}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('amountReceived')} *</label>
                  <input type="number" required min="1" max={selectedCustomer.totalUdhaar} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-xl font-black" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('noteOptional')}</label>
                  <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-teal-500 text-sm" placeholder="e.g. Cash payment" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100">{t('cancel')}</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2"><Banknote size={16}/> {t('confirm')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Invoice Modal (Bill Details) */}
        {isInvoiceModalOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t('invoiceDetails')}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5"># {selectedInvoice.invoiceNumber}</p>
                </div>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-800 bg-white p-1 rounded-full border border-slate-200"><X size={20}/></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between text-sm mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold">{t('customer')}</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.customerId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs uppercase font-bold">{t('date')}</p>
                    <p className="font-bold text-slate-900">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <table className="w-full text-left mb-4">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2 font-bold">{t('item')}</th>
                      <th className="p-2 font-bold text-center">{t('qty')}</th>
                      <th className="p-2 font-bold text-right">{t('price')}</th>
                      <th className="p-2 font-bold text-right">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium text-slate-800">{item.name}</td>
                        <td className="p-2 text-center text-slate-600">{item.qty}</td>
                        <td className="p-2 text-right text-slate-600">{fmt(item.perUnitPrice || item.price)}</td>
                        <td className="p-2 text-right font-bold text-slate-900">{fmt(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{t('subtotal')}</span>
                    <span>{fmt(selectedInvoice.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{t('tax')}</span>
                    <span>{fmt(selectedInvoice.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-black text-xl text-slate-900 pt-2 border-t border-slate-100">
                    <span>{t('grandTotal')}</span>
                    <span className="text-teal-600">{fmt(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div className="text-right text-xs text-slate-500 mt-1">{t('paidVia')} {selectedInvoice.paymentMethod}</div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsInvoiceModalOpen(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold">{t('close')}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // MAIN CUSTOMERS LIST
  // ==========================================
  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <UserPlus className="text-teal-600" size={32} /> {t('customersKhata')}
          </h1>
          <p className="text-slate-500 mt-1">Manage customers, loyalty, and credit (Udhaar)</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder={t('searchByNamePhone')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-md transition text-sm font-bold whitespace-nowrap">
            <UserPlus size={18} /> {t('addCustomer')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="p-4 font-bold pl-6">{t('customer')}</th>
                <th className="p-4 font-bold">{t('contact')}</th>
                <th className="p-4 font-bold text-center">{t('loyaltyPoints')}</th>
                <th className="p-4 font-bold">{t('totalSpent')}</th>
                <th className="p-4 font-bold text-red-600">{t('udhaarKhata')}</th>
                <th className="p-4 font-bold text-center">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-slate-50 transition group cursor-pointer" onClick={() => handleOpenLedger(customer)}>
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-blue-600 group-hover:bg-teal-600 transition">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-teal-600 group-hover:underline">{customer.name}</p>
                        <p className="text-xs text-slate-500">{t('joined')}: {new Date(customer.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400"/> {customer.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400"/> {customer.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                      {customer.loyaltyPoints} {t('pts')}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800 text-sm">{fmt(customer.totalSpent)}</td>
                  <td className="p-4">
                    {customer.totalUdhaar > 0 ? (
                      <div>
                        <p className="font-bold text-red-600 text-lg">{fmt(customer.totalUdhaar)}</p>
                        <p className="text-[10px] text-slate-500">{t('udhaarPending')}</p>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">{t('clear')}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button className="flex items-center gap-1.5 mx-auto bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                      <FileText size={14} /> {t('viewKhata')}
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">
                    {t('noCustomersFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('addNewCustomer')}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('fullName')} *</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Ali Khan" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('phoneNumber')} *</label><input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="03xx-xxxxxxx" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('emailOptional')}</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="ali@email.com" /></div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">{t('cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59]">{t('saveCustomer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;