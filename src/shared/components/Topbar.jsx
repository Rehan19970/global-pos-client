import { Search, Bell, Moon, HelpCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Topbar = ({ title, subtitle }) => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      
      {/* Left Side: Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{subtitle || `Welcome back, ${user?.name?.split(' ')[0] || 'Admin'} — here is what's happening today`}</p>
      </div>

      {/* Right Side: Search & Icons */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products, orders, customers..." 
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        
        <button className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition">
          <Bell size={20} />
        </button>
        <button className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition">
          <Moon size={20} />
        </button>
        <button className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition">
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;