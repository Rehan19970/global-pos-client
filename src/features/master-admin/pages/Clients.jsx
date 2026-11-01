import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';
import ClientCard from '../components/ClientCard';
import AssignPlanModal from '../components/AssignPlanModal';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/master-admin/clients');
      setClients(data.clients);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAssignPlan = (e, client) => {
    e.stopPropagation();
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    c.storeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center text-sm md:text-base text-slate-500">Loading Stores...</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Clients & Stores</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Manage all SaaS clients, their sales, and subscriptions.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by store name or email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-white border border-slate-200 text-xs md:text-sm rounded-xl py-2.5 pl-9 md:pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {filteredClients.map(client => (
          <div 
            key={client._id} 
            onClick={() => navigate(`/secret-master-control/clients/${client._id}`)}
            className="cursor-pointer"
          >
            <ClientCard 
              client={client} 
              onAssignPlan={(e) => handleAssignPlan(e, client)}
            />
          </div>
        ))}
        
        {filteredClients.length === 0 && (
          <div className="col-span-full py-10 md:py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 text-sm">
            No clients found.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedClient && (
        <AssignPlanModal 
          client={selectedClient} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchClients();
          }} 
        />
      )}
    </div>
  );
};

export default Clients;