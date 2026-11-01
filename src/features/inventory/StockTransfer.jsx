import { useState, useEffect } from 'react';
import { Plus, X, Check, ArrowRightLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const StockTransfer = () => {
  const [transfers, setTransfers] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Transfer Form State
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ fromBranch: '', toBranch: '', productId: '', quantity: 1 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Jab From Branch change ho, to us branch ke products fetch karein
  useEffect(() => {
    if (formData.fromBranch) {
      fetchProducts(formData.fromBranch);
    } else {
      setProducts([]);
    }
  }, [formData.fromBranch]);

  const fetchInitialData = async () => {
    try {
      const bRes = await api.get('/branches');
      setBranches(bRes.data);

      try {
        const tRes = await api.get('/inventory/transfer'); 
        setTransfers(tRes.data);
      } catch (err) {
        console.log("Could not fetch transfers:", err);
      }

    } catch (error) {
      toast.error('Failed to load branches');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (branchId) => {
    try {
      const pRes = await api.get(`/products?branchId=${branchId}`);
      setProducts(pRes.data.products || pRes.data);
    } catch (error) {
      toast.error('Failed to load products for this branch');
      setProducts([]);
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (formData.fromBranch === formData.toBranch) return toast.error("Branches cannot be same!");
    if (!formData.productId) return toast.error("Please select a product");

    try {
      await api.post('/inventory/transfer', {
        fromBranch: formData.fromBranch,
        toBranch: formData.toBranch,
        productId: formData.productId,
        quantity: Number(formData.quantity)
      });
      toast.success('Transfer Created!');
      setIsModalOpen(false);
      setFormData({ fromBranch: '', toBranch: '', productId: '', quantity: 1 });
      
      const tRes = await api.get('/inventory/transfer');
      setTransfers(tRes.data);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Transfers...</div>;

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="text-teal-600" size={28} /> Inventory Transfers
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage stock movement between branches</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-sm transition text-sm font-bold w-full md:w-auto">
          <Plus size={18} /> New Transfer
        </button>
      </div>

      {/* TRANSFER LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        
        {/* MOBILE VIEW (Cards) */}
        <div className="md:hidden p-4 space-y-3">
          {transfers.map(t => (
            <div key={t._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(t.createdAt).toLocaleDateString()}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{t.status}</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">From</p>
                   <p className="font-bold text-xs text-slate-800 truncate">{t.fromBranch?.name || 'N/A'}</p>
                </div>
                <div className="px-2 text-slate-300"><ArrowRightLeft size={16} /></div>
                <div className="text-center flex-1">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">To</p>
                   <p className="font-bold text-xs text-slate-800 truncate">{t.toBranch?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Product</p>
                  <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{t.productId?.name || 'N/A'}</p>
                  <p className="text-[10px] font-bold text-teal-600 mt-0.5">Qty: {t.quantity}</p>
                </div>
                <button onClick={() => setSelectedTransfer(t)} className="text-teal-600 font-bold bg-white border border-teal-200 px-3 py-1.5 rounded-lg text-xs shadow-sm hover:bg-teal-50">Track</button>
              </div>
            </div>
          ))}
          {transfers.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No transfers yet.</div>}
        </div>

        {/* DESKTOP VIEW (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">From</th>
                <th className="p-4 font-semibold">To</th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Qty</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transfers.map(t => (
                <tr key={t._id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-slate-800">{t.fromBranch?.name || 'N/A'}</td>
                  <td className="p-4 font-medium text-slate-800">{t.toBranch?.name || 'N/A'}</td>
                  <td className="p-4 text-slate-600">{t.productId?.name || 'N/A'}</td>
                  <td className="p-4 font-bold text-slate-900">{t.quantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{t.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedTransfer(t)} className="text-teal-600 font-medium hover:underline text-xs">Track</button>
                  </td>
                </tr>
              ))}
              {transfers.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">No transfers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* TIMELINE MODAL */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-5 md:p-6 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setSelectedTransfer(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-full"><X size={18} /></button>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6">Transfer Timeline</h2>
            
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
               <div className="relative pl-6">
                  <div className="absolute -left-[11px] top-0 bg-green-500 text-white rounded-full p-0.5 border-2 border-white"><Check size={12} /></div>
                  <h4 className="font-bold text-sm text-slate-900">Transfer Created</h4>
                  <p className="text-xs text-slate-500">{new Date(selectedTransfer.createdAt).toLocaleString()}</p>
               </div>
               <div className="relative pl-6">
                  <div className="absolute -left-[11px] top-0 bg-blue-500 rounded-full w-2.5 h-2.5 border-2 border-white mt-1.5"></div>
                  <h4 className="font-bold text-sm text-blue-600">In Transit</h4>
                  <p className="text-xs text-slate-500">Moving from {selectedTransfer.fromBranch?.name} to {selectedTransfer.toBranch?.name}</p>
               </div>
               <div className="relative pl-6">
                  <div className="absolute -left-[11px] top-0 bg-white border-2 border-slate-300 rounded-full w-2.5 h-2.5 mt-1.5"></div>
                  <h4 className="font-bold text-sm text-slate-400">Delivered</h4>
                  <p className="text-xs text-slate-400">Pending</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TRANSFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5 md:p-6 relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-full"><X size={18} /></button>
             <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6">Create New Transfer</h2>
             
             <form onSubmit={handleCreateTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">From Branch</label>
                  <select required value={formData.fromBranch} onChange={e => setFormData({...formData, fromBranch: e.target.value, productId: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">To Branch</label>
                  <select required value={formData.toBranch} onChange={e => setFormData({...formData, toBranch: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Product</label>
                  <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  {formData.fromBranch && products.length === 0 && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium">No products found in selected branch.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Quantity</label>
                  <input type="number" min="1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                </div>
                <button type="submit" className="w-full bg-[#0f766e] hover:bg-[#115e59] text-white font-bold py-3 rounded-xl mt-4 shadow-md transition text-sm">Initiate Transfer</button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockTransfer;