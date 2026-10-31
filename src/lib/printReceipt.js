import api from './api';
import { getStoreSettings } from './formatCurrency';

// ✅ Helper: PKR → display currency conversion (traditional divide model)
const convertAmount = (pkrAmount, exchangeRate) => {
  const rate = Number(exchangeRate) > 0 ? Number(exchangeRate) : 1;
  return (Number(pkrAmount) || 0) / rate;
};

// ✅ Helper: format with currency symbol
const formatWithCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${(Number(amount) || 0).toFixed(2)}`;
  }
};

// ==========================================
// 1. MAIN SALE RECEIPT (Original)
// ==========================================
export const printReceipt = async (sale, passedStoreInfo = null) => {
  let storeInfo = passedStoreInfo;

  if (!storeInfo) {
    try {
      const branchId = sale.branchId?._id || sale.branchId;
      const { data } = await api.get(`/settings?branchId=${branchId}`);
      storeInfo = data;
    } catch (error) {
      console.error("Settings fetch failed for receipt", error);
      storeInfo = {
        storeName: 'Global POS',
        currency: 'PKR',
        exchangeRate: 1,
        receiptFooter: 'Thank you!'
      };
    }
  }

  const displayCurrency = storeInfo?.currency || 'PKR';
  const exchangeRate = Number(storeInfo?.exchangeRate) > 0 ? Number(storeInfo.exchangeRate) : 1;
  const isConverted = displayCurrency !== 'PKR';

  const fmtPKR = (pkr) => formatWithCurrency(pkr, 'PKR');
  const fmtDisplay = (pkr) => formatWithCurrency(convertAmount(pkr, exchangeRate), displayCurrency);
  const fmtPrimary = (pkr) => isConverted ? fmtDisplay(pkr) : fmtPKR(pkr);

  const itemsHtml = sale.items.map(item => {
    const itemTotalPKR = Number(item.total) || 0;
    return `
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;">
      <span>${item.name} x${item.qty}</span>
      <span>${fmtPrimary(itemTotalPKR)}</span>
    </div>
  `;
  }).join('');

  const splitHtml = sale.paymentMethod === 'Split' && sale.splitDetails ? `
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #555;">
      <span>Cash Paid:</span><span>${fmtPrimary(sale.splitDetails.cashAmount || 0)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #555;">
      <span>Card Paid:</span><span>${fmtPrimary(sale.splitDetails.cardAmount || 0)}</span>
    </div>
  ` : '';

  const customerHtml = sale.customerId ? `
    <p style="margin: 2px 0; font-size: 11px;">Customer: ${sale.customerId.name || 'Walk-in'}</p>
  ` : '';

  const discountHtml = sale.discount > 0 ? `
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #27ae60;">
      <span>Loyalty Discount:</span><span>-${fmtPrimary(sale.discount)}</span>
    </div>
  ` : '';

  const conversionNoteHtml = isConverted ? `
    <div class="divider"></div>
    <div style="font-size: 10px; color: #555; text-align: center;">
      <p style="margin: 2px 0;">
        <b>≈ ${fmtDisplay(sale.grandTotal || 0)} ${displayCurrency}</b>
      </p>
      <p style="margin: 2px 0;">
        Rate: 1 ${displayCurrency} = ${exchangeRate} PKR
      </p>
    </div>
  ` : '';

  const html = `
    <html>
      <head>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Courier New', monospace; width: 80mm; padding: 5mm; margin: 0; font-size: 12px; color: #000; }
          .text-center { text-align: center; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .bold { font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <h2 style="margin: 0; font-size: 16px;">${storeInfo?.storeName || 'Global POS'}</h2>
          ${storeInfo?.receiptHeader ? `<p style="margin: 2px 0; font-size: 10px;">${storeInfo.receiptHeader}</p>` : ''}
          <p style="margin: 2px 0; font-size: 10px;">Thank you for shopping!</p>
        </div>
        
        <div class="divider"></div>
        
        <p style="margin: 2px 0; font-size: 11px;">Invoice: <b>${sale.invoiceNumber}</b></p>
        <p style="margin: 2px 0; font-size: 11px;">Date: ${new Date(sale.createdAt || Date.now()).toLocaleString()}</p>
        <p style="margin: 2px 0; font-size: 11px;">Cashier: ${sale.cashierId?.name || 'Admin'}</p>
        ${customerHtml}
        
        <div class="divider"></div>
        
        ${itemsHtml}
        
        <div class="divider"></div>
        
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>Subtotal:</span><span>${fmtPrimary(sale.subTotal || 0)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>Tax:</span><span>${fmtPrimary(sale.taxTotal || 0)}</span>
        </div>
        ${discountHtml}
        
        <div class="divider"></div>
        
        <div style="display: flex; justify-content: space-between;" class="bold">
          <span>TOTAL:</span><span>${fmtPrimary(sale.grandTotal || 0)}</span>
        </div>
        
        ${splitHtml}
        ${conversionNoteHtml}
        
        <div class="divider"></div>
        
        <p class="text-center" style="font-size: 10px; margin-top: 5px;">${storeInfo?.receiptFooter || 'Thank you for shopping!'}</p>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// ==========================================
// 2. REFUND RECEIPT (NAYA)
// ==========================================
export const printRefundReceipt = async (sale, refundDetails, passedStoreInfo = null) => {
  let storeInfo = passedStoreInfo;

  if (!storeInfo) {
    try {
      const branchId = sale.branchId?._id || sale.branchId;
      const { data } = await api.get(`/settings?branchId=${branchId}`);
      storeInfo = data;
    } catch (error) {
      console.error("Settings fetch failed for refund receipt", error);
      storeInfo = {
        storeName: 'Global POS',
        currency: 'PKR',
        exchangeRate: 1,
        receiptFooter: 'Thank you!'
      };
    }
  }

  const displayCurrency = storeInfo?.currency || 'PKR';
  const exchangeRate = Number(storeInfo?.exchangeRate) > 0 ? Number(storeInfo.exchangeRate) : 1;
  const isConverted = displayCurrency !== 'PKR';

  const fmtPKR = (pkr) => formatWithCurrency(pkr, 'PKR');
  const fmtDisplay = (pkr) => formatWithCurrency(convertAmount(pkr, exchangeRate), displayCurrency);
  const fmtPrimary = (pkr) => isConverted ? fmtDisplay(pkr) : fmtPKR(pkr);

  const itemsHtml = refundDetails.itemsRefunded.map(item => {
    const itemTotalPKR = Number(item.refundAmount) || 0;
    return `
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;">
      <span>${item.name} x${item.qty}</span>
      <span>${fmtPrimary(itemTotalPKR)}</span>
    </div>
  `;
  }).join('');

  const conversionNoteHtml = isConverted ? `
    <div class="divider"></div>
    <div style="font-size: 10px; color: #555; text-align: center;">
      <p style="margin: 2px 0;">
        <b>≈ ${fmtDisplay(refundDetails.totalRefundAmount || 0)} ${displayCurrency}</b>
      </p>
      <p style="margin: 2px 0;">
        Rate: 1 ${displayCurrency} = ${exchangeRate} PKR
      </p>
    </div>
  ` : '';

  const html = `
    <html>
      <head>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Courier New', monospace; width: 80mm; padding: 5mm; margin: 0; font-size: 12px; color: #000; }
          .text-center { text-align: center; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .bold { font-weight: bold; font-size: 14px; }
          .refund-title { color: #dc2626; font-weight: bold; font-size: 16px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <h2 style="margin: 0; font-size: 16px;">${storeInfo?.storeName || 'Global POS'}</h2>
          <p class="refund-title">REFUND RECEIPT</p>
        </div>
        
        <div class="divider"></div>
        
        <p style="margin: 2px 0; font-size: 11px;">Original Invoice: <b>${sale.invoiceNumber}</b></p>
        <p style="margin: 2px 0; font-size: 11px;">Refund Date: ${new Date().toLocaleString()}</p>
        <p style="margin: 2px 0; font-size: 11px;">Cashier: ${sale.cashierId?.name || 'Admin'}</p>
        
        <div class="divider"></div>
        
        ${itemsHtml}
        
        <div class="divider"></div>
        
        <div style="display: flex; justify-content: space-between;" class="bold">
          <span>TOTAL REFUNDED:</span><span style="color: #dc2626;">${fmtPrimary(refundDetails.totalRefundAmount || 0)}</span>
        </div>
        
        ${conversionNoteHtml}
        
        <div class="divider"></div>
        
        <p class="text-center" style="font-size: 10px; margin-top: 5px;">Items returned successfully.</p>
        <p class="text-center" style="font-size: 10px;">${storeInfo?.receiptFooter || 'Thank you!'}</p>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};