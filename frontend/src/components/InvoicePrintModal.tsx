import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Share2, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

// Basic number to words converter (for Malaysian Ringgit / general use)
const numberToWords = (num: number): string => {
  if (!num || num === 0) return "ZERO";
  const a = ["", "ONE ", "TWO ", "THREE ", "FOUR ", "FIVE ", "SIX ", "SEVEN ", "EIGHT ", "NINE ", "TEN ", "ELEVEN ", "TWELVE ", "THIRTEEN ", "FOURTEEN ", "FIFTEEN ", "SIXTEEN ", "SEVENTEEN ", "EIGHTEEN ", "NINETEEN "];
  const b = ["", "", "TWENTY ", "THIRTY ", "FORTY ", "FIFTY ", "SIXTY ", "SEVENTY ", "EIGHTY ", "NINETY "];

  const convertWhole = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + "HUNDRED " + (n % 100 !== 0 ? convertWhole(n % 100) : "");
    if (n < 1000000) return convertWhole(Math.floor(n / 1000)) + "THOUSAND " + (n % 1000 !== 0 ? convertWhole(n % 1000) : "");
    return n.toString(); // Fallback for very large numbers
  };

  const wholePart = Math.floor(Number(num));
  const cents = Math.round((Number(num) - wholePart) * 100);
  
  let res = convertWhole(wholePart) || "";
  if (cents > 0) {
    res += `AND CENTS ${convertWhole(cents) || ""}`;
  }
  return res ? res.trim() : "";
};

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  hiddenRenderer?: boolean;
}

const InvoicePrintModal = ({ isOpen, onClose, sale: initialSale, hiddenRenderer = false }: InvoicePrintModalProps) => {
  const { settings } = useSettings();
  const [isSharing, setIsSharing] = useState(false);

  // Always fetch full sale data to ensure unit, paymentMode, customer are fully populated
  const { data: fullSale, isLoading } = useQuery({
    queryKey: ['invoice-print', initialSale?.id],
    queryFn: async () => (await api.get(`/sales/${initialSale.id}`)).data,
    enabled: isOpen && !!initialSale?.id,
    staleTime: 0,
    gcTime: 0,
  });

  const sale = fullSale || initialSale;

  const { data: customerBalance } = useQuery({
    queryKey: ['customerBalance', sale?.customer?.id],
    queryFn: async () => (await api.get(`/customer-receipts/balance/${sale.customer.id}`)).data,
    enabled: isOpen && !!sale?.customer?.id,
  });

  const pendingAmount = customerBalance?.balance !== undefined
    ? customerBalance.balance
    : (Number(sale?.customer?.openingBalance || 0));

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('printing-modal');
    } else {
      document.body.classList.remove('printing-modal');
    }
    return () => document.body.classList.remove('printing-modal');
  }, [isOpen]);

  if (!isOpen) return null;

  if (isLoading && !hiddenRenderer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white p-6 rounded-md shadow-lg font-bold text-blue-900 flex items-center gap-3">
          <Loader2 className="animate-spin" size={20} /> Loading invoice data...
        </div>
      </div>
    );
  }

  // Fallback data if sale is not fully populated yet
  const invoiceNo = sale?.invoiceNo || '';
  const date = sale?.date ? new Date(sale.date).toISOString().split('T')[0] : '';
  const customerName = sale?.customer?.name || 'CASH A/C\nCounter Sale';
  const items = sale?.items || [];
  const grandTotal = sale?.grandTotal || 0;

  const totalBirds = items.reduce((sum: number, item: any) => sum + (Number(item.noOfBirds) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const buildPdf = (): { blob: Blob; file: File } => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const W = 210, margin = 14, lineH = 6;
    let y = margin;
    const col = margin;

    const addText = (text: string, x: number, yPos: number, opts: any = {}) => {
      doc.setFontSize(opts.size || 10);
      doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
      doc.setTextColor(opts.color || '#000000');
      doc.text(String(text ?? ''), x, yPos, { maxWidth: opts.maxWidth, align: opts.align || 'left' });
    };

    addText('NASA FRESH MART', W/2, y, { size: 14, bold: true, align: 'center' }); y += 5;
    addText('(001634825-A)', W/2, y, { size: 9, align: 'center' }); y += 5;
    addText('NO 8G, JLN 3/2 PANDAN JAYA, 55100 KUALA LUMPUR.', W/2, y, { size: 9, align: 'center' }); y += 5;
    addText('Tel : 0392856786', W/2, y, { size: 9, align: 'center' }); y += 8;
    doc.setDrawColor('#000000'); doc.setLineWidth(0.3);
    doc.line(col, y, W - margin, y); y += 6;
    addText('INVOICE', W/2, y, { size: 12, bold: true, align: 'center' }); y += 6;
    doc.line(col, y, W - margin, y); y += 6;

    doc.setFontSize(9);
    addText('Bill To:', col, y, { bold: true });
    if (sale?.customer?.id) addText(`CUST-${sale.customer.id}`, col, y+5, { bold: true });
    addText(customerName, col, y+10, { bold: true });
    if (sale?.customer?.address) addText(sale.customer.address, col, y+15, { maxWidth: 80 });
    const rightCol = W/2 + 20;
    addText('NO.', rightCol, y, { bold: true }); addText(`: ${invoiceNo}`, rightCol+25, y, { bold: true });
    addText('DATE', rightCol, y+5, { bold: true }); addText(`: ${date}`, rightCol+25, y+5, { bold: true });
    addText('PAY TYPE', rightCol, y+10, { bold: true }); addText(`: ${sale?.paymentMode?.name || 'Cash'}`, rightCol+25, y+10);
    addText('PENDING AMT', rightCol, y+15, { bold: true }); addText(`: ${Number(pendingAmount).toFixed(2)}`, rightCol+25, y+15, { bold: true });
    addText('PAGE', rightCol, y+20, { bold: true }); addText(': 1 of 1', rightCol+25, y+20, { bold: true });
    y += 28; doc.line(col, y, W-margin, y); y += 6;

    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('Code', col, y); doc.text('Description', col+20, y);
    doc.text('Birds', col+90, y, { align: 'center' }); doc.text('Qty', col+110, y, { align: 'right' });
    doc.text('UOM', col+130, y, { align: 'center' }); doc.text('U.Price', col+155, y, { align: 'right' });
    doc.text('Amount', W-margin, y, { align: 'right' });
    y += 2; doc.line(col, y, W-margin, y); y += 6;

    items.forEach((item: any) => {
      doc.setFont('helvetica', 'normal');
      doc.text(item.product?.code || '', col, y);
      doc.text(item.product?.name || '', col+20, y, { maxWidth: 60 });
      doc.text(String(Number(item.noOfBirds) || '-'), col+90, y, { align: 'center' });
      doc.text(String(item.quantity), col+110, y, { align: 'right' });
      doc.text(item.product?.unit?.name || item.product?.unit?.shortCode || 'Nos', col+130, y, { align: 'center' });
      doc.text(Number(item.rate || 0).toFixed(2), col+155, y, { align: 'right' });
      doc.text(Number(item.amount || item.total || 0).toFixed(2), W-margin, y, { align: 'right' });
      y += lineH;
    });

    y += 2; doc.line(col, y, W-margin, y); y += 6;
    addText(`RINGGIT MALAYSIA ${numberToWords(grandTotal)} ONLY`, col, y);
    y += 8; doc.line(col, y, W-margin, y); y += 6;
    if (totalBirds > 0) {
      addText('TOTAL BIRDS :', W-margin-60, y, { bold: true });
      addText(String(totalBirds), W-margin-10, y, { align: 'right' }); y += 6;
    }
    addText('TOTAL : RM', W-margin-60, y, { bold: true });
    addText(Number(grandTotal).toFixed(2), W-margin-10, y, { bold: true, align: 'right' });
    doc.line(W-margin-65, y+2, W-margin, y+2); doc.line(W-margin-65, y+3, W-margin, y+3);
    y += 25;
    addText('Authorised Signature', W-30, y, { size: 9, align: 'center' });
    doc.line(W-60, y-4, W-10, y-4);

    const blob = doc.output('blob');
    return { blob, file: new File([blob], `Invoice_${invoiceNo}.pdf`, { type: 'application/pdf' }) };
  };

  const handleShare = () => {
    setIsSharing(true);
    let blob: Blob, file: File;
    try {
      ({ blob, file } = buildPdf());
    } catch (err) {
      toast.error('Failed to generate invoice PDF.');
      console.error('Share invoice error:', err);
      setIsSharing(false);
      return;
    }

    // navigator.share must be called synchronously within the user gesture
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: `Invoice ${invoiceNo}` })
        .catch(() => { /* user cancelled or share failed — fall through to download */ })
        .finally(() => setIsSharing(false));
      return;
    }

    // Fallback: download the PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsSharing(false);
  };


  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:absolute print:top-0 print:left-0 print:block print:bg-transparent print:m-0 print:p-0 print-invoice-container">
      <div className="bg-white w-[210mm] h-[97vh] flex flex-col rounded-md shadow-2xl relative print:w-full print:shadow-none print:h-auto print:min-h-[250mm]">
        
        {/* Header - Screen Only */}
        <div className="flex justify-between items-center bg-[#111827] text-white p-3 rounded-t-md print:hidden">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Printer size={16} />
            <span>Invoice - {invoiceNo}</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleShare} disabled={isSharing} className="bg-[#25D366] hover:bg-[#1EBE55] disabled:opacity-70 text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] font-bold transition-colors">
              {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} 
              {isSharing ? 'Preparing...' : 'Share Invoice'}
            </button>
            <button type="button" onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] font-bold transition-colors">
              <Printer size={14} /> Print
            </button>
            <button type="button" onClick={onClose} className="hover:text-red-400 transition-colors ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="flex-1 overflow-auto flex flex-col p-8 font-sans text-black print:p-6 bg-white">
          <div className="text-center mb-3 print:pt-4">
            <div className="text-lg font-bold uppercase">NASA FRESH MART <span className="text-xs font-normal">(001634825-A)</span></div>
            <p className="mt-1 text-[11px]">NO 8G, JLN 3/2 PANDAN JAYA, 55100 KUALA LUMPUR.</p>
            <p className="text-[11px]">Tel : 0392856786</p>
          </div>
          
          <div className="border-t border-b border-black py-1 mb-4 text-center font-bold text-base uppercase tracking-wider">
            INVOICE
          </div>
          
          <div className="flex justify-between mb-6 text-[11px]">
            {/* Left Column */}
            <div className="w-1/2 pr-4">
               <div className="flex">
                 <span className="w-16 font-bold">Bill To:</span>
                 <div>
                   <p className="font-bold">{sale?.customer?.id ? `CUST-${sale.customer.id}` : ''}</p>
                   <p className="font-bold">{customerName}</p>
                   <p>{sale?.customer?.address || ''}</p>
                 </div>
               </div>
               <div className="mt-4 flex gap-4">
                 <span className="font-bold">TEL: {sale?.customer?.phone || ''}</span>
                 <span className="font-bold">FAX: </span>
               </div>
               <p className="font-bold">Attn:</p>
            </div>
            
            {/* Right Column */}
            <div className="w-1/2 pl-12 text-[11px]">
               <div className="grid grid-cols-[100px_10px_1fr] gap-y-1">
                 <span className="font-bold">NO.</span><span className="font-bold">:</span><span className="font-bold">{invoiceNo}</span>
                 <span className="font-bold">DATE</span><span className="font-bold">:</span><span className="font-bold">{date}</span>
                 {/* <span className="font-bold">YOUR P/O NO.</span><span className="font-bold">:</span><span></span> */}
                 {/* <span className="font-bold">SALESMAN</span><span className="font-bold">:</span><span></span> */}
                 {/* <span className="font-bold">TERMS</span><span className="font-bold">:</span><span className="font-bold">C.O.D.</span> */}
                 <span className="font-bold">PAY TYPE</span><span className="font-bold">:</span><span>{sale?.paymentMode?.name || 'Cash'}</span>
                 <span className="font-bold">PENDING AMT</span><span className="font-bold">:</span><span className="font-bold">{Number(pendingAmount).toFixed(2)}</span>
                 <span className="font-bold">PAGE</span><span className="font-bold">:</span><span className="font-bold">1 of 1</span>
               </div>
            </div>
          </div>
          
          <table className="w-full text-left border-y border-black mb-4 text-[11px]">
            <thead>
              <tr className="border-b border-black uppercase">
                <th className="py-2 w-[15%] font-bold">Code</th>
                <th className="py-2 w-[35%] font-bold">Description</th>
                <th className="py-2 w-[10%] text-center font-bold">Birds</th>
                <th className="py-2 w-[10%] text-right font-bold">Qty</th>
                <th className="py-2 w-[10%] text-center font-bold">UOM</th>
                <th className="py-2 w-[10%] text-right font-bold">U.Price</th>
                <th className="py-2 w-[10%] text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-1 font-medium">{item.product?.code || ''}</td>
                  <td className="py-1 font-medium">{item.product?.name || ''}</td>
                  <td className="py-1 text-center font-medium">{Number(item.noOfBirds) || '-'}</td>
                  <td className="py-1 text-right font-medium">{item.quantity}</td>
                  <td className="py-1 text-center font-medium">{item.product?.unit?.name || item.product?.unit?.shortCode || 'Nos'}</td>
                  <td className="py-1 text-right font-medium">{Number(item.rate || 0).toFixed(2)}</td>
                  <td className="py-1 text-right font-medium">{Number(item.amount || item.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex-1"></div>

          <div>
            <p className="uppercase mb-4">RINGGIT MALAYSIA {numberToWords(grandTotal)} ONLY</p>
            
            <div className="flex justify-between items-start border-t border-black pt-2">
              <div 
                className="w-[45%] text-[9px] text-black pr-4 html-content leading-tight"
                dangerouslySetInnerHTML={{ __html: settings?.invoiceNotes || '' }}
              />
              <div className="w-[60%] flex flex-col items-end gap-2 font-bold text-sm whitespace-nowrap">
                {totalBirds > 0 && (
                  <div className="flex items-center gap-4">
                    <span>TOTAL BIRDS :</span>
                    <span className="min-w-[100px] text-right inline-block">{totalBirds}</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <span>TOTAL : RM</span>
                  <span className="border-b-2 border-black border-double min-w-[100px] text-right inline-block">{Number(grandTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-24">
              <div className="text-center w-64 border-t border-black pt-2 relative">
                {settings?.signatureImage && (
                  <img 
                    src={settings.signatureImage} 
                    alt="Authorised Signature" 
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 object-contain"
                  />
                )}
                <span className="text-xs">Authorised Signature</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Screen Only */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 rounded-b-md print:hidden">
          <button 
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] disabled:opacity-70 text-white font-bold py-2 px-4 rounded transition-colors shadow-sm"
          >
            {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            {isSharing ? 'Preparing...' : 'Share Invoice'}
          </button>
          
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold py-2 px-4 rounded transition-colors shadow-sm"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
            <button 
              type="button"
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

  return createPortal(modalContent, document.body);
};

export default InvoicePrintModal;
