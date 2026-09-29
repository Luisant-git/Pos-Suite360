import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CornerDownLeft, Package, Search, Filter, Download, RefreshCw , X} from 'lucide-react';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import { useSettings } from '../../contexts/SettingsContext';
import { exportTableToPdf, type PdfColumn } from '../../utils/exportPdf';
import { exportToExcel } from '../../utils/exportExcel';
import PaginationControls from '../../components/PaginationControls';
import TableLoader from '../../components/TableLoader';

const SalesReturnReport = () => {
  const { formatCurrency, settings } = useSettings();

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['sales-returns'],
    queryFn: async () => {
      const { data } = await api.get('/sales-returns');
      return data;
    },
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const filteredReturns = returns.filter((ret: any) => {
    let match = true;
    if (search) {
      const q = search.toLowerCase();
      const customerMatch = ret.customer?.name?.toLowerCase().includes(q) || false;
      const returnNoMatch = ret.returnNo?.toLowerCase().includes(q) || false;
      const invoiceNoMatch = ret.sale?.invoiceNo?.toLowerCase().includes(q) || false;
      if (!customerMatch && !returnNoMatch && !invoiceNoMatch) match = false;
    }
    if (filterFromDate) {
      if (new Date(ret.date) < new Date(filterFromDate)) match = false;
    }
    if (filterToDate) {
      if (new Date(ret.date) > new Date(filterToDate)) match = false;
    }
    return match;
  });

  const totalReturnsAmount = filteredReturns.reduce((sum: number, ret: any) => sum + (Number(ret.totalAmount) || 0), 0);
  const isReset = !search && !filterFromDate && !filterToDate;

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredReturns.length / entriesPerPage);
  const paginatedReturns = filteredReturns.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <div className="absolute inset-0 bg-[#F7F7F7] flex flex-col font-sans overflow-y-auto lg:overflow-hidden z-10 p-2 sm:p-4">
      <ReportTabs />

      <div className="flex flex-col flex-1 overflow-hidden mt-4">
        <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="bg-[#F8F9FA] border-b border-[#E6E9ED] px-4 py-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[#EF4444]">
              <div className="flex items-center gap-2">
                <CornerDownLeft size={18} className="shrink-0" />
                <h2 className="font-bold text-[13px] md:text-[14px] uppercase tracking-wide">Sales Returns Audit & History Report</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <div className="bg-[#EF4444] text-white font-bold text-[11px] px-3 py-1.5 rounded shadow-sm shrink-0 whitespace-nowrap flex items-center h-[30px]">
                  {returns.length} Returns
                </div>
                <button type="button"
                onClick={() => {
                  const cols: PdfColumn[] = [
                    { header: 'S.No', dataKey: '_sno' },
                    { header: 'Return No', dataKey: 'returnNo' },
                    { header: 'Return Date', dataKey: '_date' },
                    { header: 'Invoice No', dataKey: '_invoiceNo' },
                    { header: 'Customer Name', dataKey: '_customer' },
                    { header: 'Remarks', dataKey: 'remarks' },
                    { header: 'Refund Amount', dataKey: '_amount' },
                  ];
                  const rows = filteredReturns.map((ret: any, i: number) => ({
                    _sno: i + 1,
                    returnNo: ret.returnNo,
                    _date: new Date(ret.date).toISOString().split('T')[0],
                    _invoiceNo: ret.sale?.invoiceNo || '-',
                    _customer: ret.customer?.name || 'Unknown',
                    remarks: ret.remarks || '-',
                    _amount: formatCurrency(ret.totalAmount),
                  }));
                  rows.push({
                    _sno: '',
                    returnNo: '',
                    _date: '',
                    _invoiceNo: '',
                    _customer: '',
                    remarks: 'TOTAL AMOUNT:',
                    _amount: formatCurrency(totalReturnsAmount)
                  });
                  exportTableToPdf(cols, rows, 'Sales_Return_Report', 'Sales Return Report', settings?.shopName, filteredReturns.length);
                }}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors shrink-0"
              >
                <Download size={13} /> <span className="hidden lg:inline">Export PDF</span>
              </button>
              <button type="button"
                onClick={() => {
                  const exportData = filteredReturns.map((ret: any, i: number) => ({
                    'S.No': i + 1,
                    'Return No': ret.returnNo,
                    'Return Date': new Date(ret.date).toISOString().split('T')[0],
                    'Invoice No': ret.sale?.invoiceNo || '-',
                    'Customer Name': ret.customer?.name || 'Unknown',
                    'Remarks': ret.remarks || '-',
                    'Refund Amount': Number(ret.totalAmount) || 0,
                  }));
                  exportData.push({
                    'S.No': '',
                    'Return No': '',
                    'Return Date': '',
                    'Invoice No': '',
                    'Customer Name': '',
                    'Remarks': 'TOTAL AMOUNT:',
                    'Refund Amount': formatCurrency(totalReturnsAmount) as any,
                  });
                  exportToExcel(exportData, 'Sales_Return_Report', {
                    shopName: settings?.shopName || 'MY SHOP',
                    title: 'Sales Return Report',
                    totalCount: filteredReturns.length
                  });
                }}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors shrink-0 ml-2"
              >
                <Download size={13} /> <span className="hidden lg:inline">Export Excel</span>
              </button>
              </div>
            </div>
          </div>

          {/* Mobile Quick Bar (Date & Filter Toggle) */}
          <div className="md:hidden flex items-center justify-between gap-2 p-2 bg-white border-b border-[#E6E9ED] shrink-0">
            <div className="flex gap-2 flex-1">
              <input type="date" value={filterFromDate} onChange={(e) => setFilterFromDate(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
              <input type="date" value={filterToDate} onChange={(e) => setFilterToDate(e.target.value)} className="w-1/2 px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] font-bold text-black" />
            </div>
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-1 bg-[#EF4444] text-white px-3 py-1.5 rounded text-[12px] font-bold shrink-0">
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Filters */}
          <div className={`bg-white p-3 border-b border-[#E6E9ED] ${isFilterOpen ? 'fixed inset-0 z-[100] m-0 overflow-y-auto block' : 'hidden md:block'}`}>
            {isFilterOpen && (
              <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0] mb-3 md:hidden">
                <h3 className="font-bold text-[15px] text-[#1E3A8A]">Advanced Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="p-1.5 bg-red-50 text-red-600 rounded-full"><X size={16} /></button>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-black font-bold" />
              </div>
              <input
                type="text"
                placeholder="Search by return no, invoice no, or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#EF4444]"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-[130px]">
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#EF4444]"
                />
              </div>
              
              <div className="w-full sm:w-[130px]">
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#EF4444]"
                />
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button className="bg-[#EF4444] text-white px-3 py-2 rounded flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Filter size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setSearch('');
                    setFilterFromDate('');
                    setFilterToDate('');
                  }}
                  className={`px-3 py-2 rounded flex items-center justify-center transition-colors border shadow-sm text-[12px] font-bold ${!isReset ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-white text-black font-bold border-[#E5E7EB] hover:bg-gray-50'}`}
                  title="Reset Filters"
                >
                  <RefreshCw size={14} className="mr-1" /> Reset
                </button>
              </div>
              
              <div className="w-full sm:w-[110px]">
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none bg-white focus:border-[#EF4444]"
                >
                  <option value={10}>10 Entries</option>
                  <option value={25}>25 Entries</option>
                  <option value={50}>50 Entries</option>
                  <option value={100}>100 Entries</option>
                </select>
              </div>
            </div>
          </div>
        </div>

          {/* Table */}
          <div id="sales-return-export" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="pdf-header hidden mb-4">
              <div className="flex justify-between items-end">
                <h2 className="text-base font-bold text-black font-bold uppercase tracking-wider">Sales Return Report</h2>
                <p className="text-black font-bold text-xs">Date: {filterFromDate || 'All Time'} to {filterToDate || 'All Time'}</p>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar flex-1" id="sales-return-table">
              <table className="w-full text-left text-[13px] whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-[#0F172A] text-white font-bold">
                  <th className="px-4 py-3 border-r border-[#1E293B] w-12 text-center">S.No</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Return No</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Return Date</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Invoice No</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Customer Name</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Returned Products (Qty)</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Remarks</th>
                  <th className="px-4 py-3 text-right">Refund Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableLoader columns={8} />
                ) : filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-black font-bold">No sales returns found matching your filters.</td>
                  </tr>
                ) : (
                  paginatedReturns.map((ret: any, index: number) => (
                    <tr key={ret.id} className={`border-b border-[#F3F4F6] ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] text-center text-black font-bold">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-bold text-[#EF4444]">{ret.returnNo}</td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-bold text-black font-bold">
                        {new Date(ret.date).toISOString().split('T')[0]}
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-bold text-black font-bold">
                        {ret.sale?.invoiceNo || '-'}
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-bold text-black font-bold">
                        {ret.customer?.name || 'Unknown Customer'}
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6]">
                        <div className="flex flex-wrap gap-2">
                          {ret.items?.map((item: any) => (
                            <div key={item.id} className="bg-white border border-[#FECACA] text-[#991B1B] px-2 py-1 rounded flex items-center gap-1 text-[11px] font-bold shadow-sm">
                              <Package size={12} className="text-[#EF4444]" />
                              {item.product?.name} <span className="font-normal text-black font-bold">(Qty: {item.returnQty})</span>
                            </div>
                          ))}
                          {(!ret.items || ret.items.length === 0) && <span className="text-black font-bold text-[11px]">No items</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] text-black font-bold">
                        {ret.remarks || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#EF4444]">
                        {formatCurrency(ret.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pdf-footer hidden mt-6 text-right border-t-2 border-[#1E293B] pt-4 pb-8 pr-6">
            <h3 className="text-xl font-bold text-black font-bold inline-block">Total Refund Amount: {formatCurrency(totalReturnsAmount)}</h3>
          </div>
          </div>
          {!isLoading && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={filteredReturns.length}
              entriesPerPage={entriesPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReturnReport;



