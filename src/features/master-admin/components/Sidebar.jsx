import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Store, CreditCard, FileText, Settings, LogOut, ShieldCheck, MonitorPlay, Loader2, X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';
import useAuthStore from '../../../store/authStore';

const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const location = useLocation();
  const { logout } = useAuthStore();
  const [isSwitching, setIsSwitching] = useState(false);

  const menuItems = [
    { name: 'Overview', path: '/secret-master-control/overview', icon: LayoutDashboard },
    { name: 'Clients & Stores', path: '/secret-master-control/clients', icon: Store },
    { name: 'Pricing Plans', path: '/secret-master-control/plans', icon: CreditCard },
    { name: 'Subscriptions', path: '/secret-master-control/subscriptions', icon: FileText },
    { name: 'Master Settings', path: '/secret-master-control/settings', icon: Settings },
  ];

  const handleGoToStore = async () => {
    setIsSwitching(true);
    try {
      const { data } = await api.get('/master-admin/my-store-token');
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast.success(`Welcome to ${data.user.name}'s Store!`);
        window.location.href = '/app/pos';
      } else {
        toast.error('Store account not configured properly.');
      }
    } catch (error) {
      toast.error('My Store account not found! Please create a new store via Signup first.');
    } finally {
      setIsSwitching(false);
    }
  };

  // ✅ Mobile par link click karne se menu band ho jaye
  const handleLinkClick = () => {
    if (closeMobileMenu) closeMobileMenu();
  };

  return (
    <>
      {/* ✅ MOBILE OVERLAY (Black Background) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* ✅ SIDEBAR CONTAINER */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-64 bg-[#1e1b4b] text-white flex flex-col shadow-2xl h-full py-4 border-r border-indigo-900/50 
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Area with Close Button */}
        <div className="flex items-center justify-between px-6 mb-8 mt-2">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg overflow-hidden p-1">
              <img src="/logo.svg" alt="ROSHYS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Master Admin</h1>
              <p className="text-[10px] text-indigo-300 font-medium tracking-widest uppercase">SaaS Control</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={closeMobileMenu} className="lg:hidden text-indigo-300 hover:text-white p-1.5 bg-white/10 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[11px] font-bold text-indigo-400/70 uppercase tracking-wider mb-2 px-3">Main Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-indigo-400'} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="px-4 mt-auto space-y-2">
          
          <button 
            onClick={handleGoToStore}
            disabled={isSwitching}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-teal-900/20"
          >
            {isSwitching ? <Loader2 className="animate-spin" size={18} /> : <MonitorPlay size={18} />}
            <span className="text-sm">{isSwitching ? 'Switching...' : 'Go to My Store'}</span>
          </button>

          <button 
            onClick={() => { logout(); handleLinkClick(); }} 
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Exit Master Mode</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;