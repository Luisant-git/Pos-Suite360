import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Users, FileText, RefreshCw, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportTableToPdf, type PdfColumn } from '../../utils/exportPdf';
import { exportToExcel } from '../../utils/exportExcel';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import PaginationControls from '../../components/PaginationControls';
import SearchableSelect from '../../components/SearchableSelect';

const CustomerReceiptsReport = () => {
  const { formatCurrency, settings } = useSettings();
  const [reportMode, setReportMode] = useState<'consolidation' | 'history'>('consolidation');

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Consolidation Data
  const { data: consolidationData = [], isLoading: consolidationLoading } = useQuery({
    queryKey: ['customerReceiptsConsolidation'],
    queryFn: async () => (await api.get('/customer-receipts/consolidation-report')).data
  });

  // Fetch Receipts History Data
  const { data: receiptsHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['customerReceiptsHistory'],
    queryFn: async () => (await api.get('/customer-receipts')).data
  });

  // Build search options
  const searchOptions = React.useMemo(() => {
    const optionsMap = new Map();
    consolidationData.forEach((item: any) => {
      if (item.customerName && !optionsMap.has(item.customerName)) {
        optionsMap.set(item.customerName, { value: item.customerName, label: `Customer: ${item.customerName} ${item.phone ? `(${item.phone})` : ''}` });
      }
      if (item.phone && !optionsMap.has(item.phone)) {
        optionsMap.set(item.phone, { value: item.phone, label: `Phone: ${item.phone} (${item.customerName})` });
      }
    });
    receiptsHistory.forEach((item: any) => {
      if (item.receiptNo && !optionsMap.has(item.receiptNo)) {
        optionsMap.set(item.receiptNo, { value: item.receiptNo, label: `Receipt No: ${item.receiptNo}` });
      }
    });
    return [{ value: '', label: 'All / Clear Search' }, ...Array.from(optionsMap.values())];
  }, [consolidationData, receiptsHistory]);

  // Filter Consolidation List
  const filteredConsolidation = consolidationData.filter((item: any) => {
    if (searchTerm && !item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) && !item.phone.includes(searchTerm)) {
      return false;
    }
    
    // Hide customers with zero balance and no activity
    const hasActivity = Number(item.openingBalance || 0) !== 0 || 
                        Number(item.totalSales || 0) !== 0 || 
                        Number(item.totalReceipts || 0) !== 0 || 
                        Number(item.totalReturns || 0) !== 0 || 
                        Number(item.netPending || 0) !== 0;
                        
    if (!hasActivity) return false;
    
    return true;
  });

  // Filter Receipts History List
  const filteredHistory = receiptsHistory.filter((item: any) => {
    if (searchTerm && !item.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !item.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (startDate && new Date(item.date) < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(item.date) > end) return false;
    }
    return true;
  });

  // Summary Totals
  const totalSales = filteredConsolidation.reduce((sum: number, i: any) => sum + Number(i.totalSales || 0), 0);
  const totalCollected = filteredConsolidation.reduce((sum: number, i: any) => sum + Number(i.totalReceipts || 0), 0);
  const totalPendingDues = filteredConsolidation.reduce((sum: number, i: any) => sum + Number(i.netPending > 0 ? i.netPending : 0), 0);

  const activeList = reportMode === 'consolidation' ? filteredConsolidation : filteredHistory;
  const totalPages = Math.ceil(activeList.length / entriesPerPage);
  const paginatedList = activeList.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const isReset = !searchTerm && !startDate && !endDate;

  const handlePdfExport = () => {
    if (reportMode === 'consolidation') {
      const cols: PdfColumn[] = [
        { header: 'S.No', dataKey: '_sno' },
        { header: 'Customer Name', dataKey: 'customerName' },
        { header: 'Phone', dataKey: 'phone' },
        { header: 'Opening Balance', dataKey: '_opening' },
        { header: 'Total Invoiced', dataKey: 'totalSales' },
        { header: 'Total Collected', dataKey: 'totalReceipts' },
        { header: 'Total Returns', dataKey: 'totalReturns' },
        { header: 'Net Pending Due', dataKey: 'netPending' },
      ];
      const rows = filteredConsolidation.map((c: any, idx: number) => ({
        _sno: idx + 1,
        customerName: c.customerName,
        phone: c.phone,
        _opening: `${c.openingBalance} (${c.openingBalanceType})`,
        totalSales: c.totalSales,
        totalReceipts: c.totalReceipts,
        totalReturns: c.totalReturns,
        netPending: c.netPending,
      }));
      rows.push({
        _sno: `Total Count: ${filteredConsolidation.length}`,
        customerName: '',
        phone: '',
        _opening: '',
        totalSales: formatCurrency(totalSales),
        totalReceipts: formatCurrency(totalCollected),
        totalReturns: 'TOTAL:',
        netPending: formatCurrency(totalPendingDues),
      });
      const title = `Customer Dues Consolidation Report${startDate || endDate ? ` (${startDate || 'Start'} to ${endDate || 'End'})` : ''}`;
      exportTableToPdf(cols, rows, 'Customer_Dues_Consolidation_Report', title, settings?.shopName);
    } else {
      const cols: PdfColumn[] = [
        { header: 'S.No', dataKey: '_sno' },
        { header: 'Receipt No', dataKey: 'receiptNo' },
        { header: 'Date', dataKey: '_date' },
        { header: 'Customer', dataKey: '_customer' },
        { header: 'Payment Mode', dataKey: '_mode' },
        { header: 'Reference', dataKey: 'reference' },
        { header: 'Amount Collected', dataKey: 'amount' },
      ];
      const rows = filteredHistory.map((r: any, idx: number) => ({
        _sno: idx + 1,
        receiptNo: r.receiptNo,
        _date: new Date(r.date).toLocaleDateString(),
        _customer: r.customer?.name || '-',
        _mode: r.paymentType?.name || r.paymentMode?.name || '-',
        reference: r.reference || '-',
        amount: r.amount,
      }));
      const historyTotalAmount = filteredHistory.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
      rows.push({
        _sno: `Total Count: ${filteredHistory.length}`,
        receiptNo: '',
        _date: '',
        _customer: '',
        _mode: '',
        reference: 'TOTAL AMOUNT:',
        amount: formatCurrency(historyTotalAmount),
      });
      const title = `Customer Receipts History Report${startDate || endDate ? ` (${startDate || 'Start'} to ${endDate || 'End'})` : ''}`;
      exportTableToPdf(cols, rows, 'Customer_Receipts_History_Report', title, settings?.shopName);
    }
  };

  const handleExcelExport = () => {
    if (reportMode === 'consolidation') {
      const exportData = filteredConsolidation.map((c: any, idx: number) => ({
        'S.No': idx + 1,
        'Customer Name': c.customerName,
        'Phone': c.phone,
        'Opening Balance': `${c.openingBalance} (${c.openingBalanceType})`,
        'Total Invoiced': c.totalSales,
        'Total Collected': c.totalReceipts,
        'Total Returns': c.totalReturns,
        'Net Pending Due': c.netPending,
      }));
      exportData.push({
        'S.No': `Total Count: ${filteredConsolidation.length}`,
        'Customer Name': '',
        'Phone': '',
        'Opening Balance': '',
        'Total Invoiced': formatCurrency(totalSales) as any,
        'Total Collected': formatCurrency(totalCollected) as any,
        'Total Returns': 'TOTAL:',
        'Net Pending Due': formatCurrency(totalPendingDues) as any,
      });
      exportToExcel(exportData, 'Customer_Dues_Consolidation');
    } else {
      const exportData = filteredHistory.map((r: any, idx: number) => ({
        'S.No': idx + 1,
        'Receipt No': r.receiptNo,
        'Date': new Date(r.date).toLocaleDateString(),
        'Customer': r.customer?.name || '-',
        'Payment Mode': r.paymentType?.name || r.paymentMode?.name || '-',
        'Reference': r.reference || '-',
        'Amount Collected': r.amount,
      }));
      const historyTotalAmount = filteredHistory.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
      exportData.push({
        'S.No': `Total Count: ${filteredHistory.length}`,
        'Receipt No': '',
        'Date': '',
        'Customer': '',
        'Payment Mode': '',
        'Reference': 'TOTAL AMOUNT:',
        'Amount Collected': formatCurrency(historyTotalAmount) as any,
      });
      exportToExcel(exportData, 'Customer_Receipts_History');
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col font-sans overflow-hidden z-10 p-4">
      
      <ReportTabs />

      {/* Top Header Card with Summary Stats */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-4 p-4 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-[#E2E8F0] pb-3">
          
          <div className="flex items-center gap-3">
            <div className="bg-[#3B82F6] text-white p-2.5 rounded-lg shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h1 className="font-bold text-[16px] text-[#0F172A] uppercase tracking-wide">
                CUSTOMER RECEIPTS & OVERALL DUES CONSOLIDATION REPORT
              </h1>
              <p className="text-xs text-[#64748B]">Complete overview of customer pending balances, total receipts, and ledger dues</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-md flex items-center gap-1 border border-gray-200">
              <button
                type="button"
                onClick={() => { setReportMode('consolidation'); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded transition-colors ${
                  reportMode === 'consolidation' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overall Pending Dues
              </button>
              <button
                type="button"
                onClick={() => { setReportMode('history'); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded transition-colors ${
                  reportMode === 'history' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Receipts History
              </button>
            </div>

            <button
              type="button"
              onClick={handleExcelExport}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded text-[12px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Export Excel
            </button>
            <button
              type="button"
              onClick={handlePdfExport}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded text-[12px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Stat Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-[#1E40AF] uppercase">Total Credit Invoiced</p>
              <p className="text-lg font-bold text-[#1E3A8A]">{formatCurrency(totalSales)}</p>
            </div>
            <DollarSign className="text-[#3B82F6]" size={24} />
          </div>
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-[#065F46] uppercase">Total Receipts Collected</p>
              <p className="text-lg font-bold text-[#047857]">{formatCurrency(totalCollected)}</p>
            </div>
            <CheckCircle2 className="text-[#10B981]" size={24} />
          </div>
          <div className="bg-[#FEF2F2] border border-[#FECACA] p-3 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-[#991B1B] uppercase">Overall Outstanding Dues</p>
              <p className="text-lg font-bold text-[#DC2626]">{formatCurrency(totalPendingDues)}</p>
            </div>
            <AlertCircle className="text-[#EF4444]" size={24} />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-2 border-t border-dashed border-[#E2E8F0]">
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] mb-1">Search Customer / Phone / Receipt</label>
            <SearchableSelect
              options={searchOptions}
              value={searchTerm}
              onChange={(val) => setSearchTerm(val || '')}
              placeholder="Search..."
              className="w-full"
            />
          </div>
          {reportMode === 'history' && (
            <>
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] mb-1">Entries Per Page</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
            >
              <option value={10}>10 Entries</option>
              <option value={25}>25 Entries</option>
              <option value={50}>50 Entries</option>
              <option value={100}>100 Entries</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
              className={`px-3 py-1.5 border rounded text-[12px] font-bold flex items-center gap-1 transition-colors ${
                !isReset 
                  ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' 
                  : 'bg-white text-gray-700 border-[#CBD5E1] hover:bg-gray-100'
              }`}
            >
              <RefreshCw size={12} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md overflow-hidden flex flex-col flex-1">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-[#475569]">
            <FileText size={16} />
            <h2 className="font-bold text-[13px] tracking-wide text-[#334155] uppercase">
              {reportMode === 'consolidation' ? 'OVERALL CUSTOMER DUES CONSOLIDATION' : 'CUSTOMER RECEIPTS HISTORY'}
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500">{activeList.length} Records Found</span>
        </div>

        <div id="customer-receipts-report-export" className="flex-1 flex flex-col min-h-0 overflow-hidden p-4">
          
          {/* Printable Header */}
          <div className="pdf-header hidden mb-4 border-b border-black pb-3">
            <div className="text-center">
              <h1 className="text-xl font-bold uppercase">{settings?.shopName || 'MY SHOP'}</h1>
              <h2 className="text-sm font-semibold uppercase">
                {reportMode === 'consolidation' ? 'CUSTOMER DUES CONSOLIDATION REPORT' : 'CUSTOMER RECEIPTS HISTORY REPORT'}
              </h2>
              <p className="text-xs text-gray-600 mt-1">Generated: {new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="flex-1 overflow-auto overflow-x-auto">
            {reportMode === 'consolidation' ? (
              <table className="w-full text-left text-[12px] whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0F172A] text-white font-bold">
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-center w-12">S.No</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Customer Name</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Phone</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Opening Bal</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Total Invoiced</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Total Collected</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Returns</th>
                    <th className="px-3 py-2.5 text-right font-bold">Net Pending Due</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidationLoading ? (
                    <tr><td colSpan={8} className="text-center p-6 text-[#64748B]">Loading consolidation report...</td></tr>
                  ) : filteredConsolidation.length === 0 ? (
                    <tr><td colSpan={8} className="text-center p-6 text-[#64748B]">No customer records found.</td></tr>
                  ) : (
                    paginatedList.map((c: any, index: number) => (
                      <tr key={c.customerId} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-center text-gray-500 font-medium">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{c.customerName}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-600">{c.phone}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right text-gray-600">{formatCurrency(c.openingBalance)} ({c.openingBalanceType})</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right font-semibold text-[#1E3A8A]">{formatCurrency(c.totalSales)}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right font-semibold text-[#047857]">{formatCurrency(c.totalReceipts)}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right text-gray-600">{formatCurrency(c.totalReturns)}</td>
                        <td className={`px-3 py-2.5 text-right font-bold ${c.netPending > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                          {formatCurrency(c.netPending)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-[12px] whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0F172A] text-white font-bold">
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-center w-12">S.No</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Receipt No</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Date</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Customer</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Payment Mode</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Reference</th>
                    <th className="px-3 py-2.5 text-right font-bold">Amount Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr><td colSpan={7} className="text-center p-6 text-[#64748B]">Loading receipt history...</td></tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr><td colSpan={7} className="text-center p-6 text-[#64748B]">No receipt vouchers found.</td></tr>
                  ) : (
                    paginatedList.map((r: any, index: number) => (
                      <tr key={r.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-center text-gray-500 font-medium">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#3B82F6]">{r.receiptNo}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-700">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{r.customer?.name || '-'}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-600">{r.paymentType?.name || r.paymentMode?.name || '-'}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-600">{r.reference || '-'}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#10B981]">{formatCurrency(r.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Printable Footer */}
          <div className="pdf-footer hidden mt-6 text-right border-t border-black pt-4">
            <p className="text-xs font-bold text-black">Overall Pending Customer Dues: {formatCurrency(totalPendingDues)}</p>
          </div>

        </div>

        {!consolidationLoading && !historyLoading && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={activeList.length}
            entriesPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

    </div>
  );
};

export default CustomerReceiptsReport;
