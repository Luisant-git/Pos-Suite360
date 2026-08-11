import { useQuery } from '@tanstack/react-query';
import { CornerDownLeft, Package } from 'lucide-react';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import { useSettings } from '../../contexts/SettingsContext';

const PurchaseReturnReport = () => {
  const { formatCurrency } = useSettings();

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['purchase-returns'],
    queryFn: async () => {
      const { data } = await api.get('/purchase-returns');
      return data;
    },
  });

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-60px)] flex flex-col">
      <ReportTabs />

      <div className="p-4 flex-1">
        <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#F8F9FA] border-b border-[#E6E9ED] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <CornerDownLeft size={18} />
              <h2 className="font-bold text-[14px] uppercase tracking-wide">Purchase Returns Audit & History Report</h2>
            </div>
            <div className="bg-[#FACC15] text-[#854D0E] font-bold text-[11px] px-3 py-1 rounded-sm shadow-sm">
              {returns.length} Returns
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#0F172A] text-white font-bold">
                  <th className="px-4 py-3 border-r border-[#1E293B]">Return No</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Return Date</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Supplier Name</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Returned Products (Qty)</th>
                  <th className="px-4 py-3 border-r border-[#1E293B]">Remarks</th>
                  <th className="px-4 py-3 text-right">Claim Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-medium">Loading report data...</td>
                  </tr>
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-medium">No purchase returns found.</td>
                  </tr>
                ) : (
                  returns.map((ret: any, index: number) => (
                    <tr key={ret.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                      <td className="px-4 py-3 border-r border-gray-100 font-bold text-[#F59E0B]">{ret.returnNo}</td>
                      <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-700">
                        {new Date(ret.date).toISOString().split('T')[0]}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100 font-bold text-gray-800">
                        {ret.supplier?.name || 'Unknown Supplier'}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {ret.items?.map((item: any) => (
                            <div key={item.id} className="bg-white border border-[#FDE68A] text-[#92400E] px-2 py-1 rounded flex items-center gap-1 text-[11px] font-bold shadow-sm">
                              <Package size={12} className="text-[#F59E0B]" />
                              {item.product?.name} <span className="font-normal text-gray-600">(Qty: {item.returnQty})</span>
                            </div>
                          ))}
                          {(!ret.items || ret.items.length === 0) && <span className="text-gray-400 text-[11px]">No items</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100 text-gray-600">
                        {ret.remarks || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {formatCurrency(ret.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnReport;
