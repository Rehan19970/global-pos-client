import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }

    setIsLoading(true);
    
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Token may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-[#0f766e] flex-col justify-between p-12 relative overflow-hidden">
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
            Secure your account.
          </h1>
          <p className="text-teal-100 text-lg mb-8 max-w-md">
            Create a strong new password to keep your business data safe and secure.
          </p>

          <div className="space-y-4">
            {['Use at least 8 characters', 'Include letters and numbers', 'Never share your password', 'Unique password for this account'].map((feature, i) => (
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#0f766e] rounded-xl flex items-center justify-center shadow-lg">
              <Store size={28} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900">POSFlow</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <div className="w-16 h-16 bg-teal-50 text-[#0f766e] rounded-2xl flex items-center justify-center mb-6 lg:mx-0 mx-auto">
              <KeyRound size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h2>
            <p className="text-slate-500 text-sm">Your new password must be different from previously used passwords.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="Enter new password"
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

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Reset Password</span> <ArrowRight size={18}/></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[#0f766e] font-bold hover:underline text-sm">
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;