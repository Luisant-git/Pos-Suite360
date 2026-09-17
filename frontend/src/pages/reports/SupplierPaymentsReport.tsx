import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Truck, FileText, RefreshCw, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportTableToPdf, type PdfColumn } from '../../utils/exportPdf';
import { exportToExcel } from '../../utils/exportExcel';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import PaginationControls from '../../components/PaginationControls';

const SupplierPaymentsReport = () => {
  const { formatCurrency, settings } = useSettings();
  const [reportMode, setReportMode] = useState<'consolidation' | 'history'>('consolidation');

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Consolidation Data
  const { data: consolidationData = [], isLoading: consolidationLoading } = useQuery({
    queryKey: ['supplierPaymentsConsolidation'],
    queryFn: async () => (await api.get('/supplier-payments/consolidation-report')).data
  });

  // Fetch Payments History Data
  const { data: paymentsHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['supplierPaymentsHistory'],
    queryFn: async () => (await api.get('/supplier-payments')).data
  });

  // Filter Consolidation List
  const filteredConsolidation = consolidationData.filter((item: any) => {
    if (searchTerm && !item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) && !item.phone.includes(searchTerm)) {
      return false;
    }
    
    // Hide suppliers with zero balance and no activity
    const hasActivity = Number(item.openingBalance || 0) !== 0 || 
                        Number(item.totalPurchases || 0) !== 0 || 
                        Number(item.totalPayments || 0) !== 0 || 
                        Number(item.totalReturns || 0) !== 0 || 
                        Number(item.netPending || 0) !== 0;
                        
    if (!hasActivity) return false;

    return true;
  });

  // Filter Payments History List
  const filteredHistory = paymentsHistory.filter((item: any) => {
    if (searchTerm && !item.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !item.paymentNo?.toLowerCase().includes(searchTerm.toLowerCase())) {
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
  const totalPurchases = filteredConsolidation.reduce((sum: number, i: any) => sum + Number(i.totalPurchases || 0), 0);
  const totalPaid = filteredConsolidation.reduce((sum: number, i: any) => sum + Number(i.totalPayments || 0), 0);
  const totalPendingPayables = filteredConsolidation.reduce((sum: number, i: any) => sum + Number(i.netPending > 0 ? i.netPending : 0), 0);

  const activeList = reportMode === 'consolidation' ? filteredConsolidation : filteredHistory;
  const totalPages = Math.ceil(activeList.length / entriesPerPage);
  const paginatedList = activeList.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handlePdfExport = () => {
    if (reportMode === 'consolidation') {
      const cols: PdfColumn[] = [
        { header: 'S.No', dataKey: '_sno' },
        { header: 'Supplier Name', dataKey: 'supplierName' },
        { header: 'Phone', dataKey: 'phone' },
        { header: 'Opening Balance', dataKey: '_opening' },
        { header: 'Total Purchases', dataKey: 'totalPurchases' },
        { header: 'Total Paid', dataKey: 'totalPayments' },
        { header: 'Total Returns', dataKey: 'totalReturns' },
        { header: 'Net Pending Payable', dataKey: 'netPending' },
      ];
      const rows = filteredConsolidation.map((s: any, idx: number) => ({
        _sno: idx + 1,
        supplierName: s.supplierName,
        phone: s.phone,
        _opening: `${s.openingBalance} (${s.openingBalanceType})`,
        totalPurchases: s.totalPurchases,
        totalPayments: s.totalPayments,
        totalReturns: s.totalReturns,
        netPending: s.netPending,
      }));
      exportTableToPdf(cols, rows, 'Supplier_Payables_Consolidation_Report', 'Supplier Payables Consolidation Report', settings?.shopName);
    } else {
      const cols: PdfColumn[] = [
        { header: 'S.No', dataKey: '_sno' },
        { header: 'Payment No', dataKey: 'paymentNo' },
        { header: 'Date', dataKey: '_date' },
        { header: 'Supplier', dataKey: '_supplier' },
        { header: 'Payment Mode', dataKey: '_mode' },
        { header: 'Reference', dataKey: 'reference' },
        { header: 'Amount Paid', dataKey: 'amount' },
      ];
      const rows = filteredHistory.map((p: any, idx: number) => ({
        _sno: idx + 1,
        paymentNo: p.paymentNo,
        _date: new Date(p.date).toLocaleDateString(),
        _supplier: p.supplier?.name || '-',
        _mode: p.paymentType?.name || p.paymentMode?.name || '-',
        reference: p.reference || '-',
        amount: p.amount,
      }));
      exportTableToPdf(cols, rows, 'Supplier_Payments_History_Report', 'Supplier Payments History Report', settings?.shopName);
    }
  };

  const handleExcelExport = () => {
    if (reportMode === 'consolidation') {
      const exportData = filteredConsolidation.map((s: any, idx: number) => ({
        'S.No': idx + 1,
        'Supplier Name': s.supplierName,
        'Phone': s.phone,
        'Opening Balance': `${s.openingBalance} (${s.openingBalanceType})`,
        'Total Purchases': s.totalPurchases,
        'Total Paid': s.totalPayments,
        'Total Returns': s.totalReturns,
        'Net Pending Payable': s.netPending,
      }));
      exportToExcel(exportData, 'Supplier_Payables_Consolidation');
    } else {
      const exportData = filteredHistory.map((p: any, idx: number) => ({
        'S.No': idx + 1,
        'Payment No': p.paymentNo,
        'Date': new Date(p.date).toLocaleDateString(),
        'Supplier': p.supplier?.name || '-',
        'Payment Mode': p.paymentType?.name || p.paymentMode?.name || '-',
        'Reference': p.reference || '-',
        'Amount Paid': p.amount,
      }));
      exportToExcel(exportData, 'Supplier_Payments_History');
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col font-sans overflow-hidden z-10 p-4">
      
      <ReportTabs />

      {/* Top Header Card with Summary Stats */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-4 p-4 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-[#E2E8F0] pb-3">
          
          <div className="flex items-center gap-3">
            <div className="bg-[#10B981] text-white p-2.5 rounded-lg shadow-sm">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="font-bold text-[16px] text-[#0F172A] uppercase tracking-wide">
                SUPPLIER PAYMENTS & OVERALL PAYABLES CONSOLIDATION REPORT
              </h1>
              <p className="text-xs text-[#64748B]">Complete overview of supplier pending payables, total payments, and ledger balances</p>
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
                Overall Pending Payables
              </button>
              <button
                type="button"
                onClick={() => { setReportMode('history'); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded transition-colors ${
                  reportMode === 'history' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Payments History
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
              <p className="text-[11px] font-bold text-[#1E40AF] uppercase">Total Purchases</p>
              <p className="text-lg font-bold text-[#1E3A8A]">{formatCurrency(totalPurchases)}</p>
            </div>
            <DollarSign className="text-[#3B82F6]" size={24} />
          </div>
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-[#065F46] uppercase">Total Payments Paid</p>
              <p className="text-lg font-bold text-[#047857]">{formatCurrency(totalPaid)}</p>
            </div>
            <CheckCircle2 className="text-[#10B981]" size={24} />
          </div>
          <div className="bg-[#FEF2F2] border border-[#FECACA] p-3 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-[#991B1B] uppercase">Overall Outstanding Payables</p>
              <p className="text-lg font-bold text-[#DC2626]">{formatCurrency(totalPendingPayables)}</p>
            </div>
            <AlertCircle className="text-[#EF4444]" size={24} />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-2 border-t border-dashed border-[#E2E8F0]">
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] mb-1">Search Supplier / Phone / Payment</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
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
              className="px-3 py-1.5 border border-[#CBD5E1] rounded bg-white text-gray-700 text-[12px] font-bold hover:bg-gray-100 flex items-center gap-1"
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
              {reportMode === 'consolidation' ? 'OVERALL SUPPLIER PAYABLES CONSOLIDATION' : 'SUPPLIER PAYMENTS HISTORY'}
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500">{activeList.length} Records Found</span>
        </div>

        <div id="supplier-payments-report-export" className="flex-1 flex flex-col min-h-0 overflow-hidden p-4">
          
          {/* Printable Header */}
          <div className="pdf-header hidden mb-4 border-b border-black pb-3">
            <div className="text-center">
              <h1 className="text-xl font-bold uppercase">{settings?.shopName || 'MY SHOP'}</h1>
              <h2 className="text-sm font-semibold uppercase">
                {reportMode === 'consolidation' ? 'SUPPLIER PAYABLES CONSOLIDATION REPORT' : 'SUPPLIER PAYMENTS HISTORY REPORT'}
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
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Supplier Name</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Phone</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Opening Bal</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Total Purchases</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Total Paid</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right">Returns</th>
                    <th className="px-3 py-2.5 text-right font-bold">Net Pending Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidationLoading ? (
                    <tr><td colSpan={8} className="text-center p-6 text-[#64748B]">Loading consolidation report...</td></tr>
                  ) : filteredConsolidation.length === 0 ? (
                    <tr><td colSpan={8} className="text-center p-6 text-[#64748B]">No supplier records found.</td></tr>
                  ) : (
                    paginatedList.map((s: any, index: number) => (
                      <tr key={s.supplierId} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-center text-gray-500 font-medium">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{s.supplierName}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-600">{s.phone}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right text-gray-600">{formatCurrency(s.openingBalance)} ({s.openingBalanceType})</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right font-semibold text-[#1E3A8A]">{formatCurrency(s.totalPurchases)}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right font-semibold text-[#047857]">{formatCurrency(s.totalPayments)}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right text-gray-600">{formatCurrency(s.totalReturns)}</td>
                        <td className={`px-3 py-2.5 text-right font-bold ${s.netPending > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                          {formatCurrency(s.netPending)}
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
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Payment No</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Date</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Supplier</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Payment Mode</th>
                    <th className="px-3 py-2.5 border-r border-[#1E293B]">Reference</th>
                    <th className="px-3 py-2.5 text-right font-bold">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr><td colSpan={7} className="text-center p-6 text-[#64748B]">Loading payment history...</td></tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr><td colSpan={7} className="text-center p-6 text-[#64748B]">No payment vouchers found.</td></tr>
                  ) : (
                    paginatedList.map((p: any, index: number) => (
                      <tr key={p.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-center text-gray-500 font-medium">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#3B82F6]">{p.paymentNo}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-700">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{p.supplier?.name || '-'}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-600">{p.paymentType?.name || p.paymentMode?.name || '-'}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-gray-600">{p.reference || '-'}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#10B981]">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Printable Footer */}
          <div className="pdf-footer hidden mt-6 text-right border-t border-black pt-4">
            <p className="text-xs font-bold text-black">Overall Pending Supplier Payables: {formatCurrency(totalPendingPayables)}</p>
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

export default SupplierPaymentsReport;
