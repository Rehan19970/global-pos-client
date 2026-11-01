import { useState, useEffect, useRef } from 'react';
import {
  Store, Receipt, Percent, Save, Globe,
  ShieldCheck, CreditCard, Printer, Banknote, Smartphone,
  Monitor, Sun, Moon, ScanLine, CheckCircle2, Database, Wifi
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';
import { emitSettingsUpdated } from '../../lib/currencyEvents';

const Settings = () => {
  const { user, selectedBranch } = useAuthStore();
  const { language, setLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [printerConnected, setPrinterConnected] = useState(false);
  const [scannerConnected, setScannerConnected] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const scannerRef = useRef(null);

  const [settings, setSettings] = useState({
    storeName: '',
    language: 'en',
    currency: 'PKR',
    exchangeRate: 1,
    taxRate: 0,
    receiptFooter: '',
    receiptHeader: '',
    receiptPaperSize: '80mm',
    theme: 'light',
    autoPrint: false,
    paymentMethods: { cash: true, card: true, mobileWallet: false, bankTransfer: false },
    hardware: { printerName: '', scannerName: '', cashDrawerConnected: false },
    security: { requirePasswordForRefund: true, autoLogoutMinutes: 15, enable2FA: false }
  });

  useEffect(() => {
    fetchSettings();
  }, [selectedBranch]);

  useEffect(() => {
    if (activeTab === 'hardware') {
      const focusInterval = setInterval(() => {
        if (scannerRef.current) scannerRef.current.focus();
      }, 1000);
      return () => clearInterval(focusInterval);
    }
  }, [activeTab]);

  const buildLocalStoragePayload = (s) => ({
    currency: s.currency || 'PKR',
    exchangeRate: Number(s.exchangeRate) > 0 ? Number(s.exchangeRate) : 1,
    taxRate: Number(s.taxRate) || 0,
    storeName: s.storeName || 'Global POS',
    theme: s.theme || 'light',
    autoPrint: !!s.autoPrint,
  });

  const fetchSettings = async () => {
    try {
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      
      const url = isAdminLevel && branchId
        ? `/settings?branchId=${branchId}`
        : '/settings';

      const { data } = await api.get(url);
      const merged = {
        ...settings,
        ...data,
        language: data.language || 'en',
        currency: data.currency || 'PKR',
        exchangeRate: Number(data.exchangeRate) > 0 ? Number(data.exchangeRate) : 1,
        paymentMethods: { ...settings.paymentMethods, ...(data.paymentMethods || {}) },
        hardware: { ...settings.hardware, ...(data.hardware || {}) },
        security: { ...settings.security, ...(data.security || {}) }
      };
      setSettings(merged);

      if (data.language && data.language !== language) {
        setLanguage(data.language);
      }

      const payload = buildLocalStoragePayload(merged);
      localStorage.setItem('storeSettings', JSON.stringify(payload));
      emitSettingsUpdated(payload);

    } catch (error) {
      if (error.response?.status !== 400) {
        toast.error('Failed to load settings');
      }
    }
  };

  const handleSave = async () => {
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    const branchId = selectedBranch || user?.branchId?._id || user?.branchId;

    if (isAdminLevel && !branchId) {
      return toast.error('Please select a branch from the top dropdown first!');
    }

    if (settings.currency !== 'PKR' && (!settings.exchangeRate || Number(settings.exchangeRate) <= 0)) {
      return toast.error('Exchange rate must be greater than 0 for non-PKR currencies.');
    }

    setIsSaving(true);
    try {
      const payload = {
        ...settings,
        language: settings.language || language,
        ...(isAdminLevel && branchId ? { branchId } : {})
      };

      await api.put('/settings', payload);

      if (settings.language && settings.language !== language) {
        setLanguage(settings.language);
      }

      const lsPayload = buildLocalStoragePayload(settings);
      localStorage.setItem('storeSettings', JSON.stringify(lsPayload));
      emitSettingsUpdated(lsPayload);

      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (section, field) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: !prev[section][field] }
    }));
  };

  const handleDetectPrinter = async () => {
    try {
      if (!('usb' in navigator)) {
        return toast.error('Your browser does not support WebUSB. Please use Google Chrome.');
      }
      toast.loading('Searching for USB Printer...', { id: 'printer' });
      const device = await navigator.usb.requestDevice({ filters: [] });
      if (device) {
        setPrinterConnected(true);
        setSettings(prev => ({ ...prev, hardware: { ...prev.hardware, printerName: device.productName || 'Generic USB Printer' } }));
        toast.success(`Printer Connected: ${device.productName}`, { id: 'printer' });
      }
    } catch (error) {
      toast.error('Printer connection cancelled or failed', { id: 'printer' });
    }
  };

  const handleScannerInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (scannerInput.trim() !== '') {
        setScannerConnected(true);
        setSettings(prev => ({ ...prev, hardware: { ...prev.hardware, scannerName: 'Live USB Scanner (HID)' } }));
        toast.success(`Scanner Detected: ${scannerInput}`, { id: 'scanner' });
        setScannerInput('');
      }
    }
  };

  const previewConvert = (pkrAmount) => {
    const rate = Number(settings.exchangeRate) > 0 ? Number(settings.exchangeRate) : 1;
    return pkrAmount / rate;
  };

  return (
    <div className="w-full min-h-full h-full overflow-y-auto overflow-x-hidden bg-[#f8fafc] flex flex-col p-3 sm:p-5 lg:p-8 box-border">
      
      {activeTab === 'hardware' && (
        <input
          ref={scannerRef}
          type="text"
          value={scannerInput}
          onChange={(e) => setScannerInput(e.target.value)}
          onKeyDown={handleScannerInput}
          className="opacity-0 absolute w-0 h-0"
          autoFocus
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-5 sm:mb-8 gap-3 sm:gap-4 min-w-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">{t('settings')}</h1>
          <p className="text-xs sm:text-base text-slate-500 mt-1 leading-relaxed">Manage your store configuration, hardware, and preferences</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-md transition text-sm font-bold disabled:opacity-70">
            {isSaving ? 'Saving...' : <><Save size={16} /> {t('saveChanges')}</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 min-w-0">
        
        {/* SIDEBAR TABS */}
        <div className="w-full lg:w-64 lg:flex-shrink-0 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:sticky lg:top-0">
            {/* Mobile: Grid layout, Desktop: Vertical list */}
            <nav className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
              {[
                { id: 'general', name: t('general'), icon: Store },
                { id: 'language', name: t('language'), icon: Globe },
                { id: 'receipt', name: t('receipt'), icon: Receipt },
                { id: 'tax', name: t('taxCurrency'), icon: Percent },
                { id: 'payment', name: t('paymentMethods'), icon: CreditCard },
                { id: 'hardware', name: t('hardware'), icon: Printer },
                { id: 'theme', name: t('appearance'), icon: Monitor },
                { id: 'security', name: t('security'), icon: ShieldCheck },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center justify-center lg:justify-start gap-2 px-2 sm:px-5 py-3 sm:py-4 text-[10px] sm:text-sm whitespace-nowrap font-medium transition-colors border-b-2 lg:border-b-0 lg:border-l-4 ${activeTab === tab.id ? 'border-[#0f766e] bg-teal-50/50 text-[#0f766e]' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}>
                  <tab.icon size={14} className={`sm:w-[18px] sm:h-[18px] ${activeTab === tab.id ? 'text-[#0f766e]' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px]">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">Store Information</h2>
              <div className="space-y-3 sm:space-y-4">
                <div><label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">{t('storeName')}</label><input type="text" value={settings.storeName || ''} onChange={e => setSettings({...settings, storeName: e.target.value})} className="w-full min-w-0 max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base text-slate-900" /></div>
                <div><label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">{t('receiptFooter')}</label><textarea rows="2" value={settings.receiptFooter || ''} onChange={e => setSettings({...settings, receiptFooter: e.target.value})} className="w-full min-w-0 max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base text-slate-900"></textarea></div>
              </div>

              <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100">
                <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800 text-sm sm:text-base">{t('autoPrint')}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">{t('autoPrintDesc')}</p>
                  </div>
                  <div onClick={() => setSettings({...settings, autoPrint: !settings.autoPrint})} className={`w-11 h-6 rounded-full relative transition cursor-pointer ${settings.autoPrint ? 'bg-teal-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${settings.autoPrint ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LANGUAGE TAB */}
          {activeTab === 'language' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">{t('selectLanguage')}</h2>
              <p className="text-slate-500 text-xs sm:text-sm mb-4">Choose your preferred language below. All app text will change instantly.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                {[
                  { code: 'en', name: 'English', flag: '🇺🇸' },
                  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
                  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
                  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
                  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
                  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
                  { code: 'fr', name: 'Français', flag: '🇫🇷' },
                  { code: 'es', name: 'Español', flag: '🇪🇸' },
                  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                  { code: 'zh', name: '中文', flag: '🇨🇳' },
                  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                  { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
                  { code: 'ja', name: '日本語', flag: '🇯🇵' },
                ].map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setSettings(prev => ({ ...prev, language: lang.code }));
                    }} 
                    className={`p-3 sm:p-4 rounded-xl border-2 flex items-center gap-2 sm:gap-3 transition hover:border-teal-500 bg-white ${settings.language === lang.code ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}
                  >
                    <span className="text-xl sm:text-2xl">{lang.flag}</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">{lang.name}</span>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-xl mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm font-bold text-blue-800 mb-1">💡 Note:</p>
                <p className="text-[10px] sm:text-xs text-blue-600">Language change is instant and does not require internet or Google Translate.</p>
              </div>
            </div>
          )}

          {/* RECEIPT TAB */}
          {activeTab === 'receipt' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">Receipt Customization</h2>
              <div className="space-y-3 sm:space-y-4">
                <div><label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Receipt Header Message</label><input type="text" value={settings.receiptHeader || ''} onChange={e => setSettings({...settings, receiptHeader: e.target.value})} className="w-full min-w-0 max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none text-sm sm:text-base text-slate-900" /></div>
                <div><label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Paper Size</label><select value={settings.receiptPaperSize || '80mm'} onChange={e => setSettings({...settings, receiptPaperSize: e.target.value})} className="w-full min-w-0 max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none text-sm sm:text-base text-slate-900"><option value="80mm">Thermal 80mm</option><option value="58mm">Thermal 58mm</option><option value="A4">A4 Paper</option></select></div>
              </div>
            </div>
          )}

          {/* TAX & CURRENCY TAB */}
          {activeTab === 'tax' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">Tax & Currency</h2>

              <div className="bg-amber-50 border border-amber-200 p-3 sm:p-4 rounded-xl">
                <p className="text-xs font-bold text-amber-800 mb-1">💡 How Currency Conversion Works:</p>
                <p className="text-[10px] sm:text-xs text-amber-700 leading-relaxed">
                  All prices are stored in <strong>Base Currency (PKR)</strong>.
                  Enter exchange rate as: <strong>1 [foreign currency] = ? PKR</strong>
                  <br />
                  <strong>Example:</strong> For USD, enter <code>280</code> (1 USD = 280 PKR).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Display Currency</label>
                  <select
                    value={settings.currency || 'PKR'}
                    onChange={e => {
                      const newCurrency = e.target.value;
                      setSettings({
                        ...settings,
                        currency: newCurrency,
                        exchangeRate: newCurrency === 'PKR'
                          ? 1
                          : (Number(settings.exchangeRate) > 1 ? Number(settings.exchangeRate) : 280)
                      });
                    }}
                    className="w-full min-w-0 max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base text-slate-900"
                  >
                    <option value="PKR">PKR — Pakistani Rupee (Rs.) ★ Base</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="AED">AED — UAE Dirham (د.إ)</option>
                    <option value="INR">INR — Indian Rupee (₹)</option>
                    <option value="GBP">GBP — British Pound (£)</option>
                    <option value="SAR">SAR — Saudi Riyal (﷼)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Exchange Rate (1 {settings.currency} = ? PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.0001"
                    value={settings.exchangeRate || 1}
                    onChange={e => setSettings({...settings, exchangeRate: Number(e.target.value)})}
                    disabled={settings.currency === 'PKR'}
                    className="w-full min-w-0 max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={settings.currency === 'USD' ? 'e.g. 280' : 'e.g. 76'}
                  />
                  {settings.currency === 'PKR' ? (
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Exchange rate is locked at 1 for base currency (PKR).</p>
                  ) : (
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                      1 <strong>{settings.currency}</strong> = <strong>{settings.exchangeRate || 0}</strong> PKR
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.taxRate || 0}
                    onChange={e => setSettings({...settings, taxRate: Number(e.target.value)})}
                    className="w-full min-w-0 max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base text-slate-900"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-xs font-bold text-slate-600 mb-2">🔍 Live Preview (PKR ÷ Exchange Rate)</p>
                <div className="space-y-1 text-xs sm:text-sm text-slate-700">
                  <p>
                    Base <strong>PKR 1,000</strong> →{' '}
                    <strong className="text-teal-700">
                      {new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: settings.currency || 'PKR',
                      }).format(previewConvert(1000))}
                    </strong>
                  </p>
                  <p>
                    Base <strong>PKR 20,000</strong> →{' '}
                    <strong className="text-teal-700">
                      {new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: settings.currency || 'PKR',
                      }).format(previewConvert(20000))}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">Payment Methods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { id: 'cash', name: 'Cash', icon: Banknote },
                  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'mobileWallet', name: 'Mobile Wallet', icon: Smartphone },
                  { id: 'bankTransfer', name: 'Bank Transfer', icon: Store }
                ].map(method => (
                  <div key={method.id} onClick={() => handleToggle('paymentMethods', method.id)} className={`flex items-center justify-between p-3 sm:p-5 border rounded-xl cursor-pointer transition ${settings.paymentMethods[method.id] ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${settings.paymentMethods[method.id] ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}><method.icon size={16} className="sm:w-5 sm:h-5" /></div>
                      <p className="font-bold text-slate-800 text-xs sm:text-base">{method.name}</p>
                    </div>
                    <div className={`w-9 sm:w-11 h-5 sm:h-6 rounded-full relative transition ${settings.paymentMethods[method.id] ? 'bg-teal-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 bg-white w-3 sm:w-4 h-3 sm:h-4 rounded-full shadow-sm transition-all ${settings.paymentMethods[method.id] ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HARDWARE TAB */}
          {activeTab === 'hardware' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">Device Monitoring</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                <div className={`p-4 sm:p-5 border-2 rounded-2xl bg-slate-50 transition-colors ${printerConnected ? 'border-green-400' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-2 sm:p-3 rounded-xl ${printerConnected ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}><Printer size={20} className="sm:w-6 sm:h-6" /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">USB Printer</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500">Thermal Receipt Printer</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold ${printerConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <Wifi size={10} className="sm:w-3.5 sm:h-3.5" /> {printerConnected ? 'Connected' : 'Offline'}
                    </div>
                  </div>
                  
                  {printerConnected ? (
                    <div className="bg-white border border-green-200 p-2 sm:p-3 rounded-xl flex items-center gap-2 text-green-700 mb-3 sm:mb-4">
                      <CheckCircle2 size={16} className="sm:w-4.5 sm:h-4.5" /> <span className="text-xs sm:text-sm font-bold truncate">{settings.hardware.printerName}</span>
                    </div>
                  ) : (
                    <button onClick={handleDetectPrinter} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition mb-3 sm:mb-4">
                      Connect Printer
                    </button>
                  )}
                  
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-500 mb-1">Printer Name</label>
                    <input type="text" value={settings.hardware?.printerName || ''} onChange={e => setSettings({...settings, hardware: {...settings.hardware, printerName: e.target.value}})} className="w-full min-w-0 max-w-full box-border bg-white border border-slate-200 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none text-slate-900" placeholder="e.g. Epson TM-T82" />
                  </div>
                </div>

                <div className={`p-4 sm:p-5 border-2 rounded-2xl bg-slate-50 transition-colors ${scannerConnected ? 'border-green-400' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-2 sm:p-3 rounded-xl ${scannerConnected ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}><ScanLine size={20} className="sm:w-6 sm:h-6" /></div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">Barcode Scanner</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500">USB HID Scanner</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold ${scannerConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <Wifi size={10} className="sm:w-3.5 sm:h-3.5" /> {scannerConnected ? 'Connected' : 'Offline'}
                    </div>
                  </div>

                  <div className="bg-teal-50 border border-teal-100 p-2 sm:p-3 rounded-xl mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-bold text-teal-800 mb-1">Scan a product to test!</p>
                    <p className="text-[10px] sm:text-xs text-teal-600">Point your USB scanner at any barcode. The status above will turn Green automatically.</p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-500 mb-1">Scanner Name</label>
                    <input type="text" value={settings.hardware?.scannerName || ''} onChange={e => setSettings({...settings, hardware: {...settings.hardware, scannerName: e.target.value}})} className="w-full min-w-0 max-w-full box-border bg-white border border-slate-200 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none text-slate-900" placeholder="e.g. Honeywell 1250g" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* THEME TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">Appearance</h2>
              <p className="text-slate-500 text-xs sm:text-sm mb-4">Choose how POSFlow looks on your screen.</p>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button onClick={() => setSettings({...settings, theme: 'light'})} className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 sm:gap-3 transition ${settings.theme === 'light' ? 'border-teal-500 bg-teal-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <Sun size={24} className={`sm:w-8 sm:h-8 ${settings.theme === 'light' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-slate-800 text-xs sm:text-base">Light Mode</span>
                </button>
                <button onClick={() => setSettings({...settings, theme: 'dark'})} className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 sm:gap-3 transition ${settings.theme === 'dark' ? 'border-teal-500 bg-teal-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <Moon size={24} className={`sm:w-8 sm:h-8 ${settings.theme === 'dark' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-slate-800 text-xs sm:text-base">Dark Mode</span>
                </button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6 break-words">Security Preferences</h2>
              <div className="space-y-3 sm:space-y-4">
                <div onClick={() => handleToggle('security', 'requirePasswordForRefund')} className="flex items-center justify-between gap-3 p-3 sm:p-4 border border-slate-200 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">Require Password for Refunds</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Manager approval required.</p>
                  </div>
                  <div className={`w-9 sm:w-11 h-5 sm:h-6 rounded-full relative transition shrink-0 ${settings.security.requirePasswordForRefund ? 'bg-teal-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 bg-white w-3 sm:w-4 h-3 sm:h-4 rounded-full shadow-sm transition-all ${settings.security.requirePasswordForRefund ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
                
                <div onClick={() => handleToggle('security', 'enable2FA')} className="flex items-center justify-between gap-3 p-3 sm:p-4 border border-slate-200 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">Enable 2FA for Admin</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Two-factor authentication via email.</p>
                  </div>
                  <div className={`w-9 sm:w-11 h-5 sm:h-6 rounded-full relative transition shrink-0 ${settings.security.enable2FA ? 'bg-teal-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 bg-white w-3 sm:w-4 h-3 sm:h-4 rounded-full shadow-sm transition-all ${settings.security.enable2FA ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
                
                <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <p className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2"><Database size={14} className="sm:w-4 sm:h-4"/> Backup & Restore</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Download your store data in JSON format.</p>
                    </div>
                    <button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition shrink-0">Download Backup</button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;