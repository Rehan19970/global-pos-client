import { useState } from 'react';
import { Save, Globe, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [formData, setFormData] = useState({
    platformName: 'ROSHYS SaaS',
    supportEmail: 'support@roshys.com',
    currency: 'PKR',
    paymentGateway: 'Manual / SadaBiz',
    autoLockOnExpiry: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Master settings saved successfully!');
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Master Settings</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Configure your SaaS platform global settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
        
        {/* General Settings */}
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 md:mb-4 border-b border-slate-100 pb-2 md:pb-3">
            {/* ✅ FIX: className ek hi dafa likha hai */}
            <Globe className="text-indigo-600 w-4.5 h-4.5 md:w-5 md:h-5" />
            <h2 className="text-base md:text-lg font-bold text-slate-800">Platform Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Platform Name</label>
              <input type="text" value={formData.platformName} onChange={e => setFormData({...formData, platformName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Support Email</label>
              <input type="email" value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Default Currency</label>
              <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">Payment Gateway</label>
              <select value={formData.paymentGateway} onChange={e => setFormData({...formData, paymentGateway: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="Manual / SadaBiz">Manual / SadaBiz</option>
                <option value="Echo Money">Echo Money</option>
                <option value="Safepay">Safepay</option>
                <option value="Stripe">Stripe (International)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 md:mb-4 border-b border-slate-100 pb-2 md:pb-3">
            {/* ✅ FIX: className ek hi dafa likha hai */}
            <ShieldCheck className="text-indigo-600 w-4.5 h-4.5 md:w-5 md:h-5" />
            <h2 className="text-base md:text-lg font-bold text-slate-800">System Rules</h2>
          </div>
          
          <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3 p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-800 text-xs md:text-sm">Auto Lock on Expiry</p>
              <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">If enabled, clients cannot create bills if their subscription expires.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end min-[420px]:self-auto">
              <input type="checkbox" className="sr-only peer" checked={formData.autoLockOnExpiry} onChange={e => setFormData({...formData, autoLockOnExpiry: e.target.checked})} />
              <div className="w-10 md:w-11 h-5 md:h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 md:after:h-5 after:w-4 md:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 md:px-6 py-2.5 rounded-xl font-bold shadow-md transition text-sm">
            <Save className="w-4 h-4 md:w-4.5 md:h-4.5" /> Save Settings
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;