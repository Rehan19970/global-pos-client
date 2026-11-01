import { useState, useEffect, useRef } from 'react';
import { 
  Search, ScanLine, Trash2, Plus, Minus, CreditCard, 
  Banknote, User, ShoppingCart, PauseCircle, PlayCircle, X, BookOpen, Printer, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useCartStore from '../../store/cartStore';
import api from '../../lib/api';
import BarcodeScanner from './components/BarcodeScanner';
import CustomerModal from './components/CustomerModal';
import LooseItemModal from './components/LooseItemModal'; 
import { printReceipt } from '../../lib/printReceipt'; 
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';

const PosTerminal = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ Mobile View Tab State ('products' ya 'cart')
  const [mobileTab, setMobileTab] = useState('products'); 

  const [heldSales, setHeldSales] = useState([]);
  const [showHeldModal, setShowHeldModal] = useState(false);
  
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState({ cash: 0, card: 0 });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [selectedLooseItem, setSelectedLooseItem] = useState(null);

  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  const [posSettings, setPosSettings] = useState({
    taxRate: 5,
    autoPrint: false,
    paymentMethods: { cash: true, card: true, mobileWallet: true }
  });

  const [usbScanBuffer, setUsbScanBuffer] = useState('');
  const usbInputRef = useRef(null);

  const { cart, addToCart, removeFromCart, updateQty, clearCart } = useCartStore();

  // ✅ DEMO USER AUTO SHIFT START LOGIC
  useEffect(() => {
    const autoStartDemoShift = async () => {
      const isDemoUser = user?.isDemo || user?.role === 'demo';
      
      if (isDemoUser) {
        try {
          const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
          const shiftsRes = await api.get(`/shifts?branchId=${branchId}`);
          const activeShift = shiftsRes.data.find(s => s.status === 'Open');

          if (!activeShift) {
            await api.post('/shifts/open', {
              openingCash: 0,
              branchId: branchId,
              cashierId: user._id
            });
            toast.success('Demo Shift Auto-Started! Welcome.');
          }
        } catch (error) {
          console.error("Auto shift start failed:", error);
        }
      }
    };

    if (user && (selectedBranch || user?.branchId)) {
      autoStartDemoShift();
    }
  }, [user, selectedBranch]);

  useEffect(() => {
    if (clearCart) clearCart(); 
    setSelectedCustomer(null); 
    fetchData();
  }, [selectedBranch]);

  useEffect(() => {
    const focusInterval = setInterval(() => {
      const activeTag = document.activeElement?.tagName;
      const isInputActive = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
      
      if (usbInputRef.current && !isInputActive) {
        usbInputRef.current.focus();
      }
    }, 1000);

    return () => clearInterval(focusInterval);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let query = '';
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      
      if (isAdminLevel) {
        const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
        if (branchId) {
          query = `?branchId=${branchId}`;
        } else {
          setProducts([]);
          setCategoriesList([]);
          setIsLoading(false);
          return;
        }
      }

      const prodRes = await api.get(`/products${query}`);
      const productList = prodRes.data.products || prodRes.data;

      const catRes = await api.get(`/categories${query}`);
      setCategoriesList(catRes.data);

      const invRes = await api.get(`/inventory${query}`);
      const inventoryData = invRes.data || [];

      const productsWithStock = productList.map(p => {
        const inv = inventoryData.find(i => 
          (i.productId?._id === p._id) || (i.productId === p._id)
        );
        return { 
          ...p, 
          stockQuantity: inv ? inv.stockQuantity : 0 
        };
      });
      setProducts(productsWithStock); 

      const setRes = await api.get(`/settings${query}`);
      if (setRes.data) {
        setPosSettings(prev => ({ ...prev, ...setRes.data }));
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [t('all'), ...categoriesList.map(c => c.name)];

  const filteredProducts = products.filter(p => 
    (activeCategory === t('all') || activeCategory === 'All' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const taxRate = posSettings.taxRate || 0;
  const tax = subTotal * (taxRate / 100); 
  const baseGrandTotal = subTotal + tax;

  const loyaltyDiscount = selectedCustomer?.loyaltyPoints > 0 
    ? Math.min(selectedCustomer.loyaltyPoints, baseGrandTotal) 
    : 0;
  const grandTotal = baseGrandTotal - loyaltyDiscount;

  const handleProductClick = (product) => {
    if (product.isLooseItem) {
      setSelectedLooseItem(product);
    } else {
      addToCart(product);
    }
  };

  const handleUsbScan = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const barcode = usbScanBuffer.trim();
      if (barcode) {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
          if (product.stockQuantity <= 0) {
            toast.error(`${product.name} ${t('outOfStockToast')}`);
          } else {
            handleProductClick(product);
            toast.success(`${product.name} ${t('addedToCart')}`);
          }
        } else {
          toast.error(t('productNotFoundToast'));
        }
        setUsbScanBuffer('');
      }
    }
  };

  const handleCheckout = async (method, splitData = null) => {
    if (cart.length === 0) return toast.error(t('cartEmptyToast'));
    
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    
    if (isAdminLevel) {
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      if (!branchId) {
        return toast.error(t('selectBranchToast'));
      }
    }

    if (method === 'Credit' && !selectedCustomer) {
      return toast.error(t('selectCustomerUdhaarToast'));
    }

    setIsProcessing(true);

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,          
          qty: item.qty,
          total: item.price * item.qty, 
          displayQty: item.displayQty,
          originalBaseQty: item.originalBaseQty || item.qty
        })),
        subTotal,           
        taxTotal: tax,      
        discount: loyaltyDiscount, 
        grandTotal,         
        paymentMethod: method,
        customerId: selectedCustomer?._id,
        splitDetails: splitData,
        branchId: isAdminLevel ? (selectedBranch || user?.branchId?._id || user?.branchId) : undefined 
      };

      const { data } = await api.post('/pos/sale', payload);
      
      toast.success(`${t('saleCompletedVia')} ${method}!`);
      
      if (data.sale && posSettings.autoPrint) {
        await printReceipt(data.sale, storeSettings); 
      } else if (data.sale) {
        toast((toastObj) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold">{t('saleCompleted')}</span>
            <button 
              onClick={() => { printReceipt(data.sale, storeSettings); toast.dismiss(toastObj.id); }} 
              className="bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"
            >
              <Printer size={14}/> {t('printReceipt')}
            </button>
          </div>
        ), { duration: 6000 });
      }
      
      clearCart();
      setSelectedCustomer(null);
      setShowSplitModal(false);

      fetchData(); 
      setMobileTab('products'); // Checkout ke baad mobile par wapas products tab par bhejein

    } catch (error) {
      const errorMsg = error.response?.data?.message || t('checkoutFailed');
      toast.error(errorMsg, { duration: 5000 });
      
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHoldSale = () => {
    if (cart.length === 0) return toast.error(t('cartEmptyToast'));
    const newHold = { id: Date.now(), items: [...cart], time: new Date(), customer: selectedCustomer };
    setHeldSales([...heldSales, newHold]);
    clearCart();
    setSelectedCustomer(null);
    toast.success(t('billHeldToast'));
    setMobileTab('products');
  };

  const handleResumeSale = (hold) => {
    hold.items.forEach(item => addToCart(item));
    setSelectedCustomer(hold.customer);
    setHeldSales(heldSales.filter(s => s.id !== hold.id));
    setShowHeldModal(false);
    toast.success(t('billResumedToast'));
  };

  const handleScanSuccess = (scanData) => {
    if (scanData && scanData.barcode) {
      const product = products.find(p => p.barcode === scanData.barcode);
      
      if (product) {
        if (product.stockQuantity <= 0) {
          toast.error(`${product.name} ${t('outOfStockToast')}`);
        } else {
          if (product.isLooseItem) {
            setSelectedLooseItem(product);
          } else {
            addToCart(product);
            toast.success(`${product.name} ${t('addedToCart')}`);
          }
        }
      } else {
        toast.error(t('productNotFoundToast'));
      }
    }
    setShowScanner(false);
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">{t('loadingTerminal')}</div>;

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#f8fafc] overflow-hidden">
      <input
        ref={usbInputRef}
        type="text"
        value={usbScanBuffer}
        onChange={(e) => setUsbScanBuffer(e.target.value)}
        onKeyDown={handleUsbScan}
        className="opacity-0 absolute w-0 h-0 pointer-events-none"
        placeholder="Scan barcode here"
        tabIndex={-1} 
      />

      {showScanner && (
        <BarcodeScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
      )}

      {showCustomerModal && (
        <CustomerModal 
          onSelectCustomer={(customer) => setSelectedCustomer(customer)} 
          onClose={() => setShowCustomerModal(false)} 
          selectedBranch={selectedBranch || user?.branchId?._id || user?.branchId} 
        />
      )}

      {selectedLooseItem && (
        <LooseItemModal 
          product={selectedLooseItem} 
          onAdd={(cartItem) => addToCart(cartItem)} 
          onClose={() => setSelectedLooseItem(null)} 
        />
      )}

      {/* 📱 MOBILE TABS (Sirf mobile par nazar aayenge) */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 shrink-0">
        <button 
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 ${mobileTab === 'products' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-500'}`}
        >
          <Package size={18} /> Products
        </button>
        <button 
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 ${mobileTab === 'cart' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-500'}`}
        >
          <ShoppingCart size={18} /> Cart ({cart.reduce((a, b) => a + b.qty, 0)})
        </button>
      </div>

      {/* LEFT: PRODUCTS */}
      <div className={`flex-1 flex-col p-4 lg:p-6 min-w-0 border-r border-slate-200 h-full overflow-hidden ${mobileTab === 'products' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* SEARCH BAR & SCANNER */}
        <div className="flex gap-2 lg:gap-4 mb-4 lg:mb-6 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 lg:left-4 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('searchProducts')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 lg:pl-12 pr-4 text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-sm"
            />
          </div>
          
          <button 
            onClick={() => setShowScanner(true)} 
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 lg:px-6 rounded-xl flex items-center gap-2 transition font-medium shadow-sm shrink-0"
          >
            <ScanLine size={20} className="text-teal-600" /> <span className="hidden sm:inline">{t('scan')}</span>
          </button>
        </div>

        <div className="relative flex items-center mb-4 lg:mb-5 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 lg:px-4 py-1.5 rounded-lg font-medium text-xs lg:text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeCategory === cat || (cat === t('all') && activeCategory === 'All')
                    ? 'bg-[#0f766e] text-white shadow-md shadow-teal-500/20' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID - 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 overflow-y-auto pb-6 flex-1 content-start">
          {filteredProducts.map(product => (
            <div 
              key={product._id}
              onClick={() => handleProductClick(product)}
              className="bg-white border border-slate-200 rounded-xl lg:rounded-2xl p-2 lg:p-3 cursor-pointer hover:border-teal-500 hover:shadow-md transition group flex flex-col h-fit"
            >
              <div className="h-24 lg:h-32 bg-slate-50 rounded-lg lg:rounded-xl mb-2 lg:mb-3 overflow-hidden relative">
                {product.imageUrl ? (
                   <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCart size={24} /></div>
                )}
                {product.isLooseItem && (
                  <div className="absolute top-1 lg:top-2 right-1 lg:right-2 bg-orange-500 text-white text-[8px] lg:text-[10px] font-bold px-1.5 lg:px-2 py-0.5 rounded shadow-sm">
                    {t('loose')}
                  </div>
                )}
                <div className={`absolute top-1 lg:top-2 left-1 lg:left-2 px-1.5 lg:px-2 py-0.5 rounded text-[8px] lg:text-[10px] font-bold shadow-sm ${
                  product.stockQuantity > 10 ? 'bg-green-100 text-green-700' : 
                  product.stockQuantity > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.stockQuantity || 0} {product.baseUnit}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-xs lg:text-sm leading-tight truncate">{product.name}</h3>
              <div className="mt-1 lg:mt-2 flex justify-between items-center">
                <span className="text-teal-600 font-bold text-xs lg:text-base">{fmt(product.price)} <span className="text-[9px] lg:text-xs text-slate-400 font-normal">/{product.baseUnit}</span></span>
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-slate-100 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center transition">
                  <Plus size={12} className="lg:w-3.5 lg:h-3.5" />
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-500 text-sm">
              {t('productNotFoundToast')}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: CART */}
      <div className={`w-full lg:w-[400px] bg-white flex-col shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-10 relative h-full ${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
              {/* ✅ Mobile Back Button to Products */}
              <button onClick={() => setMobileTab('products')} className="lg:hidden p-1 -ml-2 text-slate-500 hover:bg-slate-100 rounded">
                <ArrowLeft size={20} />
              </button>
              <ShoppingCart size={18} className="text-teal-600" /> {t('currentOrder')}
            </h2>
            <p className="text-[10px] lg:text-xs text-slate-500">{cart.reduce((a, b) => a + b.qty, 0)} {t('items')}</p>
          </div>
          <div className="flex gap-2">
            {heldSales.length > 0 && (
              <button onClick={() => setShowHeldModal(true)} className="p-1.5 text-orange-500 bg-orange-50 rounded-lg transition flex items-center gap-1 text-[10px] lg:text-[11px] font-bold">
                <PlayCircle size={14} /> {heldSales.length} <span className="hidden sm:inline">{t('held')}</span>
              </button>
            )}
            <button onClick={clearCart} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
          </div>
        </div>

        {/* CUSTOMER SECTION */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          {selectedCustomer ? (
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedCustomer.name}</p>
                <p className="text-[10px] text-teal-600 font-semibold">{t('points')}: {selectedCustomer.loyaltyPoints}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-[10px] text-red-500 font-bold hover:underline">{t('remove')}</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowCustomerModal(true)}
              className="text-xs text-teal-600 font-bold flex items-center gap-1.5 hover:underline"
            >
              <User size={14} /> + {t('addCustomerLoyalty')}
            </button>
          )}
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart size={40} className="text-slate-200 mb-3" />
              <p className="font-medium text-sm text-slate-600">{t('cartEmpty')}</p>
              <p className="text-[10px] text-slate-400 mt-1">{t('scanBarcodeOrClick')}</p>
              {/* Mobile View mein Add products button */}
              <button onClick={() => setMobileTab('products')} className="mt-4 lg:hidden bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-bold text-xs border border-teal-200">
                 Go to Products
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="bg-white border border-slate-100 p-2.5 rounded-xl flex gap-2 items-center shadow-sm relative group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-800 truncate">{item.name}</p>
                  <p className="text-teal-600 text-[10px] font-semibold mt-0.5">
                    {item.displayQty || `${item.qty} pcs`} × {fmt(item.price)}
                  </p>
                </div>
                
                {!item.displayQty && (
                  <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-200 shrink-0">
                    <button onClick={() => updateQty(item._id, item.qty - 1)} className="p-1 hover:text-teal-600 rounded text-slate-500"><Minus size={12} /></button>
                    <span className="w-5 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)} className="p-1 hover:text-teal-600 rounded text-slate-500"><Plus size={12} /></button>
                  </div>
                )}
                {item.displayQty && (
                  <span className="font-bold text-slate-800 text-xs shrink-0">{fmt(item.price * item.qty)}</span>
                )}
                <button onClick={() => removeFromCart(item._id)} className="absolute -top-1.5 -right-1.5 bg-white text-red-500 border border-slate-200 p-1 rounded-full shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition"><Trash2 size={10} /></button>
              </div>
            ))
          )}
        </div>

        {/* BILL / CHECKOUT */}
        <div className="p-4 bg-white border-t border-slate-200 rounded-t-3xl shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] relative z-20">
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-slate-500 text-xs"><span>{t('subtotal')}</span><span>{fmt(subTotal)}</span></div>
            
            {taxRate > 0 && (
              <div className="flex justify-between text-slate-500 text-xs"><span>{t('tax')} ({taxRate}%)</span><span>{fmt(tax)}</span></div>
            )}
            
            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-green-600 text-xs font-bold"><span>{t('loyaltyDiscount')}</span><span>-{fmt(loyaltyDiscount)}</span></div>
            )}
            
            <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-100">
              <span>{t('total')}</span><span className="text-teal-600">{fmt(grandTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <button onClick={() => handleCheckout('Cash')} disabled={isProcessing || cart.length === 0} className="bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 text-white py-2.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition shadow-md shadow-teal-500/20">
              <Banknote size={16} /> <span className="text-[10px] lg:text-[11px]">{t('cash')}</span>
            </button>
            <button onClick={() => handleCheckout('Card')} disabled={isProcessing || cart.length === 0} className="bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 text-slate-700 py-2.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition">
              <CreditCard size={16} /> <span className="text-[10px] lg:text-[11px]">{t('card')}</span>
            </button>
            <button onClick={() => handleCheckout('Credit')} disabled={isProcessing || cart.length === 0} className="bg-orange-50 border border-orange-200 hover:bg-orange-100 disabled:opacity-50 text-orange-700 py-2.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition">
              <BookOpen size={16} /> <span className="text-[10px] lg:text-[11px]">{t('credit')}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowSplitModal(true)} disabled={cart.length === 0} className="bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg font-bold text-[10px] lg:text-[11px] transition disabled:opacity-50">
              {t('splitPayment')}
            </button>
            <button onClick={handleHoldSale} disabled={cart.length === 0} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold text-[10px] lg:text-[11px] transition flex items-center justify-center gap-1 disabled:opacity-50">
              <PauseCircle size={14} /> {t('holdSale')}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}

      {showHeldModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-4 md:p-6 relative">
            <button onClick={() => setShowHeldModal(false)} className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-slate-800 bg-slate-50 p-1 rounded-full"><X size={18} className="md:w-5 md:h-5"/></button>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">{t('heldBills')}</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {heldSales.map((sale, idx) => (
                <div key={sale.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{t('bill')} #{idx + 1}</p>
                    <p className="text-[10px] md:text-xs text-slate-500">{sale.items.length} {t('items')} • {new Date(sale.time).toLocaleTimeString()}</p>
                  </div>
                  <button onClick={() => handleResumeSale(sale)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold w-full sm:w-auto">{t('resume')}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSplitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-4 md:p-6 relative">
            <button onClick={() => setShowSplitModal(false)} className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-slate-800 bg-slate-50 p-1 rounded-full"><X size={18} className="md:w-5 md:h-5"/></button>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{t('splitPayment')}</h2>
            <p className="text-xs md:text-sm text-slate-500 mb-4">{t('totalAmount')}: <span className="font-bold text-slate-900 text-base">{fmt(grandTotal)}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">{t('cashAmount')}</label>
                <input type="number" value={splitAmounts.cash || ''} onChange={e => setSplitAmounts({...splitAmounts, cash: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">{t('cardAmount')}</label>
                <input type="number" value={splitAmounts.card || ''} onChange={e => setSplitAmounts({...splitAmounts, card: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm" placeholder="0.00" />
              </div>
              
              <div className={`p-3 rounded-xl text-xs md:text-sm font-bold ${ (splitAmounts.cash + splitAmounts.card) === grandTotal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                {t('remaining')}: {fmt(grandTotal - (splitAmounts.cash + splitAmounts.card))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3 pt-2">
                <button onClick={() => setShowSplitModal(false)} className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm">{t('cancel')}</button>
                <button 
                  onClick={() => handleCheckout('Split', { cashAmount: splitAmounts.cash, cardAmount: splitAmounts.card })} 
                  disabled={(splitAmounts.cash + splitAmounts.card) !== grandTotal} 
                  className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-sm"
                >
                  {t('confirmPayment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PosTerminal;