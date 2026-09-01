import { useQuery } from '@tanstack/react-query';
import { X, Printer, FileText, CheckCircle2, Share2 } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import { useState } from 'react';
import InvoicePrintModal from '../../components/InvoicePrintModal';

interface Props {
  saleId: number;
  onClose: () => void;
}

export default function ViewSalesModal({ saleId, onClose }: Props) {
  const { formatCurrency } = useSettings();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [autoShare, setAutoShare] = useState(false);

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sales', saleId],
    queryFn: async () => (await api.get(`/sales/${saleId}`)).data,
    enabled: !!saleId,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-md shadow-lg font-bold text-[#1E3A8A]">Loading invoice details...</div>
      </div>
    );
  }

  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-md shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#3B82F6] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-[16px]">Sales Invoice - {sale.invoiceNo}</h2>
            <div className="flex gap-2 items-center text-[12px] text-blue-100">
              <span>{new Date(sale.date).toISOString().split('T')[0]}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-800 font-bold bg-[#D1FAE5] px-2 py-0.5 rounded">
                <CheckCircle2 size={12} /> PAID
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded font-bold text-[12px] transition-colors"
            >
              <Printer size={14} /> Print
            </button>
            <button 
              onClick={() => { setAutoShare(true); setIsPrintModalOpen(true); }}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE55] px-3 py-1.5 rounded font-bold text-[12px] transition-colors"
            >
              <Share2 size={14} /> Share Invoice
            </button>
            <button onClick={onClose} className="hover:bg-blue-600 p-1.5 rounded transition-colors ml-2"><X size={18} /></button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-[#F8FAFC]">
          <div className="flex gap-6 flex-col md:flex-row">
            
            {/* Left Column - Details */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#1E293B] px-4 py-2 flex items-center gap-2 text-white">
                  <FileText size={16} />
                  <h3 className="font-bold text-[14px]">INVOICE DETAILS</h3>
                </div>
                <div className="p-5 flex justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Bill To</p>
                    <p className="font-bold text-[15px] text-gray-800">{sale.customer?.name || 'Counter Sale'}</p>
                    <p className="text-[13px] text-gray-600 mt-1">{sale.customer?.phone || 'No phone number'}</p>
                    {sale.customer?.address && <p className="text-[13px] text-gray-600 mt-1 max-w-[250px]">{sale.customer.address}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Payment Details</p>
                    <p className="font-bold text-[14px] text-gray-800">{sale.paymentMode?.name || 'CASH'}</p>
                    <p className="text-[13px] text-gray-600 mt-1">Status: Paid</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-2 border-b border-gray-200">
                  <h3 className="font-bold text-[14px] text-gray-800">ITEMIZED BILLING</h3>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left text-[13px] whitespace-nowrap">
                    <thead>
                      <tr className="border-b-2 border-gray-200 text-gray-500">
                        <th className="py-2 px-2 font-bold">Code</th>
                        <th className="py-2 px-2 font-bold">Product</th>
                        <th className="py-2 px-2 font-bold text-right">Qty</th>
                        <th className="py-2 px-2 font-bold text-center">Unit</th>
                        <th className="py-2 px-2 font-bold text-right">Rate</th>
                        <th className="py-2 px-2 font-bold text-right">Discount</th>
                        <th className="py-2 px-2 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium text-gray-600">{item.product?.code || '-'}</td>
                          <td className="py-3 px-2 font-bold text-gray-800">{item.product?.name}</td>
                          <td className="py-3 px-2 text-right">{item.quantity}</td>
                          <td className="py-3 px-2 text-center text-gray-500">{item.product?.unit?.name || 'Nos'}</td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(item.rate)}</td>
                          <td className="py-3 px-2 text-right text-red-500">{item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
                          <td className="py-3 px-2 text-right font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="w-full md:w-[320px] shrink-0">
              <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-2 border-b border-gray-200">
                  <h3 className="font-bold text-[14px] text-gray-800">SUMMARY</h3>
                </div>
                <div className="p-4 space-y-3 text-[14px]">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatCurrency(sale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-500 border-b border-gray-100 pb-3">
                    <span>Discount</span>
                    <span className="font-bold">- {formatCurrency(sale.discount)}</span>
                  </div>
                  {/* <div className="flex justify-between items-center text-gray-600">
                    <span>Tax</span>
                    <span className="font-bold">{formatCurrency(sale.tax || 0)}</span>
                  </div> */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[16px] font-black text-gray-900">GRAND TOTAL</span>
                    <span className="text-[20px] font-black text-[#2563EB]">{formatCurrency(sale.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <InvoicePrintModal 
        isOpen={isPrintModalOpen} 
        onClose={() => { setIsPrintModalOpen(false); setAutoShare(false); }} 
        sale={sale}
        autoShare={autoShare}
      />
    </div>
  );
}
