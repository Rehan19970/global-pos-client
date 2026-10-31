import { useState, useEffect } from 'react';
import { 
  Plus, Search, Truck, Package, X, CheckCircle2, 
  MoreHorizontal, FileText, UserPlus, Calculator, 
  Calendar, FileDigit, StickyNote, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const PurchaseOrders = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '' });
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);

  // ✅ Currency state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  const [formData, setFormData] = useState({
    supplierId: '',
    invoiceNumber: '',
    expectedDeliveryDate: '',
    notes: '',
    items: [{ productId: '', quantity: 1, costPrice: 0, purchaseType: 'pcs' }]
  });

  useEffect(() => {
    fetchData();
  }, [selectedBranch]);

  const fetchData = async () => {
    try {
      // ✅ FIX: store_admin aur super_admin dono handle karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      const query = isAdminLevel && branchId ? `?branchId=${branchId}` : '';

      const poRes = await api.get(`/purchases${query}`);
      setPurchases(poRes.data || []);

      const suppRes = await api.get(`/suppliers${query}`);
      setSuppliers(suppRes.data || []);

      const prodRes = await api.get(`/products${query}`);
      setProducts(prodRes.data.products || prodRes.data);

    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleAddNewSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) return toast.error('Name and Phone required');
    
    setIsSubmittingSupplier(true);
    try {
      // ✅ FIX: store_admin ke liye bhi branchId bhejein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;

      const payload = {
        ...newSupplier,
        ...(isAdminLevel && branchId ? { branchId } : {})
      };
      const { data } = await api.post('/suppliers', payload);
      
      toast.success('Supplier added successfully!');
      setSuppliers([...suppliers, data]);
      
      setFormData(prev => ({ ...prev, supplierId: data._id }));
      
      setIsSupplierModalOpen(false); 
      setNewSupplier({ name: '', phone: '', email: '', address: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add supplier');
    } finally {
      setIsSubmittingSupplier(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, costPrice: 0, purchaseType: 'pcs' }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'productId') {
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) {
        newItems[index].purchaseType = selectedProd.isLooseItem ? selectedProd.baseUnit : 'pcs';
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotalStock = (item) => {
    const selectedProd = products.find(p => p._id === item.productId);
    if (!selectedProd) return item.quantity;

    const qty = Number(item.quantity);
    if (item.purchaseType === 'box') {
      return qty * Number(selectedProd.packaging?.piecesPerUnit || 1);
    }
    return qty; 
  };

  const handleSubmitPO = async (e) => {
    e.preventDefault();
    
    if (!formData.supplierId) return toast.error(t('selectSupplier'));

    let totalAmount = 0;
    formData.items.forEach(item => {
      totalAmount += (Number(item.quantity) * Number(item.costPrice));
    });

    try {
      // ✅ FIX: store_admin ke liye bhi branchId bhejein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;

      const payload = {
        ...formData,
        totalAmount,   // ⚠️ Always PKR base
        ...(isAdminLevel && branchId ? { branchId } : {})
      };

      await api.post('/purchases', payload);
      toast.success('Purchase Order created!');
      setIsPOModalOpen(false);
      
      setFormData({ 
        supplierId: '', invoiceNumber: '', expectedDeliveryDate: '', notes: '', 
        items: [{ productId: '', quantity: 1, costPrice: 0, purchaseType: 'pcs' }] 
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create PO');
    }
  };

  const handleReceive = async (poId) => {
    if(!window.confirm(t('confirmReceive'))) return;
    try {
      await api.put(`/purchases/${poId}/receive`);
      toast.success('Stock received and inventory updated!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to receive PO');
    }
  };

  const filteredPurchases = purchases.filter(po => 
    po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (po.supplierId?.name && po.supplierId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formTotal = formData.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.costPrice)), 0);

  // ✅ Currency formatter
  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('purchaseOrders')}</h1>
          <p className="text-slate-500 mt-1">{t('manageSupplierOrders')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition text-sm font-bold whitespace-nowrap"
          >
            <UserPlus size={18} /> {t('addSupplier')}
          </button>
          
          <button 
            onClick={() => setIsPOModalOpen(true)}
            className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-md transition text-sm font-bold whitespace-nowrap"
          >
            <Plus size={18} /> {t('newPurchaseOrder')}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPO')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="p-4 font-semibold">{t('poNumber')}</th>
              <th className="p-4 font-semibold">{t('supplier')}</th>
              <th className="p-4 font-semibold">{t('date')}</th>
              <th className="p-4 font-semibold">{t('totalAmount')}</th>
              <th className="p-4 font-semibold">{t('status')}</th>
              <th className="p-4 font-semibold text-center">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredPurchases.map((po) => (
              <tr key={po._id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-teal-700 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400"/> {po.poNumber}
                </td>
                <td className="p-4 font-medium text-slate-800">
                  {po.supplierId?.name || 'N/A'}
                  {po.invoiceNumber && <span className="block text-[10px] text-slate-400">Inv: {po.invoiceNumber}</span>}
                </td>
                <td className="p-4 text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-slate-900">{fmt(po.totalAmount)}</td>
                <td className="p-4">
                  {po.status === 'Received' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <CheckCircle2 size={12} /> {t('received')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <Truck size={12} /> {t('pending')}
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {po.status === 'Pending' && (
                    <button onClick={() => handleReceive(po._id)} className="text-xs font-bold text-teal-600 hover:underline bg-teal-50 px-3 py-1 rounded-lg">{t('markReceived')}</button>
                  )}
                  <button className="p-1.5 text-slate-400 hover:text-slate-800 ml-2"><MoreHorizontal size={18}/></button>
                </td>
              </tr>
            ))}
            {filteredPurchases.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-slate-500">
                  <Package size={48} className="mx-auto mb-3 text-slate-300" />
                  <p>{t('noPurchaseOrders')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('addNewSupplier')}</h2>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddNewSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('supplierName')} *</label>
                <input type="text" required value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Metro Cash & Carry" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('phoneNumber')} *</label>
                <input type="text" required value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. 03001234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('emailOptional')}</label>
                <input type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="supplier@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('addressOptional')}</label>
                <textarea rows="2" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Supplier address..." />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">{t('cancel')}</button>
                <button type="submit" disabled={isSubmittingSupplier} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={16}/> {isSubmittingSupplier ? t('saving') : t('saveSupplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {isPOModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('createPurchaseOrder')}</h2>
                <p className="text-xs text-slate-500">{t('generatePO')}</p>
              </div>
              <button onClick={() => setIsPOModalOpen(false)} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-100"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="poForm" onSubmit={handleSubmitPO} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('selectSupplier')} *</label>
                    <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">{t('chooseSupplier')}</option>
                      {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('supplierInvoiceNo')}</label>
                    <div className="relative">
                      <FileDigit className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input type="text" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. INV-12345" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('deliveryDate')}</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input type="date" value={formData.expectedDeliveryDate} onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-slate-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-slate-800">{t('orderItems')}</label>
                    <button type="button" onClick={handleAddItem} className="text-sm text-teal-600 font-bold hover:underline bg-teal-50 px-3 py-1 rounded-lg">+ {t('addItem')}</button>
                  </div>
                  
                  {formData.items.map((item, index) => {
                    const selectedProd = products.find(p => p._id === item.productId);
                    const totalStock = calculateTotalStock(item);
                    const isBox = selectedProd && !selectedProd.isLooseItem && selectedProd.packaging?.piecesPerUnit > 1;

                    return (
                      <div key={index} className="flex flex-wrap gap-3 mb-4 items-end bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                        
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">{t('product')}</label>
                          <select required value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500">
                            <option value="">{t('selectProduct')}</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                          </select>
                        </div>

                        <div className="w-24">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">{t('unit')}</label>
                          <select disabled={!selectedProd} value={item.purchaseType} onChange={(e) => handleItemChange(index, 'purchaseType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400">
                            {isBox ? (
                              <>
                                <option value="box">{t('box')}</option>
                                <option value="pcs">{t('pieces')}</option>
                              </>
                            ) : selectedProd?.baseUnit === 'kg' ? (
                              <option value="kg">KG</option>
                            ) : (
                              <option value="pcs">{t('pieces')}</option>
                            )}
                          </select>
                        </div>

                        <div className="w-24">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">{t('quantity')}</label>
                          <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" />
                        </div>

                        <div className="w-32">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            {t('costUnit')} <span className="text-[10px] text-slate-400 font-normal">(PKR)</span>
                          </label>
                          <input type="number" min="0" required value={item.costPrice} onChange={(e) => handleItemChange(index, 'costPrice', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" />
                        </div>

                        <div className="w-32 bg-teal-50 border border-teal-100 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-teal-700 font-bold uppercase mb-0.5 flex items-center justify-center gap-1"><Calculator size={10}/> {t('totalStock')}</p>
                          <p className="text-sm font-black text-teal-800">{totalStock} {selectedProd?.baseUnit || 'pcs'}</p>
                        </div>

                        {formData.items.length > 1 && (
                          <button type="button" onClick={() => handleRemoveItem(index)} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><StickyNote size={16} className="text-slate-400"/> {t('orderNotes')}</label>
                  <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Any special instructions for this order..." />
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-slate-500 text-sm font-medium">{t('totalOrderValue')}:</div>
                <div className="text-2xl font-bold text-slate-900 flex items-center gap-1">
                  {fmt(formTotal)}
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => setIsPOModalOpen(false)} type="button" className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200">{t('cancel')}</button>
                <button type="submit" form="poForm" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition">
                  <Save size={18}/> {t('createOrder')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseOrders;