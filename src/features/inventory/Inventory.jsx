import { useState, useEffect } from 'react';
import { Search, Edit, Package, X, Save, AlertCircle, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Inventory = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', stockQuantity: 0, lowStockAlert: 5, unit: 'pcs' });
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Currency state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [selectedBranch]);

  const fetchInventory = async () => {
    try {
      let url = '/inventory';
      
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) url = `/inventory?branchId=${branchId}`;
      }

      const { data } = await api.get(url);
      setInventory(data);
    } catch (error) {
      toast.error('Failed to load inventory');
    }
  };

  const handleEditClick = (item) => {
    setEditData({
      id: item._id,
      name: item.productId?.name || 'Unknown',
      stockQuantity: item.stockQuantity,
      lowStockAlert: item.lowStockAlert || 5,
      unit: item.productId?.baseUnit || 'pcs'
    });
    setIsModalOpen(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/inventory/${editData.id}`, { 
        stockQuantity: Number(editData.stockQuantity),
        lowStockAlert: Number(editData.lowStockAlert)
      });
      
      toast.success('Stock updated successfully!');
      setIsModalOpen(false);
      fetchInventory(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from inventory?`)) return;
    
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Product deleted from inventory!');
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.productId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2 md:gap-3">
            <Package className="text-teal-600" size={28} /> {t('inventoryManagement')}
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">{t('manageProductsStock')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          
          {/* TABLE HEADER */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 border-b border-slate-100">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">{t('productStock')}</h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="text" placeholder={t('searchProducts')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-500 transition" />
            </div>
          </div>

          {/* MOBILE VIEW (Cards) */}
          <div className="md:hidden p-4 space-y-3 bg-slate-50/50">
            {filteredInventory.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.productId?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.productId?.category}</p>
                    </div>
                  </div>
                  <div>
                    {item.stockQuantity === 0 ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">{t('outOfStock')}</span>
                    ) : item.stockQuantity < item.lowStockAlert ? (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">{t('lowStock')}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">{t('inStock')}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Stock</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {item.stockQuantity > 0 ? (
                        <TrendingUp size={14} className="text-green-500" />
                      ) : (
                        <TrendingDown size={14} className="text-red-500" />
                      )}
                      <p className={`font-bold text-base ${item.stockQuantity === 0 ? 'text-red-500' : item.stockQuantity < item.lowStockAlert ? 'text-orange-500' : 'text-slate-900'}`}>
                        {item.stockQuantity} <span className="text-[10px] font-medium text-slate-500">{item.productId?.baseUnit || 'pcs'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Price</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{fmt(item.productId?.price || 0)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono">{item.productId?.barcode || 'No Barcode'}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(item)} className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(item._id, item.productId?.name)} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredInventory.length === 0 && (
              <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                <Package size={32} className="mx-auto mb-2 text-slate-300" />
                {t('noInventoryItems')}
              </div>
            )}
          </div>

          {/* DESKTOP VIEW (Table) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold pl-6">{t('product')}</th>
                  <th className="p-4 font-bold">{t('skuBarcode')}</th>
                  <th className="p-4 font-bold">{t('availableStock')}</th>
                  <th className="p-4 font-bold">{t('price')}</th>
                  <th className="p-4 font-bold">{t('status')}</th>
                  <th className="p-4 font-bold text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.productId?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{item.productId?.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium font-mono">{item.productId?.barcode || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {item.stockQuantity > 0 ? (
                          <TrendingUp size={16} className="text-green-500" />
                        ) : (
                          <TrendingDown size={16} className="text-red-500" />
                        )}
                        <p className={`font-bold text-lg ${item.stockQuantity === 0 ? 'text-red-500' : item.stockQuantity < item.lowStockAlert ? 'text-orange-500' : 'text-slate-900'}`}>
                          {item.stockQuantity} <span className="text-xs font-medium text-slate-500">{item.productId?.baseUnit || 'pcs'}</span>
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t('alertAt')}: {item.lowStockAlert}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{fmt(item.productId?.price || 0)}</td>
                    <td className="p-4">
                      {item.stockQuantity === 0 ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">{t('outOfStock')}</span>
                      ) : item.stockQuantity < item.lowStockAlert ? (
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-bold">{t('lowStock')}</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">{t('inStock')}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditClick(item)} className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold transition" title="Update Stock">
                          <Edit size={14} /> {t('edit')}
                        </button>
                        <button onClick={() => handleDelete(item._id, item.productId?.name)} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition" title="Delete Product">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-500">
                      <Package size={48} className="mx-auto mb-3 text-slate-300" />
                      {t('noInventoryItems')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* UPDATE STOCK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">{t('updateStock')}</h2>
                <p className="text-[10px] md:text-xs text-slate-500 truncate max-w-[200px] md:max-w-full">{t('adjustStockFor')} {editData.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 md:p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 rounded-full transition">
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStock} className="p-4 md:p-6 space-y-4 overflow-y-auto">
              <div className="bg-teal-50 border border-teal-100 p-3 md:p-4 rounded-xl flex items-start gap-2 md:gap-3">
                <AlertCircle size={18} className="text-teal-600 shrink-0 mt-0.5 md:w-5 md:h-5" />
                <p className="text-xs md:text-sm text-teal-800">
                  {t('updateStockWarning')} <strong>{editData.name}</strong>. {t('willReflectPOS')}
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5">{t('currentStockQty')} ({editData.unit})</label>
                <input 
                  type="number" 
                  required 
                  autoFocus
                  min="0"
                  value={editData.stockQuantity} 
                  onChange={e => setEditData({...editData, stockQuantity: e.target.value})} 
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 md:px-4 py-2.5 md:py-3 outline-none focus:border-teal-500 text-xl md:text-2xl font-black text-slate-900" 
                />
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5">{t('lowStockAlertMin')}</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={editData.lowStockAlert} 
                  onChange={e => setEditData({ ...editData, lowStockAlert: e.target.value })} 
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 md:px-4 py-2.5 outline-none focus:border-teal-500 text-slate-900" 
                />
                <p className="text-[10px] text-slate-500 mt-1">{t('lowStockWarningDesc')}</p>
              </div>

              <div className="pt-3 md:pt-4 flex flex-col-reverse sm:flex-row gap-2 md:gap-3 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:flex-1 px-4 py-2.5 md:py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-sm">{t('cancel')}</button>
                <button type="submit" disabled={isSaving} className="w-full sm:flex-1 px-4 py-2.5 md:py-3 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59] flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm">
                  <Save size={16} /> {isSaving ? t('updating') : t('updateStock')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;