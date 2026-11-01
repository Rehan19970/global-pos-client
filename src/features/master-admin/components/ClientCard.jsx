import { Store, Mail, Users, DollarSign, Calendar, Settings } from 'lucide-react';

const ClientCard = ({ client, onAssignPlan }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-4 md:p-5 flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
            <Store size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base md:text-lg text-slate-900 truncate">{client.storeName}</h3>
            <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={10} className="md:w-3 md:h-3" /> Joined: {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider shrink-0 ${
          client.status === 'Active' ? 'bg-green-100 text-green-700' : 
          client.status === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {client.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-5">
        <div className="bg-slate-50 p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-100">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5 md:mb-1"><DollarSign size={10} className="md:w-3 md:h-3"/> Total Sales</p>
          <p className="font-bold text-slate-800 text-xs md:text-base truncate">{new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(client.totalSales)}</p>
        </div>
        <div className="bg-slate-50 p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-100">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5 md:mb-1"><Users size={10} className="md:w-3 md:h-3"/> Users</p>
          <p className="font-bold text-slate-800 text-xs md:text-base">{client.totalUsers}</p>
        </div>
      </div>

      {/* Owner Info */}
      <div className="text-xs md:text-sm text-slate-600 mb-3 md:mb-5 space-y-1 min-w-0">
        <p className="flex items-center gap-1.5 md:gap-2 truncate"><Mail size={12} className="md:w-3.5 md:h-3.5 text-slate-400 shrink-0"/> <span className="truncate">{client.ownerEmail}</span></p>
      </div>

      {/* Plan & Action */}
      <div className="mt-auto pt-3 md:pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Current Plan</p>
          <p className="font-bold text-indigo-600 text-xs md:text-sm">{client.plan}</p>
        </div>
        <button 
          onClick={() => onAssignPlan(client)}
          className="w-full sm:w-auto flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition shrink-0 mt-1 sm:mt-0"
        >
          <Settings size={12} className="md:w-3.5 md:h-3.5" /> Manage Plan
        </button>
      </div>
    </div>
  );
};

export default ClientCard;