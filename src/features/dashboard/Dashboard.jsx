import { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, Package, DollarSign, ArrowUpRight, 
  Clock, AlertTriangle, ShoppingCart, Banknote, CreditCard, BookOpen
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Dashboard = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage(); 
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalRevenue: 0, totalTransactions: 0, todayRevenue: 0, todayTransactions: 0,
    topProducts: [], dailyGraph: [], recentSales: [], lowStockCount: 0,
    paymentBreakdown: { cash: 0, card: 0, credit: 0 },
    branchComparison: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ Currency state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [selectedBranch]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      let url = '/reports/dashboard'; 
      
      // ✅ FIX: store_admin aur super_admin dono handle karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) {
          url = `/reports/dashboard?branchId=${branchId}`;
        }
      }
      
      const { data } = await api.get(url);
      setStats({
        totalRevenue: data?.summary?.totalRevenue || 0,
        totalTransactions: data?.summary?.totalTransactions || 0,
        todayRevenue: data?.summary?.todayRevenue || 0,
        todayTransactions: data?.summary?.todayTransactions || 0,
        topProducts: data?.topProducts || [],
        dailyGraph: data?.dailyGraph || [],
        recentSales: data?.recentSales || [],
        lowStockCount: data?.lowStockItems || 0,
        paymentBreakdown: data?.paymentBreakdown || { cash: 0, card: 0, credit: 0 },
        branchComparison: data?.branchComparison || []
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Currency formatter
  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  if (isLoading) return <div className="p-8 text-center text-slate-500">{t('loadingAnalytics')}</div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          {/* ✅ FIX: store_admin ke liye 'Store Dashboard' show karein */}
          <h1 className="text-3xl font-bold text-slate-900">
            {user?.role === 'super_admin' && !selectedBranch 
              ? t('globalMasterDashboard') 
              : user?.role === 'store_admin' 
                ? 'Store Dashboard' 
                : t('branchDashboard')} {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Clock size={16}/> {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/app/pos')} className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-4 py-2.5 rounded-xl shadow-md transition text-sm font-bold">
            <ShoppingCart size={18} /> {t('openPOS')}
          </button>
        </div>
      </div>

      {/* LOW STOCK ALERT */}
      {stats.lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={20}/></div>
            <div>
              <p className="font-bold text-red-800">{t('inventoryAlert')}</p>
              <p className="text-sm text-red-600">{stats.lowStockCount} {t('productsRunningOut')}</p>
            </div>
          </div>
          <button onClick={() => navigate('/app/inventory')} className="text-sm font-bold text-red-700 bg-white border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition">
            {t('viewInventory')}
          </button>
        </div>
      )}

      {/* TOP 4 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 font-medium text-sm">{t('totalRevenue')}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{fmt(stats.totalRevenue)}</h3>
            </div>
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><TrendingUp size={20} /></div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-md font-medium"><ArrowUpRight size={14} className="mr-1"/> {t('active')}</span>
            <span className="text-slate-400">
              {user?.role === 'super_admin' && !selectedBranch ? t('allBranches') : t('branchSales')}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 font-medium text-sm">{t('todayRevenue')}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{fmt(stats.todayRevenue)}</h3>
            </div>
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl"><DollarSign size={20} /></div>
          </div>
          <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">{stats.todayTransactions || 0} {t('ordersToday')}</span></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 font-medium text-sm">{t('totalOrders')}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTransactions || 0}</h3>
            </div>
            <div className="p-2.5 bg-green-100 text-green-600 rounded-xl"><ShoppingBag size={20} /></div>
          </div>
          <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">{t('lifetimeOrders')}</span></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 font-medium text-sm">{t('topProduct')}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 truncate">{stats.topProducts?.[0]?.name || t('noSalesYet')}</h3>
            </div>
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl"><Package size={20} /></div>
          </div>
          <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">{t('sold')}: {stats.topProducts?.[0]?.totalQtySold || 0} {t('units')}</span></div>
        </div>
      </div>

      {/* BRANCH COMPARISON CHART (Sirf Super Admin ke liye) */}
      {user?.role === 'super_admin' && !selectedBranch && stats.branchComparison?.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">{t('branchPerformance')}</h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">{t('allTime')}</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.branchComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip formatter={(value) => fmt(value)} cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="totalRevenue" name={t('totalRevenue')} fill="#0f766e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">{t('salesOverview')}</h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">{t('last7Days')}</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyGraph || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [fmt(value), t('revenue')]}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#0f766e" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: '#0f766e', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAYMENT BREAKDOWN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">{t('paymentBreakdown')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Banknote size={20}/></div>
                <span className="font-bold text-slate-700">{t('cash')}</span>
              </div>
              <span className="font-black text-slate-900">{fmt(stats.paymentBreakdown.cash)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CreditCard size={20}/></div>
                <span className="font-bold text-slate-700">{t('card')}</span>
              </div>
              <span className="font-black text-slate-900">{fmt(stats.paymentBreakdown.card)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><BookOpen size={20}/></div>
                <span className="font-bold text-slate-700">{t('credit')}</span>
              </div>
              <span className="font-black text-slate-900">{fmt(stats.paymentBreakdown.credit)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOP PRODUCTS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{t('topSellingProducts')}</h2>
          <div className="space-y-3">
            {stats.topProducts?.slice(0, 5).map((product, index) => (
              <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-lg border border-teal-100">#{index + 1}</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500">{t('sold')}: {product.totalQtySold} {t('units')}</p>
                  </div>
                </div>
                <span className="font-bold text-teal-600">{fmt(product.totalRevenue)}</span>
              </div>
            ))}
            {stats.topProducts?.length === 0 && <p className="text-sm text-slate-500 text-center py-4">{t('noProductSales')}</p>}
          </div>
        </div>

        {/* RECENT SALES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">{t('recentSales')}</h2>
            <button onClick={() => navigate('/app/orders')} className="text-xs font-bold text-teal-600 hover:underline">{t('viewAll')}</button>
          </div>
          <div className="space-y-3">
            {stats.recentSales?.slice(0, 5).map((sale, index) => (
              <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-100">INV</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{sale.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">
                      {sale.customerId?.name || t('walkIn')} • {sale.paymentMethod} 
                      {/* ✅ FIX: store_admin ko branch ka naam na dikhayein */}
                      {user?.role === 'super_admin' && !selectedBranch && sale.branchId?.name && ` • ${sale.branchId.name}`}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">{fmt(sale.grandTotal)}</span>
              </div>
            ))}
            {stats.recentSales?.length === 0 && <p className="text-sm text-slate-500 text-center py-4">{t('noRecentSales')}</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;