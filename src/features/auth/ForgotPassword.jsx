import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, KeyRound, ShieldCheck, CheckCircle2, Store } from 'lucide-react';
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
            Don't worry, we've got you covered.
          </h1>
          <p className="text-teal-100 text-lg mb-8 max-w-md">
            Getting back into your account is quick and secure. We'll send you a link to reset your password.
          </p>

          <div className="space-y-4">
            {['Secure password reset process', 'Instant email delivery', 'No data loss', '24/7 support available'].map((feature, i) => (
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

          {!isSent ? (
            <>
              <div className="text-center lg:text-left mb-8">
                <div className="w-16 h-16 bg-teal-50 text-[#0f766e] rounded-2xl flex items-center justify-center mb-6 lg:mx-0 mx-auto">
                  <KeyRound size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
                <p className="text-slate-500 text-sm">No worries, we'll send you reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input 
                      type="email" required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800" 
                      placeholder="Enter your registered email"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 mb-8">We've sent a password reset link to <br/><strong>{email}</strong></p>
              <button onClick={() => setIsSent(false)} className="text-sm font-bold text-[#0f766e] hover:underline">Didn't receive? Try again</button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#0f766e] transition">
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;