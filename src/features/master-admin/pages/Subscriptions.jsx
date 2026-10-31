import { useState, useEffect } from 'react';
import { Search, Calendar, AlertTriangle } from 'lucide-react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';

const Subscriptions = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const { data } = await api.get('/master-admin/clients');
        // Sirf woh clients jinka koi plan assigned hai
        setClients(data.clients.filter(c => c.plan !== 'No Plan'));
      } catch (error) {
        toast.error('Failed to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const filteredClients = clients.filter(c => 
    c.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const diff = new Date(date) - new Date();
    return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000); // 7 days
  };

  if (isLoading) return <div className="p-8 text-center">Loading Subscriptions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Subscriptions</h1>
          <p className="text-slate-500 text-sm mt-1">Track every client's plan and expiry date.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input type="text" placeholder="Search stores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold pl-6">Store Name</th>
              <th className="p-4 font-bold">Plan</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Expiry Date</th>
              <th className="p-4 font-bold">Days Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredClients.map((client) => {
              const daysLeft = client.expiryDate ? Math.ceil((new Date(client.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
              const expiring = isExpiringSoon(client.expiryDate);

              return (
                <tr key={client._id} className="hover:bg-slate-50 transition">
                  <td className="p-4 pl-6 font-bold text-slate-900">{client.storeName}</td>
                  <td className="p-4"><span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs">{client.plan}</span></td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                      client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    {client.expiryDate ? new Date(client.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    {daysLeft > 0 ? (
                      <span className={`flex items-center gap-1 font-bold ${expiring ? 'text-orange-500' : 'text-slate-600'}`}>
                        {expiring && <AlertTriangle size={14} />} {daysLeft} days
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold">Expired</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="p-10 text-center text-slate-500">No active subscriptions found.</div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;