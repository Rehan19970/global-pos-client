import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Backend API call
      const { data } = await api.post('/auth/register-store', formData);
      
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-teal-50 to-transparent"></div>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        <div className="px-8 pt-10 pb-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create your Store</h1>
          <p className="text-slate-500 text-sm mt-1">Start managing your business in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Store Name</label>
            <div className="relative">
              <Store className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" required
                value={formData.storeName}
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="e.g. FreshMart Superstore"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Owner Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="e.g. Ali Khan"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="admin@store.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" required minLength="6"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Create Account</span> <ArrowRight size={18}/></>}
          </button>
        </form>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center text-sm">
          <span className="text-slate-500">Already have an account? </span>
          <Link to="/login" className="text-teal-600 font-bold hover:underline ml-1">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;