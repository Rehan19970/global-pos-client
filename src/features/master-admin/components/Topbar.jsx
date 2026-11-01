import { Search, Bell, User, ArrowRightLeft } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

const Topbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 shrink-0 shadow-sm z-10 gap-2">
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-[200px] sm:max-w-xs md:w-96">
        <Search className="absolute left-2.5 md:left-3 top-2.5 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-slate-100 border border-transparent rounded-xl py-2 pl-8 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
        />
      </div>

      {/* Right Side - Profile & Notifications */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        
        {/* ✅ NAYA: Quick Switch to POS (Hidden on Mobile) */}
        <button 
          onClick={() => window.location.href = '/app/pos'}
          className="hidden lg:flex items-center gap-2 text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition border border-teal-200"
        >
          <ArrowRightLeft size={16} />
          Switch to POS
        </button>

        <button className="relative p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 transition">
          <Bell size={18} className="md:w-5 md:h-5" />
          <span className="absolute top-1 md:top-1.5 right-1 md:right-1.5 w-1.5 md:w-2 h-1.5 md:h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-2 md:gap-3 cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800">{user?.name || 'Master Admin'}</p>
            <p className="text-[11px] text-indigo-600 font-semibold uppercase">Super Admin</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <User size={16} className="md:w-5 md:h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;