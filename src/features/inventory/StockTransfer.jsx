import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
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
      // 1. Branches fetch karein
      const bRes = await api.get('/branches');
      setBranches(bRes.data);

      // 2. Transfer History fetch karein (Backend se)
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

  // 🚨 FIX: From Branch select hone par us branch ke products fetch karein
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
      
      // Transfer list refresh karein
      const tRes = await api.get('/inventory/transfer');
      setTransfers(tRes.data);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Transfers</h1>
          <p className="text-slate-500 mt-1">Manage stock movement between branches</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2 rounded-xl shadow-sm transition text-sm font-medium">
          <Plus size={18} /> New Transfer
        </button>
      </div>

      {/* TRANSFER LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
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

      {/* TIMELINE MODAL */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button onClick={() => setSelectedTransfer(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X size={20} /></button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Transfer Timeline</h2>
            
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X size={20} /></button>
             <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Transfer</h2>
             <form onSubmit={handleCreateTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Branch</label>
                  <select required value={formData.fromBranch} onChange={e => setFormData({...formData, fromBranch: e.target.value, productId: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Branch</label>
                  <select required value={formData.toBranch} onChange={e => setFormData({...formData, toBranch: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                  <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  {formData.fromBranch && products.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No products found in selected branch.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input type="number" min="1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" />
                </div>
                <button type="submit" className="w-full bg-[#0f766e] hover:bg-[#115e59] text-white font-bold py-3 rounded-xl mt-2">Initiate Transfer</button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockTransfer;