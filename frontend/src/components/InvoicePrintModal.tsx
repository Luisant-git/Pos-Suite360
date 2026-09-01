import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Share2, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const numberToWords = (num: number): string => {
  if (!num || num === 0) return "ZERO";
  const a = ["", "ONE ", "TWO ", "THREE ", "FOUR ", "FIVE ", "SIX ", "SEVEN ", "EIGHT ", "NINE ", "TEN ", "ELEVEN ", "TWELVE ", "THIRTEEN ", "FOURTEEN ", "FIFTEEN ", "SIXTEEN ", "SEVENTEEN ", "EIGHTEEN ", "NINETEEN "];
  const b = ["", "", "TWENTY ", "THIRTY ", "FORTY ", "FIFTY ", "SIXTY ", "SEVENTY ", "EIGHTY ", "NINETY "];
  const convertWhole = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + "HUNDRED " + (n % 100 !== 0 ? convertWhole(n % 100) : "");
    if (n < 1000000) return convertWhole(Math.floor(n / 1000)) + "THOUSAND " + (n % 1000 !== 0 ? convertWhole(n % 1000) : "");
    return n.toString();
  };
  const wholePart = Math.floor(Number(num));
  const cents = Math.round((Number(num) - wholePart) * 100);
  let res = convertWhole(wholePart) || "";
  if (cents > 0) res += `AND CENTS ${convertWhole(cents) || ""}`;
  return res ? res.trim() : "";
};

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  hiddenRenderer?: boolean;
  autoShare?: boolean;
}

const InvoicePrintModal = ({ isOpen, onClose, sale: initialSale, hiddenRenderer = false, autoShare = false }: InvoicePrintModalProps) => {
  const { settings } = useSettings();
  const [isSharing, setIsSharing] = useState(false);
  const autoShareTriggered = useRef(false);

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

  const invoiceNo = sale?.invoiceNo || '';
  const date = sale?.date ? new Date(sale.date).toISOString().split('T')[0] : '';
  const customerName = sale?.customer?.name || 'CASH A/C\nCounter Sale';
  const items = sale?.items || [];
  const grandTotal = sale?.grandTotal || 0;
  const totalBirds = items.reduce((sum: number, item: any) => sum + (Number(item.noOfBirds) || 0), 0);

  const handleShare = useCallback(async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) {
      toast.error('Invoice content not found.');
      return;
    }
    setIsSharing(true);
    try {
      // Clone element and apply A4 fixed layout for PDF only (modal untouched)
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.cssText = 'width:794px;height:1123px;position:relative;overflow:hidden;background:white;padding:32px;box-sizing:border-box;font-family:Arial,sans-serif;';
      // Force bottom section to absolute bottom in PDF clone
      const bottomDiv = clone.querySelector('.mt-auto') as HTMLElement | null;
      if (bottomDiv) {
        bottomDiv.style.cssText = 'position:absolute;bottom:32px;left:32px;right:32px;';
      }
      document.body.appendChild(clone);
      const blob: Blob = await html2pdf()
        .set({
          margin: 0,
          filename: `Invoice_${invoiceNo}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, width: 794, windowWidth: 794 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(clone)
        .outputPdf('blob');
      document.body.removeChild(clone);

      const file = new File([blob], `Invoice_${invoiceNo}.pdf`, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Invoice ${invoiceNo}` }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_${invoiceNo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Invoice PDF saved.');
      }
    } catch (err) {
      toast.error('Failed to generate invoice PDF.');
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  }, [invoiceNo]);

  // Auto-trigger share once data is loaded
  useEffect(() => {
    if (autoShare && !isLoading && fullSale && !autoShareTriggered.current) {
      autoShareTriggered.current = true;
      setTimeout(() => handleShare(), 300);
    }
  }, [autoShare, isLoading, fullSale, handleShare]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('printing-modal');
    } else {
      document.body.classList.remove('printing-modal');
      autoShareTriggered.current = false;
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

  const handlePrint = () => window.print();

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
        <div id="printable-invoice" className="flex-1 overflow-auto bg-white" style={{fontFamily:'Arial,sans-serif',color:'#000',padding:'24px 32px',position:'relative',minHeight:'257mm',boxSizing:'border-box'}}>
          <div className="text-center mb-3 print:pt-4">
            <div className="text-lg font-bold uppercase">NASA FRESH MART <span className="text-xs font-normal">(001634825-A)</span></div>
            <p className="mt-1 text-[11px]">NO 8G, JLN 3/2 PANDAN JAYA, 55100 KUALA LUMPUR.</p>
            <p className="text-[11px]">Tel : 0392856786</p>
          </div>
          
          <div className="border-t border-b border-black py-1 mb-4 text-center font-bold text-base uppercase tracking-wider">
            INVOICE
          </div>
          
          <div className="flex justify-between mb-6 text-[11px]">
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
            
            <div className="w-1/2 pl-12 text-[11px]">
               <div className="grid grid-cols-[100px_10px_1fr] gap-y-1">
                 <span className="font-bold">NO.</span><span className="font-bold">:</span><span className="font-bold">{invoiceNo}</span>
                 <span className="font-bold">DATE</span><span className="font-bold">:</span><span className="font-bold">{date}</span>
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
          
          <div style={{position:'absolute',bottom:'24px',left:'32px',right:'32px'}}>
            <p style={{textTransform:'uppercase',fontSize:'11px',fontWeight:'500',marginBottom:'10px'}}>RINGGIT MALAYSIA {numberToWords(grandTotal)} ONLY</p>
            <div style={{borderTop:'1px solid #000',paddingTop:'8px',display:'flex',alignItems:'flex-start'}}>
              <div 
                style={{width:'45%',fontSize:'9px',paddingRight:'12px',lineHeight:'1.4'}}
                dangerouslySetInnerHTML={{ __html: settings?.invoiceNotes || '' }}
              />
              <div style={{width:'25%',display:'flex',justifyContent:'center',alignItems:'flex-start',paddingTop:'2px'}}>
                <div style={{display:'flex',flexDirection:'column',gap:'4px',alignItems:'center'}}>
                  {totalBirds > 0 && <span style={{fontWeight:'bold',fontSize:'13px',whiteSpace:'nowrap'}}>TOTAL BIRDS : {totalBirds}</span>}
                  <span style={{fontWeight:'bold',fontSize:'13px',whiteSpace:'nowrap'}}>TOTAL : RM</span>
                </div>
              </div>
              <div style={{width:'30%',display:'flex',flexDirection:'column',alignItems:'flex-end',paddingTop:'2px'}}>
                {totalBirds > 0 && <span style={{fontWeight:'bold',fontSize:'13px',marginBottom:'4px'}}>{totalBirds}</span>}
                <span style={{fontWeight:'bold',fontSize:'13px',borderBottom:'2px solid #000',width:'100%',textAlign:'right',paddingBottom:'1px'}}>{Number(grandTotal).toFixed(2)}</span>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:'40px'}}>
              <div style={{textAlign:'center',width:'220px',borderTop:'1px solid #000',paddingTop:'6px',position:'relative'}}>
                {settings?.signatureImage && (
                  <img 
                    src={settings.signatureImage} 
                    alt="Authorised Signature" 
                    style={{position:'absolute',bottom:'24px',left:'50%',transform:'translateX(-50%)',height:'56px',objectFit:'contain'}}
                  />
                )}
                <span style={{fontSize:'11px'}}>Authorised Signature</span>
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
