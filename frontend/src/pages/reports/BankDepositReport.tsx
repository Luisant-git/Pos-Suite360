import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Building, Filter, RefreshCw, X, FileText } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import { exportToExcel } from '../../utils/exportExcel';
import { exportTableToPdf, type PdfColumn } from '../../utils/exportPdf';
import PaginationControls from '../../components/PaginationControls';
import TableLoader from '../../components/TableLoader';

const BankDepositReport = () => {
  const { formatCurrency, settings } = useSettings();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Fetch Report Data
  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['bankDepositReport', fromDate, toDate],
    queryFn: async () => {
      const { data } = await api.get(`/bank-deposits`, { 
        params: { 
          fromDate, 
          toDate,
        } 
      });
      return data;
    },
  });

  const totalDepositAmount = deposits.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(deposits.length / entriesPerPage);
  const paginatedDeposits = deposits.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const todayStr = new Date().toISOString().split('T')[0];
  const startOfMonthStr = new Date(new Date().setDate(1)).toISOString().split('T')[0];
  
  const isToday = fromDate === todayStr && toDate === todayStr;
  const isMonth = fromDate === startOfMonthStr && toDate === todayStr;
  const isReset = !fromDate && !toDate;

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col font-sans overflow-y-auto lg:overflow-hidden z-10 p-2 sm:p-4">
      
      <ReportTabs />

      {/* Mobile Quick Bar */}
      <div className="md:hidden flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex gap-2 flex-1">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
        </div>
        <button onClick={() => setIsFilterOpen(true)} className="p-1.5 bg-[#1E293B] text-white rounded shrink-0">
          <Filter size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Desktop Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 w-[280px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          lg:relative lg:transform-none lg:shadow-none lg:w-64 lg:rounded lg:border lg:border-[#E2E8F0] lg:bg-white lg:flex lg:flex-col lg:shrink-0
          ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-[#1E293B] text-white lg:bg-transparent lg:text-black">
            <h2 className="font-bold text-[14px] uppercase tracking-wider flex items-center gap-2">
              <Filter size={16} className="text-[#3B82F6]" />
              Filters
            </h2>
            <button onClick={() => setIsFilterOpen(false)} className="lg:hidden p-1 hover:bg-white/20 rounded transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Date Range</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#3B82F6] text-[13px] font-bold text-black transition-colors" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:outline-none focus:border-[#3B82F6] text-[13px] font-bold text-black transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => {
                  setFromDate(todayStr);
                  setToDate(todayStr);
                }}
                className={`py-1.5 text-[11px] font-bold rounded border transition-colors ${isToday ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-white text-black border-[#CBD5E1] hover:bg-gray-50'}`}
              >
                Today
              </button>
              <button 
                onClick={() => {
                  setFromDate(startOfMonthStr);
                  setToDate(todayStr);
                }}
                className={`py-1.5 text-[11px] font-bold rounded border transition-colors ${isMonth ? 'bg-[#3B82F6] text-white border-[#3B82F6]' : 'bg-white text-black border-[#CBD5E1] hover:bg-gray-50'}`}
              >
                This Month
              </button>
            </div>

            <button 
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className={`mt-2 py-2 flex items-center justify-center gap-2 text-[12px] font-bold rounded transition-colors ${isReset ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'}`}
              disabled={isReset}
            >
              <RefreshCw size={14} />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Desktop Overlay */}
        {isFilterOpen && (
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 bg-white rounded border border-[#E2E8F0] shadow-sm flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Action Bar */}
          <div className="p-3 border-b border-[#E2E8F0] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 flex items-center justify-center rounded shadow-inner">
                <Building size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-black uppercase tracking-wider">Bank Deposit Report</h2>
                <p className="text-[11px] text-[#64748B] font-bold hidden sm:block">View and export deposit history</p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button type="button" 
                onClick={() => {
                  const exportData = deposits.map((d: any) => ({
                    'Date': new Date(d.date).toLocaleDateString(),
                    'Type': d.depositType,
                    'Amount': d.amount
                  }));
                  exportData.push({
                    'Date': '',
                    'Type': 'TOTAL:',
                    'Amount': formatCurrency(totalDepositAmount)
                  });
                  exportToExcel(exportData, `Bank_Deposit_Report_${fromDate}_to_${toDate}`, {
                    shopName: settings?.shopName || 'MY SHOP',
                    title: 'Bank Deposit Report',
                    totalCount: deposits.length
                  });
                }}
                className="shrink-0 bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors"
              >
                <Download size={14} /> <span className="hidden lg:inline">Export Excel</span>
              </button>
              <button type="button"
                onClick={() => {
                  const cols: PdfColumn[] = [
                    { header: 'Date', dataKey: 'date' },
                    { header: 'Deposit Type', dataKey: 'depositType' },
                    { header: 'Amount', dataKey: 'amount' },
                  ];
                  const pdfData = [...deposits.map((d:any) => ({
                    ...d, 
                    date: new Date(d.date).toLocaleDateString(),
                    amount: formatCurrency(d.amount)
                  })), {
                    date: '',
                    depositType: 'TOTAL:',
                    amount: formatCurrency(totalDepositAmount)
                  }];
                  exportTableToPdf(cols, pdfData, `Bank_Deposit_Report_${fromDate}_to_${toDate}`, 'Bank Deposit Report', settings?.shopName, deposits.length);
                }}
                className="shrink-0 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors"
              >
                <FileText size={14} /> <span className="hidden lg:inline">Export PDF</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#F8FAFC]">
            <table className="w-full text-left border-collapse text-[12px] lg:text-[13px] whitespace-nowrap">
              <thead className="bg-[#1E293B] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 border-r border-[#334155] font-bold uppercase tracking-wider text-[11px] text-center w-12">#</th>
                  <th className="px-4 py-3 border-r border-[#334155] font-bold uppercase tracking-wider text-[11px]">Date</th>
                  <th className="px-4 py-3 border-r border-[#334155] font-bold uppercase tracking-wider text-[11px]">Deposit Type</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[11px] text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-0"><TableLoader columns={4} /></td></tr>
                ) : deposits.length === 0 ? (
                  <tr><td colSpan={4} className="text-center p-6 text-black font-bold">No deposit records found.</td></tr>
                ) : (
                  paginatedDeposits.map((d: any, index: number) => (
                    <tr key={d.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] text-center text-black font-bold">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{new Date(d.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] font-bold text-black">
                        <span className="bg-gray-200 text-gray-800 text-[10px] px-2 py-1 rounded font-bold uppercase border border-gray-300">
                          {d.depositType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-black font-bold">{formatCurrency(d.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white border-t border-[#E2E8F0] shrink-0">
            <div className="px-4 py-3 flex justify-end items-center bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <div className="flex items-center gap-4">
                <span className="text-[12px] font-bold text-black uppercase">Total Deposited:</span>
                <span className="text-[16px] font-bold text-[#10B981]">{formatCurrency(totalDepositAmount)}</span>
              </div>
            </div>
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              entriesPerPage={entriesPerPage}
              totalEntries={deposits.length}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDepositReport;
