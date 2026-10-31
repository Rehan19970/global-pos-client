import { useState, useEffect } from 'react';
import { Search, Eye, ShoppingBag, RotateCcw, X, History, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import { printRefundReceipt } from '../../lib/printReceipt'; // ✅ NAYA: Refund Print
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Orders = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();

  // ✅ Currency sync state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [refundItems, setRefundItems] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [selectedBranch]);

  const fetchOrders = async () => {
    try {
      let url = '/pos/sales';
      
      // ✅ FIX: store_admin aur super_admin dono handle karein
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) url = `/pos/sales?branchId=${branchId}`;
      }
      
      const { data } = await api.get(url);
      setOrders(data.sales || []); 
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    
    setRefundItems(order.items.map(item => {
      let totalQty = Number(item.qty) || 1;
      if (item.displayQty) {
        const match = item.displayQty.match(/[\d.]+/);
        if (match) totalQty = Number(match[0]); 
      }
      
      const alreadyRefunded = Number(item.refundedQty) || 0;
      const remainingQty = totalQty - alreadyRefunded;

      return {
        productId: item.productId,
        name: item.name,
        maxQty: remainingQty > 0 ? remainingQty : 0, 
        refundQty: 0,
        price: item.price, 
        perUnitPrice: item.perUnitPrice, 
        qty: item.qty, 
        displayQty: item.displayQty, 
        originalBaseQty: item.originalBaseQty || item.qty,
        refundedQty: alreadyRefunded,
        originalQty: totalQty,
        total: item.total // ✅ Item Total save karein
      };
    }));
    setIsDetailModalOpen(true);
  };

  const handleRefundQtyChange = (index, qty) => {
    const updated = [...refundItems];
    updated[index].refundQty = Math.min(Number(qty), updated[index].maxQty);
    setRefundItems(updated);
  };

  const handleRefundSubmit = async () => {
    const itemsToReturn = refundItems
      .filter(item => item.refundQty > 0)
      .map(item => {
        // ✅ FIX: Per Unit Price nikaalne ke liye Sale ke 'total' ko qty se divide karein
        let totalQty = Number(item.qty) || 1;
        if (item.displayQty) {
          const match = item.displayQty.match(/[\d.]+/);
          if (match) totalQty = Number(match[0]);
        }
        
        const itemTotal = item.total || (Number(item.price) * totalQty); 
        const actualPerUnitPrice = itemTotal / totalQty;
        const refundAmt = Number(item.refundQty) * actualPerUnitPrice;

        return {
          productId: item.productId,
          qty: Number(item.refundQty),
          refundAmount: refundAmt
        };
      });

    if (itemsToReturn.length === 0) return toast.error('Please select items to refund');

    try {
      await api.post('/refunds', { 
        saleId: selectedOrder._id, 
        itemsToReturn 
      });
      toast.success('Refund processed successfully!');
      setIsDetailModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Refund failed');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.cashierId?.name && order.cashierId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ FIX: Dynamic Status Badge (Partial Refund ke liye)
  const getStatusBadge = (status, refundAmount = 0, originalTotal = 0) => {
    if (status === 'Refunded') return 'bg-red-100 text-red-700 border-red-200';
    if (refundAmount > 0 && refundAmount < originalTotal) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = (status, refundAmount = 0, originalTotal = 0) => {
    if (status === 'Refunded') return t('refunded');
    if (refundAmount > 0 && refundAmount < originalTotal) return 'Partial Refund';
    return t('completed');
  };

  // ✅ Currency formatter
  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('ordersHistory')}</h1>
          <p className="text-slate-500 mt-1">{t('viewManageSales')}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder={t('searchByInvoiceCashier')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-2 pl-4 pr-10 outline-none focus:ring-2 focus:ring-teal-500 font-medium cursor-pointer">
            <option value="All">{t('allStatus')}</option>
            <option value="Completed">{t('completed')}</option>
            <option value="Refunded">{t('refunded')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold">{t('invoiceNo')}</th>
                <th className="p-4 font-semibold">{t('dateTime')}</th>
                <th className="p-4 font-semibold">{t('cashier')}</th>
                <th className="p-4 font-semibold">{t('status')}</th>
                <th className="p-4 font-semibold text-right">{t('total')}</th>
                <th className="p-4 font-semibold text-center">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-lg font-medium">{t('noOrdersFound')}</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const refundedAmt = order.refundDetails?.totalRefundAmount || 0;
                  const netTotal = order.grandTotal - refundedAmt;

                  return (
                    <tr key={order._id} className="hover:bg-slate-50 transition group">
                      <td className="p-4 font-bold text-teal-700">{order.invoiceNumber}</td>
                      <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="p-4 font-medium text-slate-800">{order.cashierId?.name || 'Unknown'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status, refundedAmt, order.grandTotal)}`}>
                          {getStatusText(order.status, refundedAmt, order.grandTotal)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        {/* ✅ FIX: Agar refund hua hai to net amount aur cut amount dikhayein */}
                        {refundedAmt > 0 ? (
                          <div className="flex flex-col items-end">
                            <span>{fmt(netTotal)}</span>
                            <span className="text-[10px] text-slate-400 line-through font-normal">{fmt(order.grandTotal)}</span>
                          </div>
                        ) : (
                          fmt(order.grandTotal)
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleViewOrder(order)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details & Refund">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAIL & REFUND MODAL */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('invoice')}: {selectedOrder.invoiceNumber}</h2>
                <p className="text-sm text-slate-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-100"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* REFUND HISTORY */}
              {selectedOrder.refundDetails && selectedOrder.refundDetails.itemsRefunded?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                    <History size={18} /> {t('refundHistory')}
                  </h3>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-red-200">
                      <div>
                        <p className="text-xs text-red-700 font-medium">
                          {t('refundedOn')}: {new Date(selectedOrder.refundDetails.refundedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-red-700 font-bold">
                          {t('totalRefunded')}: {fmt(selectedOrder.refundDetails.totalRefundAmount)}
                        </p>
                        {/* ✅ NAYA: Print Refund Receipt Button */}
                        <button 
                          onClick={() => printRefundReceipt(selectedOrder, selectedOrder.refundDetails)}
                          className="flex items-center gap-1 bg-white hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          <Printer size={14} /> Print
                        </button>
                      </div>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-red-800">
                          <th className="pb-2 font-semibold">{t('product')}</th>
                          <th className="pb-2 font-semibold">{t('qtyRefunded')}</th>
                          <th className="pb-2 font-semibold text-right">{t('amount')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {selectedOrder.refundDetails.itemsRefunded.map((ri, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-slate-700">{ri.name}</td>
                            <td className="py-2 text-slate-700">{ri.qty}</td>
                            <td className="py-2 text-right font-bold text-red-600">{fmt(ri.refundAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ITEMS PURCHASED */}
              <h3 className="font-bold text-slate-800 mb-3">{t('itemsPurchased')}</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="p-3">{t('product')}</th>
                      <th className="p-3">{t('price')}</th>
                      <th className="p-3">{t('totalQty')}</th>
                      <th className="p-3">{t('total')}</th>
                      {selectedOrder.status !== 'Refunded' && <th className="p-3 text-center">{t('refundQty')}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className={refundItems[index]?.refundedQty > 0 ? 'bg-red-50/30' : ''}>
                        <td className="p-3 font-medium text-slate-800">{item.name}</td>
                        <td className="p-3">{fmt(item.price)}</td>
                        <td className="p-3 font-bold text-slate-700">
                          {item.displayQty || `${item.qty} pcs`}
                        </td>
                        <td className="p-3 font-bold">{fmt(item.total)}</td>
                        
                        {selectedOrder.status !== 'Refunded' && refundItems[index]?.maxQty > 0 && (
                          <td className="p-3 text-center">
                            <input 
                              type="number" 
                              min="0" 
                              max={refundItems[index]?.maxQty || 1}
                              value={refundItems[index]?.refundQty || 0}
                              onChange={(e) => handleRefundQtyChange(index, e.target.value)}
                              className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </td>
                        )}
                        {selectedOrder.status !== 'Refunded' && (refundItems[index]?.maxQty <= 0) && (
                          <td className="p-3 text-center text-xs text-red-500 font-bold">{t('fullyRefunded')}</td>
                        )}
                        {selectedOrder.status === 'Refunded' && (
                          <td className="p-3 text-center text-xs text-red-500 font-bold">{t('refunded')}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ORDER SUMMARY */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                <div className="flex justify-between mb-1"><span className="text-slate-500">{t('subtotal')}:</span><span>{fmt(selectedOrder.subTotal)}</span></div>
                <div className="flex justify-between mb-1"><span className="text-slate-500">{t('tax')}:</span><span>{fmt(selectedOrder.taxTotal)}</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between mb-1 text-green-600"><span>{t('discount')}:</span><span>-{fmt(selectedOrder.discount)}</span></div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 mt-2">
                  <span>{t('total')}:</span><span className="text-teal-700">{fmt(selectedOrder.grandTotal)}</span>
                </div>
                {selectedOrder.refundDetails?.totalRefundAmount > 0 && (
                  <div className="flex justify-between font-bold text-red-600 mt-1">
                    <span>{t('totalRefunded')}:</span><span>-{fmt(selectedOrder.refundDetails.totalRefundAmount)}</span>
                  </div>
                )}
                {selectedOrder.refundDetails?.totalRefundAmount > 0 && (
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 mt-2">
                    <span>Net Total:</span><span className="text-teal-700">{fmt(selectedOrder.grandTotal - selectedOrder.refundDetails.totalRefundAmount)}</span>
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-500 text-right">{t('paymentMethod')}: <span className="font-bold">{selectedOrder.paymentMethod}</span></div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition">{t('close')}</button>
              
              {selectedOrder.status !== 'Refunded' && refundItems.some(i => i.maxQty > 0) && (
                <button 
                  onClick={handleRefundSubmit}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition"
                >
                  <RotateCcw size={18} /> {t('processRefund')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;