import { useState, useEffect } from 'react';
import { Store, DollarSign, CreditCard, Users, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';

const Overview = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/master-admin/dashboard-stats');
        if (response.data.success) {
          setData(response.data.stats);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center text-indigo-600">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="font-bold animate-pulse text-sm md:text-base">Loading SaaS Analytics...</p>
    </div>
  );

  const fmt = (value) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(value);

  const statCards = [
    { title: 'Total Stores', value: data?.totalClients || 0, icon: Store, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Revenue', value: fmt(data?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Active Subs', value: data?.activeSubs || 0, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Registered Users', value: data?.totalUsers || 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-6 rounded-xl md:rounded-2xl text-white shadow-lg">
        <div>
          <h1 className="text-lg md:text-2xl font-black">Welcome back, Master!</h1>
          <p className="text-indigo-100 mt-1 text-xs md:text-base">Here is your SaaS platform performance overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm self-start sm:self-auto mt-1 sm:mt-0">
          <Calendar size={14} className="md:w-4.5 md:h-4.5" />
          <span className="font-bold text-[10px] md:text-sm">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} className="md:w-6 md:h-6" />
              </div>
              <span className="text-[9px] md:text-xs font-bold text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded md:rounded-lg flex items-center gap-1">
                <TrendingUp size={10} className="md:w-3 md:h-3" /> +12%
              </span>
            </div>
            <div>
              <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{stat.title}</p>
              <h2 className="text-sm md:text-2xl font-black text-slate-900 mt-0.5 md:mt-1 truncate">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-sm md:text-lg font-bold text-slate-900">Platform Sales Trend (Last 7 Days)</h2>
          </div>
          <div className="h-56 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.salesChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(value) => [`PKR ${value}`, 'Sales']}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Stores */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col">
          <h2 className="text-sm md:text-lg font-bold text-slate-900 mb-3 md:mb-4">Recently Joined</h2>
          <div className="flex-1 overflow-y-auto pr-1 md:pr-2 space-y-3 md:space-y-4 max-h-[300px] md:max-h-none">
            {data?.recentClients.map((client) => (
              <div key={client._id} className="flex items-center gap-2 md:gap-3 border-b border-slate-50 pb-2 md:pb-3 last:border-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs md:text-base shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs md:text-sm text-slate-800 truncate">{client.name}</p>
                  <p className="text-[10px] md:text-xs text-slate-500 truncate">{client.ownerId?.email || 'No Email'}</p>
                </div>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded shrink-0">
                  {new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
            {(!data?.recentClients || data.recentClients.length === 0) && (
              <p className="text-center text-xs text-slate-400 py-4">No recent stores found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;