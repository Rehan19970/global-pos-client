import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, Store, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isDemo = searchParams.get('demo') === 'true';
  const hasAutoLoggedIn = useRef(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const res = await login(email, password);
    
    if (res.success) {
      toast.success(isDemo ? 'Welcome to the Live Demo!' : 'Welcome back!');
      
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      
      if (loggedInUser?.role === 'super_admin' || loggedInUser?.isDemo || loggedInUser?.role === 'demo') {
        window.location.href = '/secret-master-control/overview';
      } else {
        window.location.href = '/app/dashboard'; 
      }
    } else {
      toast.error(res.message);
    }
  };

  useEffect(() => {
    if (isDemo && !hasAutoLoggedIn.current) {
      setEmail('demo@globalpos.com');
      setPassword('demo1234');
      hasAutoLoggedIn.current = true;
      const timer = setTimeout(() => handleSubmit(), 600);
      return () => clearTimeout(timer);
    }
  }, [isDemo]);

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
            {/* ✅ NAYA LOGO YAHAN LAGA HAI */}
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1">
              <img src="/logo.svg" alt="ROSHYS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black tracking-wide">ROSHYS</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Manage your entire retail business from one place.
          </h1>
          <p className="text-teal-100 text-lg mb-8 max-w-md">
            The ultimate cloud-based POS system designed for modern retail stores. Track sales, manage inventory, and grow faster.
          </p>

          <div className="space-y-4">
            {['Multi-Branch Management', 'Real-time Inventory Tracking', 'Detailed Analytics & Reports', 'Secure & Reliable'].map((feature, i) => (
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        
        {isDemo && (
          <div className="absolute top-6 right-6 bg-teal-50 text-teal-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-teal-200 animate-pulse">
            <Sparkles size={14} /> Demo Mode Active
          </div>
        )}

        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            {/* ✅ MOBILE KE LIYE NAYA LOGO */}
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1">
              <img src="/logo.svg" alt="ROSHYS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black text-slate-900">ROSHYS</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="admin@globalpos.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#0f766e] font-bold hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e]" />
                <span className="text-sm text-slate-600 font-medium">Remember for 30 days</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Sign In</span> <ArrowRight size={18}/></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#0f766e] font-bold hover:underline">Create an account</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;