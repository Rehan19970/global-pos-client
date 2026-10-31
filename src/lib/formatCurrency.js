// client/src/lib/formatCurrency.js
// ============================================================
// ✅ GLOBAL POS — Currency Formatter (Traditional "1 USD = X PKR" Model)
// ============================================================
// Model:
//   - Base currency = PKR (DB mein sab amounts PKR mein stored)
//   - exchangeRate = "1 [display currency] = ? PKR"
//     e.g. USD ke liye 280, AED ke liye 76, INR ke liye 3.4
//   - PKR ke liye exchangeRate = 1 (locked)
//   - Conversion formula: displayAmount = basePKR / exchangeRate
// ============================================================

const DEFAULT_SETTINGS = {
  currency: 'PKR',
  exchangeRate: 1,
};

export const SUPPORTED_CURRENCIES = [
  'PKR', 'USD', 'EUR', 'AED', 'INR', 'GBP', 'SAR',
];

/**
 * Safely read storeSettings from localStorage.
 */
export const getStoreSettings = () => {
  try {
    const raw = localStorage.getItem('storeSettings');
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(raw);

    const currency = SUPPORTED_CURRENCIES.includes(parsed?.currency)
      ? parsed.currency
      : DEFAULT_SETTINGS.currency;

    const rateNum = Number(parsed?.exchangeRate);
    const exchangeRate =
      Number.isFinite(rateNum) && rateNum > 0 ? rateNum : 1;

    return { currency, exchangeRate };
  } catch (err) {
    console.warn('[formatCurrency] Invalid storeSettings:', err);
    return { ...DEFAULT_SETTINGS };
  }
};

/**
 * Format + convert an amount into the store's selected currency.
 *
 * @param {number|string} amount   - Amount in BASE currency (PKR)
 * @param {object}        options
 * @param {object}        [options.settings]    - Override { currency, exchangeRate }
 * @param {boolean}       [options.withSymbol]  - Show currency symbol (default true)
 * @param {boolean}       [options.convert]     - Apply exchange rate (default true)
 * @returns {string}  e.g. "Rs 28,000.00"  ya  "$100.00"
 */
export const formatCurrency = (amount, options = {}) => {
  const { settings, withSymbol = true, convert = true } = options;

  const resolved = settings || getStoreSettings();
  const currency = SUPPORTED_CURRENCIES.includes(resolved.currency)
    ? resolved.currency
    : DEFAULT_SETTINGS.currency;

  const rateNum = Number(resolved.exchangeRate);
  const exchangeRate =
    Number.isFinite(rateNum) && rateNum > 0 ? rateNum : 1;

  // 2. Sanitize amount
  let numeric;
  if (typeof amount === 'number') {
    numeric = amount;
  } else if (typeof amount === 'string') {
    numeric = parseFloat(amount.replace(/[^\d.-]/g, ''));
  } else {
    numeric = Number(amount);
  }
  if (!Number.isFinite(numeric)) numeric = 0;

  // 3. Convert base PKR → display currency
  //    ✅ Traditional model: display = PKR / rate
  //    PKR → PKR: rate = 1, so display = PKR
  //    PKR → USD: rate = 280, so display = PKR / 280
  const converted = convert ? numeric / exchangeRate : numeric;

  // 4. Format via Intl (fallback-safe)
  try {
    return new Intl.NumberFormat(undefined, {
      style: withSymbol ? 'currency' : 'decimal',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch (err) {
    console.warn(`[formatCurrency] Intl failed for "${currency}":`, err);
    const fixed = converted.toFixed(2);
    return withSymbol ? `${currency} ${fixed}` : fixed;
  }
};

/**
 * Get only the currency symbol for a given code.
 */
export const getCurrencySymbol = (currency = 'PKR') => {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value || currency;
  } catch {
    return currency;
  }
};

/**
 * Backward-compatible helpers
 */
export const getCurrency = () => getStoreSettings().currency;
export const getExchangeRate = () => getStoreSettings().exchangeRate;

export default formatCurrency;