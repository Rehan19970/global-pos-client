import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, X, Save, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../lib/formatCurrency';
import { useLanguage } from '../../context/LanguageContext';

const Categories = () => {
  const { user, selectedBranch } = useAuthStore();
  const { t } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false); 
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const categoryColors = [
    'bg-blue-50 text-blue-600', 'bg-purple-50 text-purple-600', 
    'bg-orange-50 text-orange-600', 'bg-pink-50 text-pink-600',
    'bg-teal-50 text-teal-600', 'bg-indigo-50 text-indigo-600'
  ];

  useEffect(() => {
    fetchCategories();
  }, [selectedBranch]);

  const fetchCategories = async () => {
    try {
      let url = '/categories';
      
      // ✅ FIX: store_admin aur super_admin dono ko branchId bhejni hogi
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) url = `/categories?branchId=${branchId}`;
      }

      const { data } = await api.get(url);
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setIsProductsModalOpen(true);
    setIsLoadingProducts(true);
    
    try {
      let url = `/products?category=${category.name}`;
      
      // ✅ FIX: store_admin ke liye bhi branchId add karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) url += `&branchId=${branchId}`;
      }
      
      const { data } = await api.get(url);
      setCategoryProducts(data.products || data);
    } catch (error) {
      toast.error('Failed to load products for this category');
      setCategoryProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ FIX: store_admin ke liye bhi branch check karein
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    
    if (isAdminLevel) {
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      if (!branchId) {
        return toast.error('Branch ID is missing. Please try again.');
      }
    }

    setIsSaving(true);
    try {
      const payload = { ...formData };
      
      // ✅ FIX: store_admin ke liye bhi branchId bhejein
      if (isAdminLevel) {
        payload.branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      }

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        toast.success('Category added successfully!');
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (e, category) => {
    e.stopPropagation();
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, category) => {
    e.stopPropagation();
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category._id}?name=${encodeURIComponent(category.name)}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3"><Tag className="text-teal-600" size={32} /> {t('categories')}</h1>
          <p className="text-slate-500 mt-1">Organize your products into categories</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" />
          </div>
          <button onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-md transition text-sm font-bold whitespace-nowrap">
            <Plus size={18} /> {t('addCategory')}
          </button>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category, index) => {
          const colorClass = categoryColors[index % categoryColors.length];
          
          return (
            <div 
              key={category._id} 
              onClick={() => handleCategoryClick(category)}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-teal-300 cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${colorClass.split(' ')[0]}`}></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${colorClass}`}>
                    <Tag size={26} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition">{category.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{category.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-700 transition">
                  <Package size={14} /> {t('viewProducts')}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(e, category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit size={16} /></button>
                  <button onClick={(e) => handleDelete(e, category)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL 1: ADD/EDIT CATEGORY ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? t('editCategory') : t('createCategory')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('categoryName')} *</label>
                <input type="text" required autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:bg-white text-slate-900 font-medium" placeholder="e.g. Beverages" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('description')} (Optional)</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:bg-white text-slate-900 resize-none" placeholder="Short description..."></textarea>
              </div>
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">{t('cancel')}</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59] flex items-center justify-center gap-2 disabled:opacity-50"><Save size={18} /> {isSaving ? 'Saving...' : t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: VIEW PRODUCTS IN CATEGORY ================= */}
      {isProductsModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                  <Tag size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedCategory.name} {t('products')}</h2>
                  <p className="text-sm text-slate-500">{categoryProducts.length} items found in this category</p>
                </div>
              </div>
              <button onClick={() => setIsProductsModalOpen(false)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/50">
              {isLoadingProducts ? (
                <div className="py-20 text-center text-slate-500 font-medium">Loading products...</div>
              ) : categoryProducts.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">No Products Found</h3>
                  <p className="text-sm text-slate-500 mt-1">This category currently has no products.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryProducts.map(product => (
                    <div key={product._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col">
                      <div className="h-32 bg-slate-50 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={32} className="text-slate-300" />
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{product.name}</h4>
                      <p className="text-xs text-slate-500 mb-2">{product.barcode || 'No Barcode'}</p>
                      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-teal-600 font-bold">{formatCurrency(product.price)}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
              <button onClick={() => setIsProductsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                {t('closeWindow')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;