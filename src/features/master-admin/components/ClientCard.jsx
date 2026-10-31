import { Store, Mail, Users, DollarSign, Calendar, Settings } from 'lucide-react';

const ClientCard = ({ client, onAssignPlan }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{client.storeName}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={12} /> Joined: {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          client.status === 'Active' ? 'bg-green-100 text-green-700' : 
          client.status === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {client.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><DollarSign size={12}/> Total Sales</p>
          <p className="font-bold text-slate-800">{new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(client.totalSales)}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Users size={12}/> Users</p>
          <p className="font-bold text-slate-800">{client.totalUsers}</p>
        </div>
      </div>

      {/* Owner Info */}
      <div className="text-sm text-slate-600 mb-5 space-y-1">
        <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {client.ownerEmail}</p>
      </div>

      {/* Plan & Action */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Current Plan</p>
          <p className="font-bold text-indigo-600 text-sm">{client.plan}</p>
        </div>
        <button 
          onClick={() => onAssignPlan(client)}
          className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition"
        >
          <Settings size={14} /> Manage Plan
        </button>
      </div>
    </div>
  );
};

export default ClientCard;