import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Box, Activity } from 'lucide-react';
import { exportTableToPdf, type PdfColumn } from '../../utils/exportPdf';
import api from '../../services/api';
import ReportTabs from '../../components/ReportTabs';
import { exportToExcel } from '../../utils/exportExcel';
import { useSettings } from '../../contexts/SettingsContext';
import PaginationControls from '../../components/PaginationControls';
import SearchableSelect from '../../components/SearchableSelect';
import TableLoader from '../../components/TableLoader';

const StockReport = () => {
  const { formatCurrency, settings } = useSettings();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: async () => (await api.get('/categories')).data });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: async () => (await api.get('/brands')).data });

  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [quickSearch, setQuickSearch] = useState('');

  // Fetch Stock Data
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['stockReport', categoryId, brandId, quickSearch],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: {
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
          search: quickSearch || undefined,
        }
      });
      return data.map((p: any) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        brandName: p.brand?.name || '-',
        categoryName: p.category?.name || '-',
        currentBirds: p.currentBirds || 0,
        currentQty: `${p.currentStock} ${p.unit?.shortCode || p.unit?.name || ''}`.trim(),
        purRate: formatCurrency(p.purchaseRate),
        stockValue: formatCurrency(Number(p.currentStock) * Number(p.purchaseRate)),
        rawStockValue: Number(p.currentStock) * Number(p.purchaseRate),
      }));
    },
  });

  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const totalStockValue = products.reduce((sum: number, p: any) => sum + (Number(p.rawStockValue) || 0), 0);

  const isReset = !categoryId && !brandId && !quickSearch;

  const totalPages = Math.ceil(products.length / entriesPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col font-sans overflow-hidden z-10 p-4">
      
      <ReportTabs />

      {/* Filter Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md mb-4 p-4 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
          <div>
            <label className="flex items-center gap-1 text-[12px] text-black font-bold mb-1 font-bold">Category</label>
            <SearchableSelect
              options={[{ value: '', label: 'All Categories' }, ...categories.map((c: any) => ({ value: c.id, label: c.name }))]}
              value={categoryId}
              onChange={(val) => setCategoryId(val || '')}
              placeholder="All Categories"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-[12px] text-black font-bold mb-1 font-bold">Brand</label>
            <SearchableSelect
              options={[{ value: '', label: 'All Brands' }, ...brands.map((b: any) => ({ value: b.id, label: b.name }))]}
              value={brandId}
              onChange={(val) => setBrandId(val || '')}
              placeholder="All Brands"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-[12px] text-black font-bold mb-1 font-bold">Search Product</label>
            <input 
              type="text" 
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-black font-bold focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-[12px] text-black font-bold mb-1 font-bold">Show</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded outline-none text-[13px] text-black font-bold bg-white focus:border-[#3B82F6]"
            >
              <option value={10}>10 Entries</option>
              <option value={25}>25 Entries</option>
              <option value={50}>50 Entries</option>
              <option value={100}>100 Entries</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-2 border-t border-dashed border-[#E2E8F0] gap-3 md:gap-0">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button type="button" onClick={() => refetch()} className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-[13px] font-bold transition-colors">
              Apply Filter
            </button>
            <button type="button" onClick={() => {
              setCategoryId('');
              setBrandId('');
              setQuickSearch('');
            }} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-bold transition-colors shadow-sm border ${!isReset ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-white text-black font-bold border-[#CBD5E1] hover:bg-gray-100'}`}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report Table Section */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-md overflow-hidden flex flex-col flex-1">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 shrink-0">
          <div className="flex items-center gap-2 text-black font-bold">
            <Box size={16} />
            <h2 className="font-bold text-[13px] tracking-wide text-black font-bold">STOCK AS ON DATE REPORT</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button type="button" 
              onClick={() => {
                const exportData = products.map((p: any) => ({
                  'Item Code': p.code,
                  'Product Name': p.name,
                  'Brand': p.brandName,
                  'Category': p.categoryName,
                  'Current Birds': p.currentBirds,
                  'Current Qty': p.currentQty,
                  'Pur Rate': p.purRate,
                  'Stock Value': p.stockValue,
                }));
                exportData.push({
                  'Item Code': '',
                  'Product Name': '',
                  'Brand': '',
                  'Category': '',
                  'Current Birds': '',
                  'Current Qty': '',
                  'Pur Rate': 'TOTAL VALUE:',
                  'Stock Value': formatCurrency(totalStockValue) as any,
                });
                exportToExcel(exportData, 'Stock_Report', {
                  shopName: settings?.shopName || 'MY SHOP',
                  title: 'Stock Report',
                  totalCount: products.length
                });
              }}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors"
            >
              <Download size={14} /> Export Excel
            </button>
            <button type="button"
              onClick={() => {
                const cols: PdfColumn[] = [
                  { header: 'Item Code', dataKey: 'code' },
                  { header: 'Product Name', dataKey: 'name' },
                  { header: 'Brand', dataKey: 'brandName' },
                  { header: 'Category', dataKey: 'categoryName' },
                  { header: 'Current Birds', dataKey: 'currentBirds' },
                  { header: 'Current Qty', dataKey: 'currentQty' },
                  { header: 'Pur Rate', dataKey: 'purRate' },
                  { header: 'Stock Value', dataKey: 'stockValue' },
                ];
                const pdfData = [...products, {
                  code: '',
                  name: '',
                  brandName: '',
                  categoryName: '',
                  currentBirds: '',
                  currentQty: '',
                  purRate: 'TOTAL VALUE:',
                  stockValue: formatCurrency(totalStockValue)
                }];
                exportTableToPdf(cols, pdfData, 'Stock_Report', 'Stock Report', settings?.shopName, products.length);
              }}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors"
            >
              <Download size={14} /> Export PDF
            </button>
            <button type="button" className="bg-[#64748B] hover:bg-[#475569] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1.5 text-[12px] font-bold whitespace-nowrap transition-colors">
              <Activity size={14} /> Live Inventory Valuation
            </button>
          </div>
        </div>

        <div id="stock-report-export" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="pdf-header hidden mb-4">
            <div className="flex justify-between items-end">
              <h2 className="text-base font-bold text-black font-bold uppercase tracking-wider">Stock Report</h2>
              <p className="text-black font-bold text-xs">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex-1 overflow-auto overflow-x-auto" id="stock-report-table">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#0F172A] text-white font-bold">
                <th className="px-4 py-3 border-r border-[#1E293B] w-12 text-center">S.No</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Item Code</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Product Name</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Brand</th>
                <th className="px-4 py-3 border-r border-[#1E293B]">Category</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Birds</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Current Qty</th>
                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Pur Rate</th>
                <th className="px-4 py-3 text-right">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableLoader columns={8} />
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-6 text-black font-bold">No stock records found.</td></tr>
              ) : (
                paginatedProducts.map((p: any, index: number) => (
                  <tr key={p.id} className={`border-b border-[#E2E8F0] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF]`}>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-center text-black font-bold">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{p.code}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] font-bold text-black font-bold">{p.name}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{p.brandName}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{p.categoryName}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-black font-bold">{p.currentBirds}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right font-bold text-black font-bold">{p.currentQty}</td>
                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-black font-bold">{p.purRate}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#3B82F6]">{p.stockValue}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="pdf-footer hidden mt-6 text-right border-t-2 border-[#1E293B] pt-4 pb-8 pr-6">
          <h3 className="text-xl font-bold text-black font-bold inline-block">Total Stock Value: {formatCurrency(totalStockValue)}</h3>
        </div>
        </div>
        {!isLoading && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={products.length}
            entriesPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      
    </div>
  );
};

export default StockReport;
