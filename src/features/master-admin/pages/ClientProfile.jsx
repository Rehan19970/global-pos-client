import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Store, Users, DollarSign, ShoppingBag, 
  Mail, Phone, MapPin, Calendar, Shield 
} from 'lucide-react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/master-admin/clients/${id}`);
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load store details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const fmt = (val) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(val || 0);

  if (isLoading) return <div className="p-10 text-center font-bold text-indigo-600">Loading Store Report...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Store not found</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <button onClick={() => navigate('/secret-master-control/clients')} className="p-1.5 md:p-2 bg-white border border-slate-200 rounded-lg md:rounded-xl hover:bg-slate-50 transition shrink-0">
          <ArrowLeft size={18} className="md:w-5 md:h-5 text-slate-600" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2 truncate">
            <Store className="text-indigo-600 w-5 h-5 md:w-6 md:h-6 shrink-0" /> <span className="truncate">{data.branch.name}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500">Store Report & Details</p>
        </div>
      </div>

      {/* Store Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
            <Users size={20} className="md:w-6 md:h-6"/>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Store Owner</p>
            <p className="font-bold text-slate-800 text-sm md:text-lg truncate">{data.branch.ownerId?.name || 'N/A'}</p>
            <p className="text-[10px] md:text-sm text-slate-500 flex items-center gap-1 mt-1 truncate">
              <Mail size={10} className="md:w-3 md:h-3 shrink-0"/> <span className="truncate">{data.branch.ownerId?.email || 'N/A'}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 text-green-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
            <DollarSign size={20} className="md:w-6 md:h-6"/>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Total Sales Revenue</p>
            <p className="font-bold text-slate-800 text-sm md:text-lg truncate">{fmt(data.totalRevenue)}</p>
            <p className="text-[10px] md:text-sm text-slate-500 mt-1">{data.sales.length} Orders in total</p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 text-purple-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
            <Shield size={20} className="md:w-6 md:h-6"/>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Subscription Plan</p>
            <p className="font-bold text-slate-800 text-sm md:text-lg truncate">{data.subscription?.planId?.name || 'No Plan'}</p>
            <p className="text-[10px] md:text-sm text-slate-500 mt-1 truncate">
              {data.subscription ? `Expires: ${new Date(data.subscription.expiryDate).toLocaleDateString()}` : 'Not subscribed'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-3 md:p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2"><ShoppingBag size={16} className="md:w-4.5 md:h-4.5"/> Recent Orders</h2>
          </div>
          
          {/* Mobile View (Cards) */}
          <div className="md:hidden p-3 space-y-2 bg-slate-50/50">
            {data.sales.map((sale) => (
              <div key={sale._id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-100">
                  <p className="font-bold text-indigo-600 text-xs">#{sale.invoiceNumber || sale._id.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] text-slate-500">{new Date(sale.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase">Cashier</p>
                    <p className="text-xs text-slate-700 font-medium">{sale.cashierId?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase">Amount</p>
                    <p className="font-bold text-slate-800 text-sm">{fmt(sale.grandTotal)}</p>
                  </div>
                </div>
              </div>
            ))}
            {data.sales.length === 0 && (
              <p className="text-center text-slate-400 text-xs py-4">No orders found</p>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="p-4 font-bold">Invoice</th>
                  <th className="p-4 font-bold">Cashier</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-800">#{sale.invoiceNumber || sale._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4 text-slate-600">{sale.cashierId?.name || 'Unknown'}</td>
                    <td className="p-4 text-slate-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-indigo-600">{fmt(sale.grandTotal)}</td>
                  </tr>
                ))}
                {data.sales.length === 0 && (
                  <tr><td colSpan="4" className="p-6 text-center text-slate-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Staff List */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-3 md:p-5 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2"><Users size={16} className="md:w-4.5 md:h-4.5"/> Store Staff</h2>
          </div>
          <div className="p-3 md:p-4 space-y-2 md:space-y-3 overflow-y-auto">
            {data.staff.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-2.5 md:p-3 bg-slate-50 rounded-lg md:rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs md:text-sm text-slate-800 truncate">{member.name}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 uppercase">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;