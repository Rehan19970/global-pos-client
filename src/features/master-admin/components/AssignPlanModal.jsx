import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';

const AssignPlanModal = ({ client, onClose, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    planId: '',
    durationMonths: 1,
    status: 'Active'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/master-admin/plans');
        setPlans(data.plans);
      } catch (error) {
        toast.error('Failed to load plans');
      }
    };
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.planId) return toast.error('Please select a plan');
    
    setIsLoading(true);
    try {
      await api.post('/master-admin/subscription', {
        branchId: client._id,
        planId: formData.planId,
        durationMonths: Number(formData.durationMonths),
        status: formData.status
      });
      toast.success('Subscription updated!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Manage Subscription</h2>
            <p className="text-xs text-slate-500">{client.storeName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Select Plan *</label>
            <select 
              required
              value={formData.planId} 
              onChange={e => setFormData({...formData, planId: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose Plan --</option>
              {plans.map(p => (
                <option key={p._id} value={p._id}>{p.name} (Monthly: {p.priceMonthly} PKR)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Duration (Months) *</label>
            <input 
              type="number" 
              min="1"
              required
              value={formData.durationMonths} 
              onChange={e => setFormData({...formData, durationMonths: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Status *</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} /> {isLoading ? 'Saving...' : 'Update Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignPlanModal;