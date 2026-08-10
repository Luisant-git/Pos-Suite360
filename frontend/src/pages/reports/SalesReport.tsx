import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, Download, Calendar, FileDigit, Users, CreditCard, RotateCcw, Plus, Printer, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import { exportToExcel } from '../../utils/exportExcel';
import InvoicePrintModal from '../../components/InvoicePrintModal';

const SalesReport = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // First of month
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Today
  const [customerId, setCustomerId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch Master Data for filters
  const { data: customers = [] } = useQuery({ 
    queryKey: ['customers'], 
    queryFn: async () => (await api.get('/customers')).data 
  });

  const { data: paymentModes = [] } = useQuery({ 
    queryKey: ['paymentModes'], 
    queryFn: async () => (await api.get('/payment-modes')).data 
  });

  // Fetch Report Data
  const { data: sales = [], isLoading, refetch } = useQuery({
    queryKey: ['salesReport', fromDate, toDate, customerId, invoiceNo, paymentMode],
    queryFn: async () => {
      const { data } = await api.get(`/sales`, { 
        params: { 
          fromDate, 
          toDate, 
          customerId: customerId || undefined,
          invoiceNo: invoiceNo || undefined,
          paymentModeId: paymentMode || undefined,
        } 
      });
      return data.map((s: any) => ({
        id: s.id,
        invoiceNo: s.invoiceNo,
        date: new Date(s.date).toISOString().split('T')[0],
        customerName: s.customer?.name || '-',
        paymentMode: s.paymentMode?.name || '-',
        netPayable: `RM ${Number(s.grandTotal).toFixed(2)}`,
      }));
    },
  });

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-100px)] p-4">
      
      <ReportTabs />

      {/* Filter Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
          
          <div>
            <label className="flex items-center gap-1 text-[12px] text-[#64748B] mb-1 font-bold"><Calendar size={12} /> From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-[#334155] focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-[12px] text-[#64748B] mb-1 font-bold"><Calendar size={12} /> To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-[#334155] focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-[12px] text-[#3B82F6] mb-1 font-bold"><FileDigit size={12} /> Invoice No</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input 
                type="text" 
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Type or select invoice..."
                className="w-full pl-8 pr-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-[#334155] focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-[12px] text-[#64748B] mb-1 font-bold"><Users size={12} /> Customer Name</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-[#334155] bg-white focus:border-[#3B82F6]"
              >
                <option value="">Type or select customer...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-[12px] text-[#64748B] mb-1 font-bold"><CreditCard size={12} /> Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-[#334155] bg-white focus:border-[#3B82F6]"
            >
              <option value="">All Payment Modes</option>
              {paymentModes.map((pm: any) => (
                <option key={pm.id} value={pm.id}>{pm.name}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <button onClick={() => refetch()} className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-[13px] font-bold transition-colors">
              <Search size={14} /> Apply Filter
            </button>
            <button onClick={() => {
              setFromDate(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
              setToDate(new Date().toISOString().split('T')[0]);
              setCustomerId('');
              setInvoiceNo('');
              setPaymentMode('');
              setQuickSearch('');
            }} className="text-[#64748B] hover:text-[#334155] flex items-center gap-1 text-[13px] font-bold transition-colors">
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFromDate(today);
              setToDate(today);
            }} className="text-[#3B82F6] hover:bg-[#EFF6FF] px-3 py-1 rounded text-[12px] font-bold transition-colors">Today</button>
            <button onClick={() => {
              setFromDate(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
              setToDate(new Date().toISOString().split('T')[0]);
            }} className="text-[#3B82F6] hover:bg-[#EFF6FF] px-3 py-1 rounded text-[12px] font-bold transition-colors">This Month</button>
          </div>
        </div>
      </div>

      {/* Report Table Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md overflow-hidden flex flex-col">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#3B82F6]">
            <FileText size={16} />
            <h2 className="font-bold text-[13px] tracking-wide text-[#1E3A8A]">SALES REPORT DISPLAY</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input 
                type="text" 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Quick search table..."
                className="pl-8 pr-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[12px] w-64 focus:border-[#3B82F6]"
              />
            </div>
            <button 
              onClick={() => exportToExcel(sales, `Sales_Report_${fromDate}_to_${toDate}`)}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-[12px] font-bold transition-colors"
            >
              <Download size={14} /> Export Excel
            </button>
            <button 
              onClick={() => navigate('/sales/pos')}
              className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-[12px] font-bold transition-colors"
            >
              <Plus size={14} /> New POS Bill
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#0F172A] text-white font-bold">
                <th className="px-4 py-3 border-r border-[#1E293B]">Invoice No</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-center">Date</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Customer Name</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-center">Payment Mode</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-center">Net Payable Amount</th>
                <th className="px-4 py-3 text-center w-40">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-6 text-gray-500">Loading report data...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-6 text-gray-500">No sales records found.</td></tr>
              ) : (
                sales.map((s: any, index: number) => (
                  <tr key={s.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] font-bold text-[#3B82F6] cursor-pointer hover:underline">{s.invoiceNo}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-center text-[#475569]">{s.date}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] font-medium text-[#334155]">{s.customerName}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-center">
                      <span className="bg-[#64748B] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        {s.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-center font-bold text-[#3B82F6]">{s.netPayable}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedSale({
                              invoiceNo: s.invoiceNo,
                              date: s.date,
                              customer: { name: s.customerName },
                              grandTotal: parseFloat(s.netPayable.replace('RM ', '')),
                              items: [
                                { product: { code: 'PTEST100', name: 'Test Multi Filter Product' }, quantity: 1, unit: { name: 'Nos' }, rate: parseFloat(s.netPayable.replace('RM ', '')), amount: parseFloat(s.netPayable.replace('RM ', '')) }
                              ]
                            });
                            setIsPrintModalOpen(true);
                          }}
                          className="text-[#3B82F6] flex items-center gap-1 hover:underline font-medium text-[11px]"
                        >
                          <Printer size={12} /> Print
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedSale({
                              invoiceNo: s.invoiceNo,
                              date: s.date,
                              customer: { name: s.customerName },
                              grandTotal: parseFloat(s.netPayable.replace('RM ', '')),
                              items: [
                                { product: { code: 'PTEST100', name: 'Test Multi Filter Product' }, quantity: 1, unit: { name: 'Nos' }, rate: parseFloat(s.netPayable.replace('RM ', '')), amount: parseFloat(s.netPayable.replace('RM ', '')) }
                              ]
                            });
                            setIsPrintModalOpen(true);
                          }}
                          className="bg-[#25D366] hover:bg-[#1EBE55] text-white px-2 py-1 rounded-full flex items-center gap-1 font-bold text-[11px] transition-colors"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoicePrintModal 
        isOpen={isPrintModalOpen} 
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedSale(null);
        }} 
        sale={selectedSale} 
      />
    </div>
  );
};

export default SalesReport;
