import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CornerDownLeft, Search, Filter, Download } from 'lucide-react';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import { useSettings } from '../../contexts/SettingsContext';

const ProductWiseSalesReport = () => {
  const { formatCurrency } = useSettings();
  
  // Default to today
  const today = new Date().toISOString().split('T')[0];
  const [filterFromDate, setFilterFromDate] = useState(today);
  const [filterToDate, setFilterToDate] = useState(today);

  const { data: reportData = [], isLoading } = useQuery({
    queryKey: ['product-wise-sales', filterFromDate, filterToDate],
    queryFn: async () => {
      const { data } = await api.get('/reports/product-wise-sales', {
        params: {
          fromDate: filterFromDate,
          toDate: filterToDate
        }
      });
      return data;
    },
  });

  return (
    <div className="absolute inset-0 bg-[#F7F7F7] flex flex-col font-sans overflow-hidden z-10 p-4">
      <ReportTabs />

      <div className="flex flex-col flex-1 overflow-hidden mt-4">
        <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="bg-[#F8F9FA] border-b border-[#E6E9ED] px-4 py-3">
            <div className="flex items-start md:items-center justify-between gap-2 text-[#2563EB]">
              <div className="flex items-center gap-2">
                <CornerDownLeft size={18} className="shrink-0" />
                <h2 className="font-bold text-[13px] md:text-[14px] uppercase tracking-wide">Product Wise Sales Report</h2>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-3 border-b border-[#E6E9ED] flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-[12px] font-bold text-black font-bold">From Date:</label>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="px-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[12px] font-bold text-black font-bold">To Date:</label>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="px-3 py-2 border border-[#E5E7EB] rounded text-[13px] outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            {isLoading ? (
              <div className="p-8 text-center text-black font-bold">Loading report data...</div>
            ) : (
              <table className="w-full text-left text-[12px] whitespace-nowrap border-collapse">
                <thead>
                  <tr className="bg-[#1E293B] text-white font-bold sticky top-0 z-10 shadow-sm">
                    <th className="px-3 py-2 border-r border-[#334155] w-1/3">DOC #</th>
                    <th className="px-3 py-2 border-r border-[#334155] text-right w-1/3">SALES QTY</th>
                    <th className="px-3 py-2 text-right w-1/3">SALES VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-black font-bold border-b border-[#E6E9ED]">
                        No sales found for the selected dates.
                      </td>
                    </tr>
                  ) : (
                    reportData.map((group: any, idx: number) => (
                      <React.Fragment key={idx}>
                        {/* Group Header */}
                        <tr className="bg-[#5EEAD4] border-y border-[#E6E9ED]">
                          <td colSpan={3} className="px-3 py-2 font-bold text-[#0F766E] uppercase tracking-wider text-[11px]">
                            STOCK CODE : {group.productName}
                          </td>
                        </tr>
                        
                        {/* Group Items */}
                        {group.items.map((item: any, i: number) => (
                          <tr key={i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                            <td className="px-3 py-1.5 border-r border-[#F1F5F9] text-black font-bold pl-8">
                              {item.invoiceNo}
                            </td>
                            <td className="px-3 py-1.5 border-r border-[#F1F5F9] text-right text-black font-bold">
                              {item.qty}
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-[#059669]">
                              {formatCurrency(item.value)}
                            </td>
                          </tr>
                        ))}

                        {/* Group Footer / Subtotal */}
                        <tr className="bg-[#F8FAFC] border-b-2 border-[#CBD5E1]">
                          <td className="px-3 py-2 border-r border-[#E2E8F0] font-bold text-black font-bold text-right">
                            
                          </td>
                          <td className="px-3 py-2 border-r border-[#E2E8F0] font-bold text-[#2563EB] text-right">
                            {group.totalQty}
                          </td>
                          <td className="px-3 py-2 font-bold text-[#2563EB] text-right">
                            {formatCurrency(group.totalValue)}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductWiseSalesReport;
