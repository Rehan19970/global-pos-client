import { useState, useEffect } from 'react';
import { Search, X, User, Phone, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import useAuthStore from '../../../store/authStore';

const CustomerModal = ({ onSelectCustomer, onClose, selectedBranch }) => {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // View Switch: 'list' ya 'add'
  const [view, setView] = useState('list'); 
  
  // Naya Customer Form State
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (view === 'list') {
      fetchCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedBranch]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      let url = '/customers';
      
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) {
          url = `/customers?branchId=${branchId}`;
        } else {
          setCustomers([]); 
          setIsLoading(false);
          return;
        }
      }
      
      const { data } = await api.get(url);
      setCustomers(data.customers || []);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    
    if (isAdminLevel) {
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      if (!branchId) {
        return toast.error('Branch ID is missing. Please try again.');
      }
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData };

      if (isAdminLevel) {
        payload.branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      }

      const { data } = await api.post('/customers', payload);
      toast.success('Customer added successfully!');
      onSelectCustomer(data.customer || data); 
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      {/* ✅ FIX: Mobile par bottom sheet style, desktop par center modal */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            {view === 'add' && (
              <button onClick={() => setView('list')} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition">
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {view === 'list' ? 'Select Customer' : 'Add New Customer'}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500">
                {view === 'list' ? 'Search by name or phone' : 'Enter details for new customer'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:text-slate-800 transition">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* ================= VIEW 1: CUSTOMER LIST ================= */}
        {view === 'list' && (
          <>
            <div className="p-3 sm:p-4 bg-white border-b border-slate-100 flex gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 sm:top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Type name or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <button 
                onClick={() => setView('add')} 
                className="bg-[#0f766e] hover:bg-[#115e59] text-white px-3 sm:px-4 rounded-xl flex items-center gap-1 text-xs sm:text-sm font-bold shadow-sm transition"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" /> New
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50 min-h-[250px]">
              {isLoading ? (
                <p className="text-center text-slate-500 py-8 text-sm">Loading...</p>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-10">
                  <User size={36} className="mx-auto text-slate-300 mb-2 sm:mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No customer found</p>
                  <button onClick={() => setView('add')} className="text-teal-600 text-sm font-bold mt-2 hover:underline">+ Add New Customer</button>
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div 
                    key={customer._id} 
                    onClick={() => { onSelectCustomer(customer); onClose(); }}
                    className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-teal-500 cursor-pointer transition flex items-center justify-between group active:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{customer.name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10} className="sm:w-3 sm:h-3" /> {customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-[9px] sm:text-xs text-slate-500">Points</p>
                      <p className="font-bold text-teal-600 text-xs sm:text-sm">{customer.loyaltyPoints}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ================= VIEW 2: ADD NEW CUSTOMER ================= */}
        {view === 'add' && (
          <form onSubmit={handleAddCustomer} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm" placeholder="e.g. Ali Khan" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
              <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm" placeholder="e.g. 03001234567" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm" placeholder="ali@email.com" />
            </div>
            
            <div className="pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md transition flex justify-center items-center gap-2 text-sm">
                {isSubmitting ? 'Saving...' : 'Save & Select Customer'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default CustomerModal;