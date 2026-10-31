import { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, PieChart, ShoppingCart, TrendingUp, ArrowUpRight, FileText, File, Store } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Reports = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  const [profitData, setProfitData] = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0, marginPercentage: 0 });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); 

  // ✅ Currency state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  // ✅ FIX: store_admin ke liye Global View check
  const isGlobalView = user?.role === 'super_admin' && !selectedBranch;

  useEffect(() => {
    fetchReports();
  }, [selectedBranch, dateRange]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // ✅ FIX: store_admin aur super_admin dono handle karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      
      let query = `?days=${dateRange}`;
      if (isAdminLevel && branchId) {
        query = `?branchId=${branchId}&days=${dateRange}`;
      }

      const profitRes = await api.get(`/reports/profit-loss${query}`);
      setProfitData(profitRes.data);

      const dashRes = await api.get(`/reports/dashboard${query}`);
      const formattedGraph = dashRes.data.dailyGraph.map(item => ({
        name: item._id.slice(5),
        revenue: item.total
      }));
      setChartData(formattedGraph);
    } catch (error) {
      toast.error('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      toast.loading(t('generatingReport'), { id: 'csv' });
      
      // ✅ FIX: store_admin aur super_admin dono handle karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      
      let query = `?days=${dateRange}`;
      if (isAdminLevel && branchId) {
        query = `?branchId=${branchId}&days=${dateRange}`;
      }

      const response = await api.get(`/reports/export-sales${query}`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SalesReport_${dateRange}Days_${storeSettings.currency}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(t('reportDownloaded'), { id: 'csv' });
    } catch (error) {
      toast.error(t('failedDownloadReport'), { id: 'csv' });
    }
  };

  // ✅ Currency formatter
  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  if (isLoading) return <div className="p-8 text-center text-slate-500">{t('loadingReports')}</div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            {/* ✅ FIX: store_admin ke liye 'Store Reports' show karein */}
            {user?.role === 'store_admin' 
              ? 'Store Reports' 
              : isGlobalView 
                ? t('globalBusinessReports') 
                : t('branchReports')}
          </h1>
          <p className="text-slate-500 mt-1">
            {user?.role === 'store_admin' 
              ? 'Track your store performance and profit'
              : isGlobalView 
                ? t('viewingAllBranches') 
                : t('trackBranchPerformance')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadCSV} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition text-sm font-medium">
            <Download size={16} /> {t('exportCSV')}
          </button>
          
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition text-sm font-medium outline-none cursor-pointer"
          >
            <option value={7}>{t('last7Days')}</option>
            <option value={30}>{t('last30Days')}</option>
            <option value={90}>{t('last90Days')}</option>
          </select>
        </div>
      </div>

      {/* GLOBAL VIEW WARNING (Sirf Super Admin ke liye) */}
      {isGlobalView && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Store size={20}/></div>
          <div>
            <p className="font-bold text-blue-800">{t('globalViewActive')}</p>
            <p className="text-sm text-blue-600">{t('globalViewWarning')}</p>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3"><DollarSign size={28} /></div>
          <p className="text-slate-600 font-medium text-sm">{t('totalRevenue')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{fmt(profitData.totalRevenue)}</h3>
          <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">{t('allTime')} <ArrowUpRight size={14} /></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-3"><PieChart size={28} /></div>
          <p className="text-slate-600 font-medium text-sm">{t('profitMargin')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{profitData.marginPercentage?.toFixed(1) || 0}%</h3>
          <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">{t('netProfit')}: {fmt(profitData.totalProfit)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3"><ShoppingCart size={28} /></div>
          <p className="text-slate-600 font-medium text-sm">{t('totalCost')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{fmt(profitData.totalCost)}</h3>
          <p className="text-xs text-slate-500 font-medium mt-2">{t('costOfGoodsSold')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-3"><TrendingUp size={28} /></div>
          <p className="text-slate-600 font-medium text-sm">{t('profitStatus')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{profitData.totalProfit > 0 ? t('inProfit') : t('inLoss')}</h3>
          <p className={`text-xs font-medium mt-2 ${profitData.totalProfit > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {profitData.totalProfit > 0 ? t('goodPerformance') : t('needsAttention')}
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-900">{t('financialReports')}</h2>
        <p className="text-sm text-slate-500 mb-6">{t('revenueTrend')} ({t('last')} {dateRange} {t('days')})</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val}`} />
              <Tooltip formatter={(value) => fmt(value)} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Line type="monotone" dataKey="revenue" name={t('revenue')} stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('exportReports')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <button onClick={handleDownloadCSV} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition text-left">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileText size={24} /></div>
            <div>
              <p className="font-bold text-slate-900">{t('exportAsCSV')}</p>
              <p className="text-xs text-slate-500">{t('getDetailedList')}</p>
            </div>
          </button>

          <button onClick={() => toast.error('PDF Export will be added soon!')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition text-left">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><File size={24} /></div>
            <div>
              <p className="font-bold text-slate-900">{t('exportAsPDF')}</p>
              <p className="text-xs text-slate-500">{t('generatePrintableReport')}</p>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};

export default Reports;