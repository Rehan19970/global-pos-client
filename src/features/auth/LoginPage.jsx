import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, Store, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Demo logic refs and params
  const isDemo = searchParams.get('demo') === 'true';
  const hasAutoLoggedIn = useRef(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const res = await login(email, password);
    
    if (res.success) {
      toast.success(isDemo ? 'Welcome to the Live Demo!' : 'Welcome back!');
      
      // ✅ SMART REDIRECT LOGIC (LocalStorage se User nikalein)
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      
      if (loggedInUser?.role === 'super_admin' || loggedInUser?.isDemo || loggedInUser?.role === 'demo') {
        // Agar Super Admin ya Demo hai, toh Master Panel bhejein
        window.location.href = '/secret-master-control/overview';
      } else {
        // Normal user (Cashier, Manager) ko POS bhejein
        window.location.href = '/app/dashboard'; 
      }
    } else {
      toast.error(res.message);
    }
  };

  // ✅ Auto-login effect for Demo Mode (Fixed Credentials)
  useEffect(() => {
    if (isDemo && !hasAutoLoggedIn.current) {
      setEmail('demo@globalpos.com');  // ✅ Real Demo Account
      setPassword('demo1234');          // ✅ Real Demo Password
      hasAutoLoggedIn.current = true;

      // Slight delay to let the UI update with the filled credentials
      const timer = setTimeout(() => {
        handleSubmit();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-teal-50 to-transparent"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        
        {/* Demo Mode Badge */}
        {isDemo && (
          <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl flex items-center gap-1 shadow-sm uppercase tracking-wider z-20">
            <Sparkles size={12} /> Demo Mode
          </div>
        )}

        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 relative">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">POSFlow</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="admin@globalpos.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-slate-600 font-medium">Remember me</span>
            </label>
            
            <Link to="/forgot-password" className="text-teal-600 font-bold hover:underline">Forgot password?</Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Sign In</span> <ArrowRight size={18}/></>}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center gap-2 text-sm">
          <div className="flex items-center text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/signup" className="text-teal-600 font-bold hover:underline ml-1">Create one</Link>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <ShieldCheck size={12} className="text-teal-600" />
            <span>Secure Login powered by POSFlow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;