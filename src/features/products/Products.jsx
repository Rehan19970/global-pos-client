import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Package, X, Save, 
  Scale, ScanLine, RefreshCw, Box 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import ImageUploader from '../../shared/components/ImageUploader/ImageUploader';
import BarcodeScanner from '../pos/components/BarcodeScanner';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Products = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  // ✅ Currency state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);
  
  const initialFormState = { 
    name: '', category: '', barcode: '', sku: '', imageUrl: '',
    price: '', costPrice: '', initialStock: '',
    sellType: 'single',
    packUnit: 'Box',
    piecesPerUnit: 1,
    boxPrice: '',
    baseUnit: 'pcs',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedBranch]);

  const fetchProducts = async () => {
    try {
      let prodUrl = '/products';
      let invUrl = '/inventory';
      
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) {
          prodUrl = `/products?branchId=${branchId}`;
          invUrl = `/inventory?branchId=${branchId}`;
        }
      }

      const prodRes = await api.get(prodUrl);
      const invRes = await api.get(invUrl);
      
      const productList = prodRes.data.products || prodRes.data;
      const inventoryData = invRes.data || [];

      const productsWithStock = productList.map(p => {
        const inv = inventoryData.find(i => 
          (i.productId?._id === p._id) || (i.productId === p._id)
        );
        return { ...p, stockQuantity: inv ? inv.stockQuantity : 0 };
      });

      setProducts(productsWithStock); 
    } catch (error) { toast.error('Failed to load products'); }
  };

  const fetchCategories = async () => {
    try {
      let url = '/categories';
      
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) url = `/categories?branchId=${branchId}`;
      }

      const { data } = await api.get(url);
      setCategories(data);
    } catch (error) { console.error(error); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSellTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      sellType: type,
      ...(type === 'single' && { baseUnit: 'pcs', piecesPerUnit: 1 }),
      ...(type === 'box' && { baseUnit: 'pcs' }),
      ...(type === 'weight' && { baseUnit: 'kg' }),
    }));
  };

  const handleGenerateBarcode = () => {
    const random13Digit = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
    setFormData(prev => ({ ...prev, barcode: random13Digit }));
    toast.success('Barcode generated!');
  };

  const handleBarcodeScan = (result) => {
    setFormData(prev => ({ ...prev, barcode: result.barcode }));
    setShowScanner(false);
    toast.success('Barcode scanned!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    
    if (isAdminLevel) {
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      if (!branchId) {
        return toast.error('Branch ID is missing. Please try again.');
      }
    }

    const isLoose = formData.sellType === 'weight' || formData.sellType === 'box';
    let finalPrice = Number(formData.price);
    let finalStock = Number(formData.initialStock) || 0;
    
    if (formData.sellType === 'box') {
      finalStock = finalStock * Number(formData.piecesPerUnit);
    }

    const submitData = {
      name: formData.name,
      category: formData.category,
      sku: formData.sku,
      imageUrl: formData.imageUrl,
      price: finalPrice,            
      costPrice: Number(formData.costPrice) || 0, 
      initialStock: finalStock,
      isLooseItem: isLoose,
      baseUnit: formData.baseUnit,
      packaging: {
        unitName: formData.packUnit,
        piecesPerUnit: Number(formData.piecesPerUnit),
        boxPrice: Number(formData.boxPrice) || 0
      },
      ...(isAdminLevel ? { branchId: selectedBranch || user?.branchId?._id || user?.branchId } : {})
    };

    if (formData.barcode && formData.barcode.trim() !== '') {
      submitData.barcode = formData.barcode.trim();
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, submitData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', submitData);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    let sellType = 'single';
    if (product.isLooseItem) {
      sellType = product.baseUnit === 'pcs' ? 'box' : 'weight';
    }

    setFormData({ 
      ...product, 
      sellType,
      initialStock: '',
      packUnit: product.packaging?.unitName || 'Box',
      piecesPerUnit: product.packaging?.piecesPerUnit || 1,
      boxPrice: product.packaging?.boxPrice || '',
    });
    setEditingId(product._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) { toast.error('Failed to delete product'); }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  // ✅ IMAGE URL FIX (Ab localhost ki jagah env variable use hoga)
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url; // Cloudinary URL seedha chalega
    
    // Agar purana local path hai toh backend URL lagao (jo .env se aayega)
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
      
    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      {showScanner && (
        <BarcodeScanner onScanSuccess={handleBarcodeScan} onClose={() => setShowScanner(false)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('productsCatalog')}</h1>
          <p className="text-slate-500 mt-1">{t('manageInventoryProducts')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder={t('searchProducts')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" />
          </div>
          <button onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData(initialFormState); }} className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-sm transition text-sm font-medium whitespace-nowrap">
            <Plus size={18} /> {t('addProduct')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const imageUrl = getImageUrl(product.imageUrl);
          
          return (
            <div key={product._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition group flex flex-col">
              <div className="h-44 w-full bg-slate-50 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
                {imageUrl ? (
                   <img 
                     src={imageUrl} 
                     alt={product.name} 
                     className="w-full h-full object-cover" 
                     onError={(e) => {
                       e.target.onerror = null; 
                       e.target.src = ''; 
                       e.target.style.display = 'none';
                       e.target.parentElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
                     }}
                   />
                ) : (
                  <Package className="text-slate-300" size={40} />
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${
                  product.stockQuantity > 10 ? 'bg-green-100 text-green-700' : 
                  product.stockQuantity > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.stockQuantity || 0} {product.baseUnit}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase">{product.category}</span>
                  <span className="text-xs text-slate-400 font-mono">{product.barcode || t('noBarcode')}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 truncate">{product.name}</h3>
                
                {product.isLooseItem && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 font-bold mb-2">
                    {product.baseUnit === 'pcs' ? <Box size={12} /> : <Scale size={12} />} 
                    {t('soldBy')} {product.baseUnit === 'pcs' ? t('boxPiece') : product.baseUnit}
                  </div>
                )}

                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">{t('price')}</p>
                    <p className="text-xl font-bold text-slate-900">{fmt(product.price)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(product._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingId ? t('editProduct') : t('addNewProduct')}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-full hover:bg-slate-100"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="addProductForm" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('productImage')}</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition relative min-h-[160px]">
                       <ImageUploader 
                          onUploadSuccess={(url) => {
                            console.log("Uploaded URL:", url); 
                            setFormData(prev => ({ ...prev, imageUrl: url })); 
                          }} 
                       />
                    </div>
                    {formData.imageUrl && (
                      <p className="text-xs text-green-600 mt-2 font-bold text-center">
                        {t('imageUploaded')} ✅
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('productName')}</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
                    <select name="category" required value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none">
                      <option value="">{t('selectCategory')}</option>
                      {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('barcodeSku')}</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none pr-10" placeholder={t('scanOrEnter')} />
                        <button type="button" onClick={handleGenerateBarcode} className="absolute right-2 top-3 p-1 text-slate-400 hover:text-teal-600" title="Generate Barcode">
                          <RefreshCw size={16} />
                        </button>
                      </div>
                      <button type="button" onClick={() => setShowScanner(true)} className="bg-teal-50 border border-teal-200 text-teal-700 px-3 rounded-xl flex items-center justify-center transition hover:bg-teal-100" title="Scan Barcode">
                        <ScanLine size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">{t('howDoYouSell')}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => handleSellTypeChange('single')} className={`flex flex-col items-center p-2 rounded-xl border-2 transition ${formData.sellType === 'single' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                      <Package size={20} className={formData.sellType === 'single' ? 'text-teal-600' : 'text-slate-400'} />
                      <span className="text-[10px] font-bold mt-1 text-slate-700">{t('single')}</span>
                    </button>
                    <button type="button" onClick={() => handleSellTypeChange('box')} className={`flex flex-col items-center p-2 rounded-xl border-2 transition ${formData.sellType === 'box' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                      <Box size={20} className={formData.sellType === 'box' ? 'text-teal-600' : 'text-slate-400'} />
                      <span className="text-[10px] font-bold mt-1 text-slate-700">{t('box')}</span>
                    </button>
                    <button type="button" onClick={() => handleSellTypeChange('weight')} className={`flex flex-col items-center p-2 rounded-xl border-2 transition ${formData.sellType === 'weight' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                      <Scale size={20} className={formData.sellType === 'weight' ? 'text-teal-600' : 'text-slate-400'} />
                      <span className="text-[10px] font-bold mt-1 text-slate-700">{t('weight')}</span>
                    </button>
                  </div>

                  {formData.sellType === 'box' && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">{t('packagingName')}</label>
                        <input type="text" name="packUnit" value={formData.packUnit} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="Box, Carton" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">{t('piecesInOne')} {formData.packUnit}</label>
                        <input type="number" name="piecesPerUnit" value={formData.piecesPerUnit} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl mb-2">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Note:</strong> Selling & Cost prices are always saved in <strong>base currency (PKR)</strong>. 
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('sellingPrice')} ({formData.sellType === 'weight' ? formData.baseUnit : t('piece')}) <span className="text-xs text-slate-500">— PKR</span>
                    </label>
                    <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('costPrice')} <span className="text-xs text-slate-500">— PKR</span>
                    </label>
                    <input type="number" name="costPrice" required value={formData.costPrice} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      {editingId ? t('updateStock') : t('initialStock')}
                      <span className="text-teal-600 text-xs">({formData.sellType === 'weight' ? 'KG' : formData.sellType === 'box' ? formData.packUnit + 's' : t('pieces')})</span>
                    </label>
                    <input type="number" name="initialStock" value={formData.initialStock} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none" placeholder={formData.sellType === 'box' ? 'e.g. 5 Boxes' : 'e.g. 50'} />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition">{t('cancel')}</button>
              <button type="submit" form="addProductForm" className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition"><Save size={18} /> {editingId ? t('update') : t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;