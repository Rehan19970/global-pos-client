import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const ResetPassword = () => {
  const { token } = useParams(); // URL se token nikalne ke liye
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
      // Backend API call (routes mein /reset-password/:token set kiya tha)
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-teal-50 to-transparent"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <KeyRound size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Set New Password</h1>
          <p className="text-slate-500 text-sm mt-1">Your new password must be different from previous used passwords.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="Enter new password (min 8 chars)"
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

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Reset Password</span> <ArrowRight size={18}/></>}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center gap-2 text-sm">
          <Link to="/login" className="text-teal-600 font-bold hover:underline">
            Back to Login
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <ShieldCheck size={12} className="text-teal-600" />
            <span>Secure Password Reset</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;