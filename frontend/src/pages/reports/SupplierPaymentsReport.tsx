import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Truck, FileText, RefreshCw, DollarSign, AlertCircle, CheckCircle2, Printer, Loader2 } from 'lucide-react';
import { exportTableToPdf, type PdfColumn } from '../../utils/exportPdf';
import { exportToExcel } from '../../utils/exportExcel';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import PaginationControls from '../../components/PaginationControls';
import SearchableSelect from '../../components/SearchableSelect';
import TableLoader from '../../components/TableLoader';
import { generateBillByBillPdf } from '../../utils/pdfGenerator';
import PdfViewerModal from '../../components/PdfViewerModal';

const SupplierPaymentsReport = () => {
  const { formatCurrency, settings } = useSettings();
  const [reportMode, setReportMode] = useState<'consolidation' | 'history'>('consolidation');

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [printingId, setPrintingId] = useState<number | null>(null);

  // Fetch Consolidation Data
  const { data: consolidationData = [], isLoading: consolidationLoading } = useQuery({
    queryKey: ['supplierPaymentsConsolidation', startDate, endDate],
    queryFn: async () => {
      let url = '/supplier-payments/consolidation-report';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;
      return (await api.get(url)).data;
    }
  });

  // Fetch Payments History Data
  const { data: paymentsHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['supplierPaymentsHistory'],
    queryFn: async () => (await api.get('/supplier-payments')).data
  });

  // Build search options
  const searchOptions = React.useMemo(() => {
    const optionsMap = new Map();
    
    consolidationData.forEach((item: any) => {
      if (item.supplierName) {
        const phoneStr = item.phone ? ` - ${item.phone}` : '';
        optionsMap.set(`supp_${item.supplierName}`, { 
          value: item.supplierName, 
          label: `${item.supplierName}${phoneStr}` 
        });
      }
    });

    return [{ value: '', label: 'All / Clear Search' }, ...Array.from(optionsMap.values())];
  }, [consolidationData, paymentsHistory]);

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

  const isReset = !searchTerm && !startDate && !endDate;

  const handleDatePreset = (preset: 'today' | 'thisMonth' | 'clear') => {
    const today = new Date();
    if (preset === 'today') {
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(`${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01`);
      setEndDate(`${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`);
    } else if (preset === 'clear') {
      setStartDate('');
      setEndDate('');
    }
  };

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
      rows.push({
        _sno: '',
        supplierName: '',
        phone: '',
        _opening: '',
        totalPurchases: formatCurrency(totalPurchases),
        totalPayments: formatCurrency(totalPaid),
        totalReturns: 'TOTAL:',
        netPending: formatCurrency(totalPendingPayables),
      });
      const title = `Supplier Payables Consolidation Report${startDate || endDate ? ` (${startDate || 'Start'} to ${endDate || 'End'})` : ''}`;
      exportTableToPdf(cols, rows, 'Supplier_Payables_Consolidation_Report', title, settings?.shopName, filteredConsolidation.length);
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
      const historyTotal = filteredHistory.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      rows.push({
        _sno: '',
        paymentNo: '',
        _date: '',
        _supplier: '',
        _mode: '',
        reference: 'TOTAL AMOUNT:',
        amount: formatCurrency(historyTotal),
      });
      const title = `Supplier Payments History Report${startDate || endDate ? ` (${startDate || 'Start'} to ${endDate || 'End'})` : ''}`;
      exportTableToPdf(cols, rows, 'Supplier_Payments_History_Report', title, settings?.shopName, filteredHistory.length);
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
      exportData.push({
        'S.No': '',
        'Supplier Name': '',
        'Phone': '',
        'Opening Balance': '',
        'Total Purchases': formatCurrency(totalPurchases) as any,
        'Total Paid': formatCurrency(totalPaid) as any,
        'Total Returns': 'TOTAL:',
        'Net Pending Payable': formatCurrency(totalPendingPayables) as any,
      });
      exportToExcel(exportData, 'Supplier_Payables_Consolidation', {
        shopName: settings?.shopName || 'MY SHOP',
        title: 'Supplier Payables Consolidation Report',
        totalCount: filteredConsolidation.length
      });
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
      const historyTotal = filteredHistory.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      exportData.push({
        'S.No': '',
        'Payment No': '',
        'Date': '',
        'Supplier': '',
        'Payment Mode': '',
        'Reference': 'TOTAL AMOUNT:',
        'Amount Paid': formatCurrency(historyTotal) as any,
      });
      exportToExcel(exportData, 'Supplier_Payments_History', {
        shopName: settings?.shopName || 'MY SHOP',
        title: 'Supplier Payments History Report',
        totalCount: filteredHistory.length
      });
    }
  };

  const handlePrintBreakdown = async (supplierId: number, supplierName: string) => {
    if (!supplierId) return;
    try {
      setPrintingId(supplierId);
      const res = await api.get(`/supplier-payments/unpaid-bills/${supplierId}`);
      const unpaidBills = res.data;
      const totals = unpaidBills.reduce((acc: any, bill: any) => {
        acc.total += Number(bill.total || 0);
        acc.returned += Number(bill.returned || 0);
        acc.paid += Number(bill.paid || bill.received || 0);
        acc.pending += Number(bill.pending || 0);
        return acc;
      }, { total: 0, returned: 0, paid: 0, pending: 0 });
      const companyName = settings?.shopName || 'NJ FRESH AND FROZEN SDN BHD';
      const url = generateBillByBillPdf(companyName, supplierName, 'Supplier', unpaidBills, totals) as unknown as string;
      setPdfUrl(url);
      setPdfModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col font-sans overflow-y-auto lg:overflow-hidden z-10 p-2 sm:p-4">
      
      <ReportTabs />

      {/* Top Header Card with Summary Stats */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-2 p-2 sm:p-3 sm:mb-3 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-[#E2E8F0] pb-3">
          
          <div className="flex items-center gap-2">
            <div className="bg-[#10B981] text-white p-2 rounded-lg shadow-sm shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <h1 className="font-bold text-[13px] sm:text-[15px] text-[#0F172A] uppercase tracking-wide">
                SUPPLIER PAYMENTS & PAYABLES REPORT
              </h1>
              <p className="text-xs text-black font-bold hidden sm:block">Complete overview of supplier pending payables, total payments, and ledger balances</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-gray-100 p-1 rounded-md flex items-center gap-1 border border-gray-200 flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => { setReportMode('consolidation'); setCurrentPage(1); }}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-bold rounded transition-colors ${
                  reportMode === 'consolidation' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-black hover:text-black'
                }`}
              >
                Pending Payables
              </button>
              <button
                type="button"
                onClick={() => { setReportMode('history'); setCurrentPage(1); }}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-bold rounded transition-colors ${
                  reportMode === 'history' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-black hover:text-black'
                }`}
              >
                Pay History
              </button>
            </div>

            <button type="button" onClick={handleExcelExport} className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded text-[12px] font-bold flex items-center gap-1.5 transition-colors shrink-0">
              <Download size={14} /> <span className="hidden sm:inline">Excel</span>
            </button>
            <button type="button" onClick={handlePdfExport} className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded text-[12px] font-bold flex items-center gap-1.5 transition-colors shrink-0">
              <Download size={14} /> <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Stat Summary Cards */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-2 sm:gap-3 mb-3 pb-1 snap-x scrollbar-hide">
          <div className="min-w-[220px] md:min-w-0 snap-start bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#1E40AF] uppercase">Total Purchases</p>
              <p className="text-base font-bold text-[#1E3A8A]">{formatCurrency(totalPurchases)}</p>
            </div>
            <DollarSign className="text-[#3B82F6]" size={20} />
          </div>
          <div className="min-w-[220px] md:min-w-0 snap-start bg-[#ECFDF5] border border-[#A7F3D0] p-2.5 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#065F46] uppercase">Total Payments Paid</p>
              <p className="text-base font-bold text-[#047857]">{formatCurrency(totalPaid)}</p>
            </div>
            <CheckCircle2 className="text-[#10B981]" size={20} />
          </div>
          <div className="min-w-[220px] md:min-w-0 snap-start bg-[#FEF2F2] border border-[#FECACA] p-2.5 rounded-md flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#991B1B] uppercase">Overall Outstanding Payables</p>
              <p className="text-base font-bold text-[#DC2626]">{formatCurrency(totalPendingPayables)}</p>
            </div>
            <AlertCircle className="text-[#EF4444]" size={20} />
          </div>
        </div>


                {/* Filters - always visible, fully responsive */}
        <div className="bg-white p-2 sm:p-3 border-b border-[#E6E9ED] shrink-0">
          <div className="flex flex-col gap-2">
            {/* Row 1: Search + Reset */}
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <SearchableSelect
                  options={searchOptions}
                  value={searchTerm}
                  onChange={(val) => setSearchTerm(val || '')}
                  placeholder="Search supplier..."
                  className="w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className={`shrink-0 px-3 py-[9px] rounded flex items-center gap-1 transition-colors border text-[12px] font-bold h-[38px] ${!isReset ? "bg-white text-red-600 border-red-200 hover:bg-red-50" : "bg-white text-black border-[#E5E7EB] hover:bg-gray-50"}`}
              >
                <RefreshCw size={13} /> <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
            {/* Row 2: Dates + Entries */}
            <div className="grid grid-cols-3 gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-[12px] outline-none focus:border-[#3B82F6] h-[38px]" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-[12px] outline-none focus:border-[#3B82F6] h-[38px]" />
              <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-[12px] outline-none bg-white focus:border-[#3B82F6] h-[38px]">
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md overflow-hidden flex flex-col flex-1">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 py-2 flex justify-between items-center shrink-0 gap-2">
          <div className="flex items-center gap-1.5 text-black font-bold min-w-0">
            <FileText size={14} className="shrink-0" />
            <h2 className="font-bold text-[11px] sm:text-[13px] tracking-wide text-black uppercase truncate">
              {reportMode === 'consolidation' ? 'OVERALL SUPPLIER PAYABLES CONSOLIDATION' : 'SUPPLIER PAYMENTS HISTORY'}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-black whitespace-nowrap shrink-0">{activeList.length} Records Found</span>
        </div>

        <div id="supplier-payments-report-export" className="flex-1 flex flex-col min-h-0 overflow-hidden p-4">
          
          {/* Printable Header */}
          <div className="pdf-header hidden mb-4 border-b border-black pb-3">
            <div className="text-center">
              <h1 className="text-xl font-bold uppercase">{settings?.shopName || 'MY SHOP'}</h1>
              <h2 className="text-sm font-bold uppercase">
                {reportMode === 'consolidation' ? 'SUPPLIER PAYABLES CONSOLIDATION REPORT' : 'SUPPLIER PAYMENTS HISTORY REPORT'}
              </h2>
              <p className="text-xs text-black font-bold mt-1">Generated: {new Date().toLocaleString()}</p>
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
                    <th className="px-3 py-2.5 border-r border-[#1E293B] text-right font-bold">Net Pending Payable</th>
                    <th className="px-3 py-2.5 text-center font-bold print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidationLoading ? (
                    <TableLoader columns={8} />
                  ) : filteredConsolidation.length === 0 ? (
                    <tr><td colSpan={8} className="text-center p-6 text-black font-bold">No supplier records found.</td></tr>
                  ) : (
                    paginatedList.map((s: any, index: number) => (
                      <tr key={s.supplierId} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-center text-black font-bold">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{s.supplierName}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-black font-bold">{s.phone}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right text-black font-bold">{formatCurrency(s.openingBalance)} ({s.openingBalanceType})</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right font-bold text-[#1E3A8A]">{formatCurrency(s.totalPurchases)}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right font-bold text-[#047857]">{formatCurrency(s.totalPayments)}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-right text-black font-bold">{formatCurrency(s.totalReturns)}</td>
                        <td className={`px-3 py-2.5 border-r border-[#E2E8F0] text-right font-bold ${s.netPending > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                          {formatCurrency(s.netPending)}
                        </td>
                        <td className="px-3 py-2.5 text-center print:hidden">
                          <button type="button" onClick={() => handlePrintBreakdown(s.supplierId, s.supplierName)} disabled={printingId === s.supplierId} className="text-[#3B82F6] hover:bg-blue-50 p-1.5 rounded disabled:opacity-50 transition-colors" title="Print Bill-by-Bill Breakdown">
                            {printingId === s.supplierId ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                          </button>
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
                    <TableLoader columns={7} />
                  ) : filteredHistory.length === 0 ? (
                    <tr><td colSpan={7} className="text-center p-6 text-black font-bold">No payment vouchers found.</td></tr>
                  ) : (
                    paginatedList.map((p: any, index: number) => (
                      <tr key={p.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-center text-black font-bold">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#3B82F6]">{p.paymentNo}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-black font-bold">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] font-bold text-[#0F172A]">{p.supplier?.name || '-'}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-black font-bold">{p.paymentType?.name || p.paymentMode?.name || '-'}</td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8F0] text-black font-bold">{p.reference || '-'}</td>
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
      <PdfViewerModal 
        isOpen={pdfModalOpen} 
        onClose={() => setPdfModalOpen(false)} 
        pdfUrl={pdfUrl} 
        title="PENDING BALANCE BILL BY BILL" 
      />
    </div>
  );
};

export default SupplierPaymentsReport;















