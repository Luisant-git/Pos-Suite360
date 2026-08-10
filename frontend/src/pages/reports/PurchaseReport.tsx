import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, Download, Calendar, FileDigit, Truck, CreditCard, RotateCcw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';

const PurchaseReport = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // First of month
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Today
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [quickSearch, setQuickSearch] = useState('');

  // Fetch Master Data for filters
  const { data: suppliers = [] } = useQuery({ 
    queryKey: ['suppliers'], 
    queryFn: async () => (await api.get('/suppliers')).data 
  });

  // Fetch Report Data
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchaseReport', fromDate, toDate, supplierId],
    queryFn: async () => {
      // Stub: Replace with actual report endpoint
      // const { data } = await api.get(`/reports/purchases`, { params: { fromDate, toDate, supplierId } });
      return [
        { id: 1, entryNo: 'PUR-537624', invoiceNo: '-', date: '2026-08-08', supplierName: 'BASKAR & CO', mode: 'Cash', totalAmount: 'RM 100.00', taxAmount: 'RM 0.00', netAmount: 'RM 100.00' },
        { id: 2, entryNo: 'PUR-377930', invoiceNo: '-', date: '2026-08-07', supplierName: 'Filter Test Supplier', mode: 'Cash', totalAmount: 'RM 3050.00', taxAmount: 'RM 0.00', netAmount: 'RM 3050.00' },
        { id: 3, entryNo: 'PURTEST427', invoiceNo: 'INV-V1', date: '2026-08-05', supplierName: 'Filter Test Supplier', mode: 'Card', totalAmount: 'RM 0.00', taxAmount: 'RM 0.00', netAmount: 'RM 50.00' },
        { id: 4, entryNo: 'PURTEST913', invoiceNo: 'INV-V1', date: '2026-08-05', supplierName: 'Filter Test Supplier', mode: 'Card', totalAmount: 'RM 0.00', taxAmount: 'RM 0.00', netAmount: 'RM 50.00' },
        { id: 5, entryNo: 'PUR-538984', invoiceNo: '232', date: '2026-08-04', supplierName: 'BASKAR & CO', mode: 'Credit', totalAmount: 'RM 420.00', taxAmount: 'RM 0.00', netAmount: 'RM 420.00' },
        { id: 6, entryNo: 'PURTEST3113', invoiceNo: 'INV123', date: '2026-08-04', supplierName: 'Test Supplier 802', mode: 'Credit', totalAmount: 'RM 250.00', taxAmount: 'RM 0.00', netAmount: 'RM 250.00' },
        { id: 7, entryNo: 'PUR-892736', invoiceNo: '-', date: '2026-08-04', supplierName: 'BASKAR & CO', mode: 'Credit', totalAmount: 'RM 875.00', taxAmount: 'RM 0.00', netAmount: 'RM 875.00' },
      ]; 
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
            <label className="flex items-center gap-1 text-[12px] text-[#3B82F6] mb-1 font-bold"><FileDigit size={12} /> Entry / Invoice No</label>
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
            <label className="flex items-center gap-1 text-[12px] text-[#64748B] mb-1 font-bold"><Truck size={12} /> Supplier Name</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-[#334155] bg-white focus:border-[#3B82F6]"
              >
                <option value="">Type or select supplier...</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
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
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

        </div>

        <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <button className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-[13px] font-bold transition-colors">
              <Search size={14} /> Apply Filter
            </button>
            <button className="text-[#64748B] hover:text-[#334155] flex items-center gap-1 text-[13px] font-bold transition-colors">
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[#3B82F6] hover:bg-[#EFF6FF] px-3 py-1 rounded text-[12px] font-bold transition-colors">Today</button>
            <button className="text-[#3B82F6] hover:bg-[#EFF6FF] px-3 py-1 rounded text-[12px] font-bold transition-colors">This Month</button>
          </div>
        </div>
      </div>

      {/* Report Table Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md overflow-hidden flex flex-col">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#64748B]">
            <FileText size={16} />
            <h2 className="font-bold text-[13px] tracking-wide">PURCHASE REPORT DISPLAY</h2>
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
            <button className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-[12px] font-bold transition-colors">
              <Download size={14} /> Export Excel / CSV
            </button>
            <button 
              onClick={() => navigate('/purchase/new')}
              className="text-[#64748B] border border-[#CBD5E1] hover:bg-gray-50 px-3 py-1.5 rounded flex items-center gap-1.5 text-[12px] font-bold transition-colors"
            >
              <Plus size={14} /> New Purchase Entry
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#0F172A] text-white font-bold">
                <th className="px-4 py-3 border-r border-[#1E293B]">Entry No</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Invoice No</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Date</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Supplier Name</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Mode</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Total Amount</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Tax Amount</th>
                <th className="px-4 py-3 text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center p-6 text-gray-500">Loading report data...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-6 text-gray-500">No purchase records found.</td></tr>
              ) : (
                purchases.map((p: any, index: number) => (
                  <tr key={p.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] font-bold text-[#1E293B]">{p.entryNo}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-[#64748B]">{p.invoiceNo}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-[#475569]">{p.date}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] font-medium text-[#334155]">{p.supplierName}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0]">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.mode === 'Cash' ? 'bg-[#06B6D4] text-white' : 
                        p.mode === 'Card' ? 'bg-[#0EA5E9] text-white' : 
                        'bg-[#14B8A6] text-white'
                      }`}>
                        {p.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-[#475569]">{p.totalAmount}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-[#475569]">{p.taxAmount}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#10B981]">{p.netAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReport;
