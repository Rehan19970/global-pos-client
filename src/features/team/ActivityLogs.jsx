import { useState, useEffect } from 'react';
import { 
  Activity, Search, Shield, CheckCircle2, XCircle, Clock 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const ActivityLogs = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterModule, setFilterModule] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [selectedBranch, filterAction, filterModule, searchTerm]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let url = '/activity?';
      
      // ✅ FIX: store_admin aur super_admin dono handle karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      
      if (isAdminLevel && branchId) url += `branchId=${branchId}&`;
      
      if (filterAction) url += `action=${filterAction}&`;
      if (filterModule) url += `module=${filterModule}&`;
      if (searchTerm) url += `search=${searchTerm}&`;

      const { data } = await api.get(url);
      setLogs(data.logs || []);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'LOGIN': return 'bg-purple-100 text-purple-700';
      case 'LOGOUT': return 'bg-slate-100 text-slate-700';
      case 'SALE': return 'bg-teal-100 text-teal-700';
      case 'FAILED_LOGIN': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">{t('loadingLogs')}</div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="text-teal-600" size={32} /> {t('systemActivityLogs')}
          </h1>
          <p className="text-slate-500 mt-1">{t('monitorSystemActions')}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchDescription')} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-500" 
          />
        </div>

        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none font-medium">
          <option value="">{t('allActions')}</option>
          <option value="LOGIN">{t('login')}</option>
          <option value="CREATE">{t('create')}</option>
          <option value="UPDATE">{t('update')}</option>
          <option value="DELETE">{t('delete')}</option>
          <option value="SALE">{t('sale')}</option>
        </select>

        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none font-medium">
          <option value="">{t('allModules')}</option>
          <option value="Product">{t('product')}</option>
          <option value="Sale">{t('sale')}</option>
          <option value="Customer">{t('customer')}</option>
          <option value="Inventory">{t('inventory')}</option>
          <option value="Auth">{t('auth')}</option>
        </select>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="p-4 font-bold pl-6">{t('time')}</th>
              <th className="p-4 font-bold">{t('user')}</th>
              <th className="p-4 font-bold">{t('action')}</th>
              <th className="p-4 font-bold">{t('description')}</th>
              <th className="p-4 font-bold">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-slate-50 transition">
                <td className="p-4 pl-6 text-slate-500 text-xs font-medium">
                  <div className="flex items-center gap-1"><Clock size={12}/> {new Date(log.createdAt).toLocaleString()}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {log.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{log.userName}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{log.userRole}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-700 font-medium">{log.description}</td>
                <td className="p-4">
                  {log.status === 'Success' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 size={14}/> {t('success')}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600"><XCircle size={14}/> {t('failed')}</span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-500">
                  <Activity size={48} className="mx-auto mb-3 text-slate-300" />
                  {t('noActivityLogs')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ActivityLogs;