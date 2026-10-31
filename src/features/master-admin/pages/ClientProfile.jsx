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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/secret-master-control/clients')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="text-indigo-600" /> {data.branch.name}
          </h1>
          <p className="text-sm text-slate-500">Store Report & Details</p>
        </div>
      </div>

      {/* Store Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Users size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Store Owner</p>
            <p className="font-bold text-slate-800 text-lg">{data.branch.ownerId?.name || 'N/A'}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Mail size={12}/> {data.branch.ownerId?.email || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><DollarSign size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Sales Revenue</p>
            <p className="font-bold text-slate-800 text-lg">{fmt(data.totalRevenue)}</p>
            <p className="text-sm text-slate-500 mt-1">{data.sales.length} Orders in total</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Shield size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Subscription Plan</p>
            <p className="font-bold text-slate-800 text-lg">{data.subscription?.planId?.name || 'No Plan'}</p>
            <p className="text-sm text-slate-500 mt-1">
              {data.subscription ? `Expires: ${new Date(data.subscription.expiryDate).toLocaleDateString()}` : 'Not subscribed'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ShoppingBag size={18}/> Recent Orders</h2>
          </div>
          <div className="overflow-x-auto flex-1">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Users size={18}/> Store Staff</h2>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto">
            {data.staff.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{member.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{member.role}</p>
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