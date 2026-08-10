import { X, Printer } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';


// Basic number to words converter (for Malaysian Ringgit / general use)
const numberToWords = (num: number): string => {
  if (num === 0) return "ZERO";
  const a = ["", "ONE ", "TWO ", "THREE ", "FOUR ", "FIVE ", "SIX ", "SEVEN ", "EIGHT ", "NINE ", "TEN ", "ELEVEN ", "TWELVE ", "THIRTEEN ", "FOURTEEN ", "FIFTEEN ", "SIXTEEN ", "SEVENTEEN ", "EIGHTEEN ", "NINETEEN "];
  const b = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

  const convertWhole = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + "HUNDRED " + (n % 100 !== 0 ? convertWhole(n % 100) : "");
    if (n < 1000000) return convertWhole(Math.floor(n / 1000)) + "THOUSAND " + (n % 1000 !== 0 ? convertWhole(n % 1000) : "");
    return n.toString(); // Fallback for very large numbers
  };

  const wholePart = Math.floor(num);
  const cents = Math.round((num - wholePart) * 100);
  
  let res = convertWhole(wholePart);
  if (cents > 0) {
    res += `AND CENTS ${convertWhole(cents)}`;
  }
  return res.trim();
};

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
}

const InvoicePrintModal = ({ isOpen, onClose, sale }: InvoicePrintModalProps) => {
  const { settings } = useSettings();

  if (!isOpen) return null;

  // Fallback data if sale is not fully populated yet
  const invoiceNo = sale?.invoiceNo || 'INV-00123';
  const date = sale?.date ? new Date(sale.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const customerName = sale?.customer?.name || 'CASH A/C\nCounter Sale';
  const items = sale?.items?.length > 0 ? sale.items : [
    { product: { code: 'PTEST100', name: 'Test Multi Filter Product' }, quantity: 1, unit: { name: 'Nos' }, rate: 20.00, amount: 20.00 }
  ];
  const grandTotal = sale?.grandTotal || 20.00;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      // Get all styles to ensure Tailwind works in the iframe
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      let stylesHtml = '';
      styles.forEach(s => stylesHtml += s.outerHTML);
      
      doc.write(`
        <html>
          <head>
            <title>Print Invoice</title>
            ${stylesHtml}
          </head>
          <body class="bg-white text-black p-0 m-0">
            <div class="w-full max-w-[210mm] mx-auto p-5 font-sans">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      doc.close();

      // Clean up iframe after printing dialogue is closed (or after a delay)
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }
  };

  const handleWhatsApp = () => {
    let text = `*NSA FRESH MART - INVOICE*\n`;
    text += `Invoice No: ${invoiceNo}\n`;
    text += `Date: ${date}\n\n`;
    items.forEach((item: any) => {
      text += `${item.quantity}x ${item.product?.name || 'Product'} - ${settings?.currencySymbol || 'RM'} ${item.amount}\n`;
    });
    text += `\n*TOTAL: ${settings?.currencySymbol || 'RM'} ${grandTotal}*`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:bg-white print:relative print:z-auto print:inset-auto overflow-hidden">
      {/* Container - Fixed width for consistent print layout */}
      <div className="bg-white w-[210mm] h-[97vh] flex flex-col rounded-md shadow-2xl relative print:w-full print:shadow-none print:h-auto print:overflow-visible">
        
        {/* Header - Screen Only */}
        <div className="flex justify-between items-center bg-[#111827] text-white p-3 rounded-t-md print:hidden">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Printer size={16} />
            <span>Print Invoice - {invoiceNo}</span>
          </div>
          <button onClick={onClose} className="hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="flex-1 overflow-hidden p-5 font-sans text-black print:p-0 bg-white">
          {/* Company Header */}
          <div className="text-center mb-3">
            <h1 className="text-2xl font-black mb-0.5 tracking-wide">NSA FRESH MART</h1>
            <p className="text-xs font-medium">NO: 80G, JLN 3/2 PANDAN JAYA, 55100 KUALA LUMPUR.</p>
            <p className="text-xs font-medium">Tel : 019-300 1451</p>
          </div>

          {/* Invoice Statement Title */}
          <div className="border-t border-b border-black py-1 text-center mb-3">
            <h2 className="text-sm font-bold tracking-widest">INVOICE STATEMENT</h2>
          </div>

          {/* Details Section */}
          <div className="flex justify-between mb-4 text-xs">
            <div className="w-1/2 pr-4">
              <div className="flex">
                <span className="font-bold w-16">Bill To:</span>
                <div className="font-bold whitespace-pre-line">
                  {customerName}
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-0.5">
                <div className="flex">
                  <span className="font-bold w-16">TEL: -</span>
                  <span className="font-bold">FAX:</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-16">Attn:</span>
                </div>
              </div>
            </div>

            <div className="w-1/2 pl-4 max-w-[280px]">
              <div className="flex justify-between">
                <span className="font-bold">NO.</span>
                <span className="font-bold">: {invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">DATE</span>
                <span className="font-bold">: {date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">YOUR P/O NO.</span>
                <span className="font-bold">: </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">SALESMAN</span>
                <span className="font-bold">: </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">TERMS</span>
                <span className="font-bold">: C.O.D.</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">PAGE</span>
                <span className="font-bold">: 1 of 1</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs mb-3 border-b border-black block">
            <thead>
              <tr className="border-t border-b border-black">
                <th className="py-1.5 text-left font-bold w-1/5">CODE</th>
                <th className="py-1.5 text-left font-bold w-2/5">DESCRIPTION</th>
                <th className="py-1.5 text-right font-bold w-[10%]">QTY</th>
                <th className="py-1.5 text-center font-bold w-[10%]">UOM</th>
                <th className="py-1.5 text-right font-bold w-[10%]">U.PRICE</th>
                <th className="py-1.5 text-right font-bold w-[10%]">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="block pt-1">
              {items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="py-1 align-top font-medium">{item.product?.code || '-'}</td>
                  <td className="py-1 align-top font-medium">{item.product?.name}</td>
                  <td className="py-1 align-top text-right font-medium">{Number(item.quantity).toFixed(1)}</td>
                  <td className="py-1 align-top text-center font-medium">{item.unit?.name || 'Nos'}</td>
                  <td className="py-1 align-top text-right font-medium">{Number(item.rate).toFixed(2)}</td>
                  <td className="py-1 align-top text-right font-medium">{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-between items-end mb-6">
            <div className="w-1/2 pt-2">
              <p className="font-bold text-xs">{settings?.currencySymbol || 'RM'} {numberToWords(Number(grandTotal))} ONLY</p>
            </div>
            <div className="w-1/2 flex justify-end">
              <div className="border-t-2 border-b-[3px] border-double border-black pt-1.5 pb-1 px-2 flex items-center gap-4 min-w-[200px] justify-between">
                <span className="font-bold text-base">TOTAL : {settings?.currencySymbol || 'RM'}</span>
                <span className="font-bold text-lg">{Number(grandTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes & Signature */}
          <div className="flex justify-between items-end text-[10px] mt-auto">
            <div className="w-[60%]">
              <p className="font-medium leading-relaxed">
                <span className="font-bold">Notes: </span> 
                1. All cheques should be crossed and made payable to<br/>
                <span className="ml-10 font-bold">NSA FRESH MART</span><br/>
                <span className="ml-4">2. Goods sold are neither returnable nor refundable. Otherwise a</span><br/>
                <span className="ml-7">cancellation fee of 20% on purchase price will be imposed.</span>
              </p>
            </div>
            <div className="w-[30%] text-center border-t border-black pt-1">
              <p className="font-bold">Authorised Signature</p>
            </div>
          </div>
        </div>

        {/* Footer Actions - Screen Only */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 rounded-b-md print:hidden">
          <button 
            onClick={handleWhatsApp}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-2 px-4 rounded transition-colors shadow-sm"
          >
            <i className="fa fa-whatsapp text-lg"></i>
            WhatsApp
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold py-2 px-4 rounded transition-colors shadow-sm"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicePrintModal;
