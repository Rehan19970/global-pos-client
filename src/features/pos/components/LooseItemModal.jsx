import { useState, useEffect } from 'react';
import { X, Scale, Calculator, Package, Box, Banknote, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency, getStoreSettings } from '../../../lib/formatCurrency';
import { onSettingsUpdated } from '../../../lib/currencyEvents';
import { useLanguage } from '../../../context/LanguageContext';

const LooseItemModal = ({ product, onAdd, onClose }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState('quantity'); 
  const [value, setValue] = useState('');

  // ✅ Currency state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (product?.isLooseItem && (product?.baseUnit === 'kg' || product?.baseUnit === 'g' || product?.baseUnit === 'L')) {
      setMode('weight');
    } else if (product?.packaging?.piecesPerUnit > 1) {
      setMode('quantity');
    } else {
      setMode('quantity');
    }
    setValue('');
  }, [product]);

  if (!product) return null;

  // ✅ Currency formatter
  const fmt = (val) => formatCurrency(val, { settings: storeSettings });

  const price = Number(product.price) || 0;
  const baseUnit = product.baseUnit || 'pcs';
  const piecesPerUnit = Number(product.packaging?.piecesPerUnit) || 1;
  const packUnit = product.packaging?.unitName || 'Box';
  const availableStock = Number(product.stockQuantity) || 0;

  // ⚠️ Base currency code (display ke liye)
  const baseCurrency = storeSettings.currency || 'PKR';

  const numValue = Number(value) || 0;

  let finalAmount = 0;
  let finalBaseQty = 0;
  let displayLabel = '';

  if (mode === 'weight') {
    finalAmount = numValue * price;
    finalBaseQty = numValue; 
    displayLabel = `${numValue} ${baseUnit}`;
  } 
  else if (mode === 'amount') {
    finalAmount = numValue;                       // ⚠️ Always PKR base
    finalBaseQty = price > 0 ? (numValue / price) : 0;
    displayLabel = `${finalBaseQty.toFixed(2)} ${baseUnit}`;
  } 
  else if (mode === 'quantity') {
    finalAmount = numValue * price;
    finalBaseQty = numValue;
    displayLabel = `${numValue} pcs`;
  } 
  else if (mode === 'pack') {
    const pricePerBox = price * piecesPerUnit;
    finalAmount = numValue * pricePerBox;
    finalBaseQty = numValue * piecesPerUnit;
    displayLabel = `${numValue} ${packUnit}${numValue !== 1 ? 's' : ''}`;
  }

  const hasStock = finalBaseQty <= availableStock;
  const isValid = finalBaseQty > 0 && hasStock;

  const handleAdd = () => {
    if (!isValid) return;

    onAdd({
      ...product,
      price: finalAmount,        // ⚠️ PKR base
      qty: 1, 
      displayQty: displayLabel, 
      originalBaseQty: finalBaseQty 
    });
    onClose();
  };

  let stockDisplay = '';
  if (mode === 'pack' || mode === 'quantity') {
    const totalPacks = Math.floor(availableStock / piecesPerUnit);
    stockDisplay = `${totalPacks} ${packUnit}s (${availableStock} pcs)`;
  } else {
    stockDisplay = `${availableStock} ${baseUnit}`;
  }

  // ✅ Dynamic suffix for amount input
  const amountSuffix = baseCurrency;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 truncate">{product.name}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 bg-teal-50/50 border-b border-teal-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">{t('availableStock')}</p>
            <p className="font-bold text-slate-800">{stockDisplay}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium mb-1">{t('rate')}</p>
            <p className="font-bold text-teal-700">
              {fmt(price)}
              <span className="text-xs font-normal text-slate-500">/{baseUnit}</span>
            </p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('sellBy')}</p>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['weight', 'amount', 'quantity', 'pack'].map((m) => {
                if (m === 'weight' && !['kg', 'g', 'L', 'ml'].includes(baseUnit)) return null;
                if (m === 'pack' && piecesPerUnit <= 1) return null;

                const icons = { weight: Scale, amount: Banknote, quantity: Package, pack: Box };
                const labels = { 
                  weight: `${t('by')} ${baseUnit}`, 
                  amount: t('byAmount'), 
                  quantity: t('byPieces'), 
                  pack: `${t('by')} ${packUnit}` 
                };
                const Icon = icons[m];

                return (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setValue(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                      mode === m ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={16} /> {labels[m]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {mode === 'weight' && `${t('enterWeight')} (${baseUnit})`}
              {mode === 'amount' && `${t('enterAmount')} (${amountSuffix})`}
              {mode === 'quantity' && t('enterQuantityPieces')}
              {mode === 'pack' && `${t('enterQuantity')} (${packUnit}s)`}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step={mode === 'weight' ? '0.01' : '1'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 text-2xl font-bold text-slate-800 focus:border-teal-500 focus:ring-0 outline-none transition"
                placeholder="0"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                {mode === 'weight' ? baseUnit : mode === 'amount' ? amountSuffix : mode === 'quantity' ? 'pcs' : packUnit}
              </div>
            </div>
            {mode === 'amount' && (
              <p className="text-[10px] text-slate-500 mt-1.5">
                💡 {t('amountInBaseCurrency') || 'Amount is in base currency'} ({baseCurrency})
              </p>
            )}
          </div>

          <div className={`p-4 rounded-xl border-2 transition-all ${isValid ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">{t('totalToPay')}</span>
              <span className={`text-2xl font-bold ${isValid ? 'text-teal-700' : 'text-slate-400'}`}>
                {fmt(finalAmount)}
              </span>
            </div>
            
            {finalBaseQty > availableStock && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-2">
                <AlertTriangle size={14} /> {t('notEnoughStock')}
              </div>
            )}
            
            {mode !== 'weight' && finalBaseQty > 0 && (
              <p className="text-xs text-slate-500 text-right mt-1">
                ({displayLabel} {t('willBeDeducted')})
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition">
            {t('cancel')}
          </button>
          <button 
            onClick={handleAdd}
            disabled={!isValid}
            className="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> {t('addToCart')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LooseItemModal;