import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Lock, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data } = await api.post('/auth/register-store', formData);
      
      if (data.success) {
        toast.success('Account created successfully! Please login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT SIDE - BRANDING (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-[#0f766e] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-12 right-12 w-72 h-72 bg-teal-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-16">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Store size={28} className="text-[#0f766e]" />
            </div>
            <span className="text-2xl font-black tracking-wide">POSFlow</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Start your journey with POSFlow today.
          </h1>
          <p className="text-teal-100 text-lg mb-8 max-w-md">
            Join thousands of retailers who are scaling their business with our cloud POS system.
          </p>

          <div className="space-y-4">
            {['Free 14-day trial', 'No credit card required', 'Cancel anytime', '24/7 customer support'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <CheckCircle2 size={20} className="text-teal-300" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-teal-200 text-sm flex items-center gap-2">
          <ShieldCheck size={16} /> Enterprise-grade security
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-md py-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#0f766e] rounded-xl flex items-center justify-center shadow-lg">
              <Store size={28} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900">POSFlow</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your store</h2>
            <p className="text-slate-500">Get started for free. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Store Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" name="storeName" required
                  value={formData.storeName} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="e.g. FreshMart Superstore"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Owner Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="e.g. Ali Khan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="email" name="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="admin@store.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="password" name="password" required minLength="6"
                  value={formData.password} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Create Account</span> <ArrowRight size={18}/></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0f766e] font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;