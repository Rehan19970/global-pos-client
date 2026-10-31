import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        
        <div className="px-8 pt-10 pb-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Forgot Password?</h1>
          <p className="text-slate-500 text-sm mt-1">No worries, we'll send you reset instructions.</p>
        </div>

        {isSent ? (
          <div className="p-8 text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
              We have sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline">
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800" 
                  placeholder="Enter your registered email"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
            </button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;