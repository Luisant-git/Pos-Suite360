import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Box, Activity } from 'lucide-react';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';

const StockReport = () => {
  const [categoryId] = useState('');
  const [brandId] = useState('');

  // Fetch Stock Data
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['stockReport', categoryId, brandId],
    queryFn: async () => {
      // Stub: Replace with actual report endpoint
      return [
        { id: 1, code: 'P2113', name: '3 ROSES TEA POWDER(100G)', brandName: '-', categoryName: 'GROCERY', currentQty: '63', purRate: '₹80.00', stockValue: '₹5040.00' },
        { id: 2, code: 'P5570', name: 'CHAKRA GOLD TEA POWDER', brandName: '-', categoryName: 'GROCERY', currentQty: '73', purRate: '₹60.00', stockValue: '₹4380.00' },
        { id: 3, code: 'P1286', name: 'HAMAM SOAP(100G)', brandName: '-', categoryName: 'GROCERY', currentQty: '1', purRate: '₹55.00', stockValue: '₹55.00' },
        { id: 4, code: 'PTEST459', name: 'Test Multi Filter Product', brandName: 'TestBrand_1785933914', categoryName: 'TestCat_1785933914', currentQty: '152', purRate: '₹10.00', stockValue: '₹1520.00' },
        { id: 5, code: 'PTEST494', name: 'Test Multi Filter Product', brandName: 'TestBrand_1785933925', categoryName: 'TestCat_1785933925', currentQty: '33', purRate: '₹10.00', stockValue: '₹330.00' },
        { id: 6, code: 'PTEST100', name: 'Test Multi Filter Product', brandName: 'TestBrand_1785933938', categoryName: 'TestCat_1785933938', currentQty: '14', purRate: '₹10.00', stockValue: '₹140.00' },
        { id: 7, code: 'PTEST292', name: 'Test Product', brandName: 'Test Brand 836', categoryName: 'Test Cat 484', currentQty: '4', purRate: '₹50.00', stockValue: '₹200.00' },
        { id: 8, code: 'PTEST837', name: 'Test Product', brandName: 'Test Brand 471', categoryName: 'Test Cat 993', currentQty: '0', purRate: '₹50.00', stockValue: '₹0.00' },
      ]; 
    },
  });

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-100px)] p-4">
      
      <ReportTabs />

      {/* Report Table Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md overflow-hidden flex flex-col">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#475569]">
            <Box size={16} />
            <h2 className="font-bold text-[13px] tracking-wide text-[#334155]">STOCK AS ON DATE REPORT</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-[12px] font-bold transition-colors">
              <Download size={14} /> Export Excel / CSV
            </button>
            <button className="bg-[#64748B] hover:bg-[#475569] text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-[12px] font-bold transition-colors">
              <Activity size={14} /> Live Inventory Valuation
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#0F172A] text-white font-bold">
                <th className="px-4 py-3 border-r border-[#1E293B]">Item Code</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Product Name</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Brand</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Category</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Current Qty</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Pur Rate</th>
                <th className="px-4 py-3 text-right">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center p-6 text-gray-500">Loading report data...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-6 text-gray-500">No stock records found.</td></tr>
              ) : (
                products.map((p: any, index: number) => (
                  <tr key={p.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-[#334155]">{p.code}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] font-bold text-[#1E293B]">{p.name}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-[#475569]">{p.brandName}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-[#475569]">{p.categoryName}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right font-bold text-[#334155]">{p.currentQty}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-[#475569]">{p.purRate}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#3B82F6]">{p.stockValue}</td>
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

export default StockReport;
