import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Filter, RefreshCw, Search } from 'lucide-react';
import { exportTableToPdf, type PdfColumn } from '../../utils/exportPdf';
import { exportToExcel } from '../../utils/exportExcel';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import PaginationControls from '../../components/PaginationControls';
import TableLoader from '../../components/TableLoader';

const ExpenseReport = () => {
  const { formatCurrency, settings } = useSettings();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['expensesReport', startDate, endDate, categoryId, searchQuery],
    queryFn: async () => {
      const { data } = await api.get('/expenses', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          categoryId: categoryId || undefined,
          search: searchQuery || undefined,
        }
      });
      return data;
    }
  });

  const totalExpenseAmount = expenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
  const totalEntries = expenses.length;
  const isReset = !startDate && !endDate && !categoryId && !searchQuery;

  const totalPages = Math.ceil(expenses.length / entriesPerPage);
  const paginatedExpenses = expenses.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const setQuickDate = (type: 'today' | 'thisMonth' | 'all') => {
    const now = new Date();
    if (type === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handlePdfExport = () => {
    const cols: PdfColumn[] = [
      { header: 'S.No', dataKey: '_sno' },
      { header: 'Date', dataKey: '_date' },
      { header: 'Category', dataKey: '_category' },
      { header: 'Payment Mode', dataKey: '_mode' },
      { header: 'Notes', dataKey: '_notes' },
      { header: 'Amount', dataKey: '_amount' },
    ];
    const rows = expenses.map((e: any, i: number) => ({
      _sno: i + 1,
      _date: new Date(e.date).toLocaleDateString(),
      _category: e.category?.name || '-',
      _mode: e.paymentMode?.name || '-',
      _notes: e.notes || '-',
      _amount: Number(e.amount),
    }));
    rows.push({ _sno: '', _date: '', _category: '', _mode: '', _notes: 'TOTAL AMOUNT:', _amount: formatCurrency(totalExpenseAmount) });
    exportTableToPdf(cols, rows, 'Expense_Report', 'Expense Report', settings?.shopName, expenses.length);
  };

  const handleExcelExport = () => {
    const exportData = expenses.map((e: any, index: number) => ({
      'S.No': index + 1,
      'Date': new Date(e.date).toLocaleDateString(),
      'Category': e.category?.name || '-',
      'Payment Mode': e.paymentMode?.name || '-',
      'Notes': e.notes || '-',
      'Amount': Number(e.amount),
    }));
    exportData.push({ 'S.No': '', 'Date': '', 'Category': '', 'Payment Mode': '', 'Notes': 'TOTAL AMOUNT:', 'Amount': formatCurrency(totalExpenseAmount) as any });
    exportToExcel(exportData, 'Expense_Report', { shopName: settings?.shopName || 'MY SHOP', title: 'Expense Report', totalCount: expenses.length });
  };

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col font-sans overflow-y-auto lg:overflow-hidden z-10 p-2 sm:p-4">
      <ReportTabs />

      {/* Mobile Quick Bar */}
      <div className="md:hidden flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex gap-2 flex-1">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
        </div>
        <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-1 shrink-0 bg-[#10B981] text-white px-3 py-1.5 rounded text-[12px] font-bold">
          <Filter size={14} /> Filter
        </button>
      </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-2 border-t border-dashed border-[#E2E8F0] gap-3 md:gap-0">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button type="button" onClick={() => refetch()} className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-[13px] font-bold transition-colors">
              <Filter size={14} /> Apply Filter
            </button>
            <button type="button" onClick={() => setQuickDate('today')} className="bg-gray-100 hover:bg-gray-200 text-black font-bold text-[12px] px-3 py-1.5 rounded transition-colors">Today</button>
            <button type="button" onClick={() => setQuickDate('thisMonth')} className="bg-gray-100 hover:bg-gray-200 text-black font-bold text-[12px] px-3 py-1.5 rounded transition-colors">This Month</button>
            <button type="button" onClick={() => { setEndDate(''); setCategoryId(''); setSearchQuery(''); }} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-bold transition-colors shadow-sm border ${!isReset ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-white text-black border-[#CBD5E1] hover:bg-gray-100'}`}>
              <RefreshCw size={12} /> Reset Filters
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-black">
            <span>Total Entries: <strong className="text-[#0F172A]">{totalEntries}</strong></span>
            <span>Total Expense: <strong className="text-[#EF4444]">{formatCurrency(totalExpenseAmount)}</strong></span>
          </div>
        </div>

      {/* Report Table Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md overflow-hidden flex flex-col flex-1">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 shrink-0">
          <div className="flex items-center gap-2 text-black font-bold">
            <FileText size={16} />
            <h2 className="font-bold text-[13px] tracking-wide text-black">EXPENSE TRANSACTIONS REPORT</h2>
          </div>
                      <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
              <div className="relative flex-1 min-w-[120px]">
                <Search size={14} className="absolute left-2.5 top-2.5 text-black font-bold" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Quick search..." className="w-full pl-8 pr-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[12px] md:w-48 focus:border-[#3B82F6]" />
              </div>
              <button type="button" onClick={handleExcelExport} className="shrink-0 bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors">
                <Download size={14} /> <span className="hidden lg:inline">Export Excel</span>
              </button>
              <button type="button" onClick={handlePdfExport} className="shrink-0 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors">
                <Download size={14} /> <span className="hidden lg:inline">Export PDF</span>
              </button>
            </div>
        </div>

        <div id="expense-report-export" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="pdf-header hidden mb-2 p-2 sm:p-3 sm:mb-3 border-b border-black">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold uppercase">{settings?.shopName || 'MY SHOP'}</h1>
                <h2 className="text-sm font-bold uppercase tracking-wider">EXPENSE REPORT BY DATE</h2>
              </div>
              <div className="text-right">
                <p className="text-black font-bold text-xs">Date Range: {startDate || 'All'} to {endDate || 'All'}</p>
                <p className="text-black font-bold text-xs">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto overflow-x-auto" id="expense-report-table">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead>
                <tr className="bg-[#0F172A] text-white font-bold">
                  <th className="px-4 py-3 border-r border-[#1E293B] w-12 text-center">S.No</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Date</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Category</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Payment Mode</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Notes / Remarks</th>
                  <th className="px-4 py-3 text-right">Amount (RM)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableLoader columns={6} />
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-6 text-black font-bold">No expense records found for selected criteria.</td></tr>
                ) : (
                  paginatedExpenses.map((e: any, index: number) => (
                    <tr key={e.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] text-center text-black font-bold">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] font-bold text-black">{e.category?.name || '-'}</td>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{e.paymentMode?.name || '-'}</td>
                      <td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{e.notes || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#EF4444]">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pdf-footer hidden mt-6 text-right border-t-2 border-[#1E293B] pt-4 pb-8 pr-6">
            <h3 className="text-xl font-bold text-black inline-block">Total Expense Amount: {formatCurrency(totalExpenseAmount)}</h3>
          </div>
        </div>

        {!isLoading && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={expenses.length}
            entriesPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseReport;

