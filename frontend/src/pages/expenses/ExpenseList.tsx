import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Download, Plus, Filter, DollarSign } from 'lucide-react';
import { exportTableToPdf } from '../../utils/exportPdf';
import { exportToExcel } from '../../utils/exportExcel';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';

const ExpenseList = () => {
  const { formatCurrency, settings } = useSettings();

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Expense Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: async () => (await api.get('/expense-categories')).data
  });

  // Fetch Expenses List
  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['expensesList', startDate, endDate, categoryId, searchQuery],
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

  const handlePdfExport = () => {
    exportTableToPdf('expense-list-export', 'Expense_History');
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
    exportToExcel(exportData, 'Expense_History');
  };

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)] flex flex-col gap-4 p-4">
      
      {/* Top Header Card */}
      <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#EF4444] text-white p-2.5 rounded-lg shadow-sm">
            <DollarSign size={20} />
          </div>
          <div>
            <h1 className="font-bold text-[16px] text-[#1E3A8A] uppercase">EXPENSE HISTORY & ENTRY LIST</h1>
            <p className="text-xs text-gray-500">View, filter, and export all recorded business expenses</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link 
            to="/expenses/new" 
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[13px] font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={16} /> NEW EXPENSE ENTRY
          </Link>
          <button 
            type="button" 
            onClick={handleExcelExport}
            className="bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-bold px-3 py-2 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download size={14} /> Export Excel
          </button>
          <button 
            type="button" 
            onClick={handlePdfExport}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[12px] font-bold px-3 py-2 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Date Filter & Search Section */}
      <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">From Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#ccc] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">To Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#ccc] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">Category Filter</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#ccc] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => refetch()}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[12px] font-bold px-4 py-2 rounded flex items-center gap-1 transition-colors w-full justify-center"
            >
              <Filter size={14} /> Apply Filter
            </button>
            <button 
              type="button" 
              onClick={() => { setStartDate(''); setEndDate(''); setCategoryId(''); setSearchQuery(''); }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-[12px] font-bold px-3 py-2 rounded transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Expense List Table Container */}
      <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm overflow-hidden flex flex-col flex-1">
        
        <div id="expense-list-export" className="p-4 flex flex-col flex-1">
          
          {/* Printable PDF Header */}
          <div className="pdf-header hidden mb-4 border-b border-black pb-3">
            <div className="text-center">
              <h1 className="text-xl font-bold uppercase">{settings?.shopName || 'MY SHOP'}</h1>
              <h2 className="text-sm font-semibold">EXPENSE HISTORY REPORT</h2>
              <p className="text-xs text-gray-600">Date Range: {startDate || 'All Time'} to {endDate || 'All Time'}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap min-w-[700px]">
              <thead>
                <tr className="bg-[#2A2A2A] text-white font-bold">
                  <th className="px-3 py-2.5 border-r border-[#444] text-center w-12">#</th>
                  <th className="px-3 py-2.5 border-r border-[#444]">Date</th>
                  <th className="px-3 py-2.5 border-r border-[#444]">Category</th>
                  <th className="px-3 py-2.5 border-r border-[#444]">Payment Mode</th>
                  <th className="px-3 py-2.5 border-r border-[#444]">Notes / Description</th>
                  <th className="px-3 py-2.5 text-right font-bold">Amount (RM)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center p-4">Loading expenses...</td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-4 text-gray-500">No expense transactions found.</td></tr>
                ) : (
                  expenses.map((e: any, index: number) => (
                    <tr key={e.id} className={`border-b border-[#E5E7EB] ${index % 2 === 0 ? 'bg-[#F9F9F9]' : 'bg-white'} hover:bg-blue-50`}>
                      <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold text-gray-600">{index + 1}</td>
                      <td className="px-3 py-2.5 border-r border-[#E5E7EB] font-bold text-[#1F2937]">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 border-r border-[#E5E7EB] font-bold text-[#16A34A]">{e.category?.name || '-'}</td>
                      <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-gray-700">{e.paymentMode?.name || '-'}</td>
                      <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-gray-600">{e.notes || '-'}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-[#EF4444]">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Footer */}
          <div className="mt-4 pt-3 border-t-2 border-[#1E3A8A] flex justify-between items-center bg-[#F0F7FF] px-4 py-3 rounded">
            <span className="font-bold text-[14px] text-[#1E3A8A] uppercase">Total Expenses ({expenses.length} Records)</span>
            <span className="font-bold text-[16px] text-[#EF4444]">{formatCurrency(totalExpenseAmount)}</span>
          </div>

          {/* Printable PDF Footer */}
          <div className="pdf-footer hidden mt-6 pt-2 border-t border-black text-right">
            <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
