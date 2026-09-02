import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CornerDownLeft, Package, Search, Filter, Download } from 'lucide-react';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import { useSettings } from '../../contexts/SettingsContext';
import { exportTableToPdf } from '../../utils/exportPdf';
import PaginationControls from '../../components/PaginationControls';

const SalesReturnReport = () => {
  const { formatCurrency } = useSettings();

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['sales-returns'],
    queryFn: async () => {
      const { data } = await api.get('/sales-returns');
      return data;
    },
  });

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

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredReturns.length / entriesPerPage);
  const paginatedReturns = filteredReturns.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <div className="absolute inset-0 bg-[#F7F7F7] flex flex-col font-sans overflow-hidden z-10 p-4">
      <ReportTabs />

      <div className="flex flex-col flex-1 overflow-hidden mt-4">
        <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="bg-[#F8F9FA] border-b border-[#E6E9ED] px-4 py-3">
            <div className="flex items-start md:items-center justify-between gap-2 text-[#EF4444]">
              <div className="flex items-center gap-2">
                <CornerDownLeft size={18} className="shrink-0" />
                <h2 className="font-bold text-[13px] md:text-[14px] uppercase tracking-wide">Sales Returns Audit & History Report</h2>
              </div>
              <div className="bg-[#EF4444] text-white font-bold text-[11px] px-3 py-1 rounded-sm shadow-sm shrink-0 whitespace-nowrap">
                {returns.length} Returns
              </div>
              <button type="button"
                onClick={() => exportTableToPdf('sales-return-export', 'Sales_Return_Report')}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors shrink-0"
              >
                <Download size={13} /> Export PDF
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-3 border-b border-[#E6E9ED] grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative col-span-1 md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                placeholder="Search by return no, invoice no, or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#EF4444]"
              />
            </div>
            <div>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#EF4444]"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#EF4444]"
              />
              <button className="bg-[#EF4444] text-white px-3 rounded flex items-center justify-center hover:bg-red-600 transition-colors">
                <Filter size={14} />
              </button>
            </div>
            <div>
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

          {/* Table */}
          <div id="sales-return-export" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="pdf-header hidden mb-4">
              <div className="flex justify-between items-end">
                <h2 className="text-base font-bold text-[#1E293B] uppercase tracking-wider">Sales Return Report</h2>
                <p className="text-[#475569] font-bold text-xs">Date: {filterFromDate || 'All Time'} to {filterToDate || 'All Time'}</p>
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
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#6B7280] font-medium">Loading report data...</td>
                  </tr>
                ) : filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#6B7280] font-medium">No sales returns found matching your filters.</td>
                  </tr>
                ) : (
                  paginatedReturns.map((ret: any, index: number) => (
                    <tr key={ret.id} className={`border-b border-[#F3F4F6] ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] text-center text-[#64748B] font-medium">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-bold text-[#EF4444]">{ret.returnNo}</td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-medium text-[#374151]">
                        {new Date(ret.date).toISOString().split('T')[0]}
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-bold text-[#1F2937]">
                        {ret.sale?.invoiceNo || '-'}
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] font-bold text-[#1F2937]">
                        {ret.customer?.name || 'Unknown Customer'}
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6]">
                        <div className="flex flex-wrap gap-2">
                          {ret.items?.map((item: any) => (
                            <div key={item.id} className="bg-white border border-[#FECACA] text-[#991B1B] px-2 py-1 rounded flex items-center gap-1 text-[11px] font-bold shadow-sm">
                              <Package size={12} className="text-[#EF4444]" />
                              {item.product?.name} <span className="font-normal text-[#4B5563]">(Qty: {item.returnQty})</span>
                            </div>
                          ))}
                          {(!ret.items || ret.items.length === 0) && <span className="text-[#9CA3AF] text-[11px]">No items</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-[#F3F4F6] text-[#4B5563]">
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
            <h3 className="text-xl font-bold text-[#1E293B] inline-block">Total Refund Amount: {formatCurrency(totalReturnsAmount)}</h3>
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
