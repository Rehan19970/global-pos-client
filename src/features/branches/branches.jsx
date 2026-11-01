import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Store, Users, X, Save, UploadCloud, Edit, Trash2, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import ImageUploader from '../../shared/components/ImageUploader/ImageUploader';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Branches = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useLanguage();

  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', address: '', phone: '', email: '', managerName: '', imageUrl: '' 
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(data);
    } catch (error) {
      toast.error('Failed to load branches');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        managerName: formData.managerName,
        imageUrl: formData.imageUrl 
      };

      if (editingBranch) {
        await api.put(`/branches/${editingBranch._id}`, payload);
        toast.success('Branch updated successfully!');
      } else {
        await api.post('/branches', payload);
        toast.success('Branch added successfully!');
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', address: '', phone: '', email: '', managerName: '', imageUrl: '' });
      setEditingBranch(null);
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email || '',
      managerName: branch.managerName || '',
      imageUrl: branch.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (branchId) => {
    if (!window.confirm('Kya aap waqai is branch ko delete karna chahte hain? Saath hi us branch ke users bhi deactivate ho jayenge.')) return;
    try {
      await api.delete(`/branches/${branchId}`);
      toast.success('Branch deleted successfully!');
      fetchBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete branch');
    }
  };

  const handleLoginAsBranch = async (branch) => {
    if (!window.confirm(`Login as ${branch.name}?`)) return;
    
    try {
      const branchUser = {
        ...user,
        role: 'manager', 
        branchId: branch._id,
        name: branch.managerName || 'Branch Manager'
      };
      
      localStorage.setItem('user', JSON.stringify(branchUser));
      useAuthStore.setState({ user: branchUser });
      
      toast.success(`Logged in as ${branch.name}!`);
      window.location.href = '/app/dashboard'; 
    } catch (error) {
      toast.error('Failed to switch branch');
    }
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url; 
    
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
      
    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('branches')}</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage all store locations, staff, and inventory</p>
        </div>
        
        {/* Search & Add Button - Mobile par full width */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search branches..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" 
            />
          </div>
          <button 
            onClick={() => { setEditingBranch(null); setFormData({ name: '', address: '', phone: '', email: '', managerName: '', imageUrl: '' }); setIsModalOpen(true); }} 
            className="flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-sm transition text-sm font-bold whitespace-nowrap w-full sm:w-auto"
          >
            <Plus size={18} /> {t('addBranch')}
          </button>
        </div>
      </div>

      {/* Branch Cards Grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredBranches.map(branch => {
          const imageUrl = getImageUrl(branch.imageUrl);

          return (
            <div key={branch._id} className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition group flex flex-col">
              
              {/* Image / Header */}
              <div className="h-40 md:h-48 w-full relative bg-slate-100">
                {imageUrl ? (
                  <img src={imageUrl} alt={branch.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Store size={48} />
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-teal-700 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></span> Active
                  </span>
                </div>

                {/* Edit/Delete Buttons - Always visible on mobile, hover on desktop */}
                <div className="absolute top-3 left-3 flex gap-2 transition md:opacity-0 md:group-hover:opacity-100">
                  <button onClick={() => handleEdit(branch)} className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-full text-blue-600 hover:bg-blue-50 shadow-sm" title="Edit Branch">
                    <Edit size={14} className="md:w-4 md:h-4" />
                  </button>
                  <button onClick={() => handleDelete(branch._id)} className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-50 shadow-sm" title="Delete Branch">
                    <Trash2 size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{branch.name}</h3>
                <p className="text-xs md:text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                  <MapPin size={14} className="shrink-0" /> <span className="truncate">{branch.address}</span>
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-1">Manager</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1 truncate">
                      <Users size={14} className="text-teal-600 shrink-0"/> {branch.managerName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-1">Phone</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{branch.phone}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => handleLoginAsBranch(branch)} 
                    className="w-full bg-[#0f766e] hover:bg-[#115e59] text-white py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition"
                  >
                    <LogIn size={16} /> Login as Branch
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredBranches.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl md:rounded-3xl border border-slate-200 border-dashed">
            <Store size={40} className="mb-4 text-slate-300" />
            <p className="text-base md:text-lg font-medium">No branches found</p>
            <p className="text-xs md:text-sm">Click "Add Branch" to create one.</p>
          </div>
        )}
      </div>

      {/* ADD/EDIT BRANCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900">{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">Enter branch details and location</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 md:p-2 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-100">
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="addBranchForm" onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Branch Image</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition relative">
                    <ImageUploader onUploadSuccess={(url) => setFormData({...formData, imageUrl: url})} />
                    {formData.imageUrl && <p className="text-[10px] md:text-xs text-green-600 mt-2 font-bold">Image uploaded! ✅</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Branch Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Downtown Branch" />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Manager Name</label>
                    <input type="text" value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. John Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Address *</label>
                  <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. 123 Main St, New York" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                    <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="branch@globalpos.com" />
                  </div>
                </div>

              </form>
            </div>
            
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition text-sm">Cancel</button>
              <button type="submit" form="addBranchForm" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 md:px-6 py-2 md:py-2.5 rounded-xl font-medium shadow-sm transition disabled:opacity-70 text-sm">
                {isSubmitting ? 'Saving...' : <><Save size={16} className="md:w-4 md:h-4" /> {editingBranch ? 'Update Branch' : 'Save Branch'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Branches;