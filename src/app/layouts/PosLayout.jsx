import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, FileText, Users, 
  Box, TrendingUp, Settings, UserCog, 
  HelpCircle, Store, ArrowRightLeft, Truck, Tag,
  ChevronDown, Activity, LogOut, Download
} from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const PosLayout = () => {
  const { user, logout, selectedBranch, setSelectedBranch } = useAuthStore();
  const { t } = useLanguage();
  const [branches, setBranches] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const isGlobalView = user?.role === 'super_admin' && !selectedBranch;

  useEffect(() => {
    if (user?.role === 'super_admin' || user?.role === 'store_admin' || user?.role === 'manager') {
      fetchBranches();
    }
  }, [user]);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainMenu = [
    { name: t('dashboard'), path: '/app/dashboard', icon: LayoutDashboard },
    ...(!isGlobalView ? [
      { name: t('pos'), path: '/app/pos', icon: ShoppingCart },
      { name: t('products'), path: '/app/products', icon: Package },
      { name: t('categories'), path: '/app/categories', icon: Tag },
      { name: t('orders'), path: '/app/orders', icon: FileText },
      { name: t('customers'), path: '/app/customers', icon: Users },
      { name: t('inventory'), path: '/app/inventory', icon: Box },
      { name: t('purchases'), path: '/app/purchases', icon: Truck }, 
      { name: t('stockTransfer'), path: '/app/stock-transfer', icon: ArrowRightLeft }, 
      { name: t('activityLogs'), path: '/app/activity-logs', icon: Activity },
    ] : []),
    { name: t('reports'), path: '/app/reports', icon: TrendingUp },
  ];

  const settingsMenu = [
    ...(!isGlobalView ? [
      { name: t('settings'), path: '/app/settings', icon: Settings },
      { name: t('team'), path: '/app/team', icon: UserCog },
    ] : []),
    { name: t('helpSupport'), path: '/app/support', icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden p-4 gap-4">
      
      {/* SIDEBAR - Master Admin Style */}
      <aside className="w-64 bg-[#1e1b4b] text-white flex flex-col shadow-2xl h-full py-4 border-r border-indigo-900/50 rounded-3xl overflow-hidden">
        
        {/* ✅ ROSHYS Logo Area */}
        <div className="flex items-center px-6 mb-8 mt-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg overflow-hidden p-1">
            <img src="/logo.svg" alt="ROSHYS Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ROSHYS</h1>
            <p className="text-[10px] text-indigo-300 font-medium tracking-widest uppercase">POS SYSTEM</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar">
          
          {isGlobalView && (
            <div className="bg-indigo-900/50 border border-indigo-700/50 rounded-xl p-3 mx-1 mb-2">
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Global View</p>
              <p className="text-xs text-indigo-100 leading-tight">Select a specific branch to manage data.</p>
            </div>
          )}

          {/* Main Menu */}
          <div>
            <p className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-wider mb-2 px-3">Main Menu</p>
            <nav className="space-y-1">
              {mainMenu.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={isActive ? 'text-white' : 'text-indigo-400'} />
                      <span className="font-medium text-[13px]">{item.name}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Settings Menu */}
          <div className="pb-4">
            <p className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-wider mb-2 px-3">Settings</p>
            <nav className="space-y-1">
              {settingsMenu.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-indigo-400'} />
                    <span className="font-medium text-[13px]">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Branches Menu */}
          {(user?.role === 'super_admin' || user?.role === 'store_admin' || user?.role === 'manager') && (
            <div className="pb-4 border-t border-indigo-900/50 pt-4">
              <p className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-wider mb-2 px-3">Administration</p>
              <nav className="space-y-1">
                <Link
                  to="/app/branches"
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 ${
                    location.pathname.startsWith('/app/branches') 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Store size={18} className={location.pathname.startsWith('/app/branches') ? 'text-white' : 'text-indigo-400'} />
                  <span className="font-medium text-[13px]">{t('branches')}</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Profile Area */}
        <div className="px-4 mt-auto">
          <div className="flex items-center justify-between bg-[#2d2a5e] p-2.5 rounded-xl cursor-pointer hover:bg-[#38357a] transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center text-white font-bold border border-indigo-400/30">
                 {user?.name?.charAt(0) || 'E'}
              </div>
              <div>
                <p className="text-[13px] font-bold text-white leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-indigo-300 capitalize">{user?.role?.replace('_', ' ') || 'Manager'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-indigo-300 hover:text-white transition">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        {/* TOP BAR with Branch Selector and Install Button */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              {user?.role === 'super_admin' 
                ? (isGlobalView ? 'Global Admin' : 'Super Admin Panel') 
                : user?.role === 'store_admin' 
                  ? 'Store Admin Panel' 
                  : 'Branch Manager'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition animate-pulse"
              >
                <Download size={16} /> Install App
              </button>
            )}

            {user?.role === 'super_admin' ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shadow-sm hover:border-teal-500 transition">
                <Store size={16} className="text-teal-600" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer pr-2"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-slate-400 pointer-events-none" />
              </div>
            ) : (user?.role === 'store_admin' || user?.role === 'manager') ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shadow-sm hover:border-teal-500 transition">
                <Store size={16} className="text-teal-600" />
                <select
                  value={selectedBranch || (user?.branchId?._id || user?.branchId)}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer pr-2"
                >
                  {branches.length > 0 ? (
                    branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))
                  ) : (
                    <option value={user?.branchId?._id || user?.branchId}>{user?.branchId?.name || 'My Store'}</option>
                  )}
                </select>
                <ChevronDown size={14} className="text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 cursor-not-allowed">
                <Store size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-700">
                  {user?.branchId?.name || 'Assigned Branch'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PosLayout;