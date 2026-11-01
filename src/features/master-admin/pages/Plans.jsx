import { useState, useEffect } from 'react';
import { Plus, Edit, CheckCircle, X } from 'lucide-react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', priceMonthly: '', priceYearly: '', features: '' });

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/master-admin/plans');
      setPlans(data.plans);
    } catch (error) {
      toast.error('Failed to load plans');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
      const payload = {
        planId: editingPlan?._id,
        name: formData.name,
        priceMonthly: Number(formData.priceMonthly),
        priceYearly: Number(formData.priceYearly),
        features: featuresArray,
        isActive: true
      };
      
      await api.post('/master-admin/plans', payload);
      toast.success(editingPlan ? 'Plan updated!' : 'Plan created!');
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to save plan');
    }
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({ 
      name: plan.name, 
      priceMonthly: plan.priceMonthly, 
      priceYearly: plan.priceYearly, 
      features: plan.features.join(', ') 
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Pricing Plans</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Create and manage your SaaS subscription plans.</p>
        </div>
        <button onClick={() => { setEditingPlan(null); setFormData({ name: '', priceMonthly: '', priceYearly: '', features: '' }); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md transition">
          <Plus size={16} className="md:w-4.5 md:h-4.5" /> Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {plans.map(plan => (
          <div key={plan._id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative group">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold text-slate-900">{plan.name}</h3>
              <button onClick={() => openEdit(plan)} className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit size={16} className="md:w-4.5 md:h-4.5"/></button>
            </div>
            
            <div className="mb-3 md:mb-4">
              <p className="text-2xl md:text-3xl font-black text-slate-900">PKR {plan.priceMonthly}</p>
              <p className="text-xs md:text-sm text-slate-500">/ month</p>
              <p className="text-xs md:text-sm font-bold text-teal-600 mt-1">PKR {plan.priceYearly} / year</p>
            </div>
            
            <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <CheckCircle size={14} className="md:w-4 md:h-4 text-green-500 shrink-0 mt-0.5" /> <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-3 md:pt-4 border-t border-slate-100">
              <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 text-sm">
            No plans created yet. Click "Create Plan" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-base md:text-lg font-bold text-slate-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 md:p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full border border-slate-200"><X size={16} className="md:w-4.5 md:h-4.5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Plan Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="e.g. Basic Plan" />
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[10px] md:text-sm font-bold text-slate-700 mb-1">Monthly Price (PKR)</label>
                  <input type="number" required value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-sm font-bold text-slate-700 mb-1">Yearly Price (PKR)</label>
                  <input type="number" required value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Features (Comma Separated)</label>
                <textarea required value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none h-24 resize-none text-sm" placeholder="1 Branch, 5 Users, Basic POS, Email Support" />
              </div>
              
              <div className="pt-3 md:pt-4 flex flex-col-reverse sm:flex-row gap-2 md:gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 text-sm">Cancel</button>
                <button type="submit" className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-sm">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;