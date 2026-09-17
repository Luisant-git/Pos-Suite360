import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, CheckCircle, List, Grid, Search, Maximize, Minimize, Download, Calendar, Filter, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import api from '../../services/api';
import { exportTableToPdf } from '../../utils/exportPdf';
import { exportToExcel } from '../../utils/exportExcel';
import { useSettings } from '../../contexts/SettingsContext';

const expenseCategorySchema = z.object({
  name: z.string().min(1, 'Category Name is required'),
});

type ExpenseCategoryFormValues = z.infer<typeof expenseCategorySchema>;

const ExpenseCategories = () => {
  const queryClient = useQueryClient();
  const { formatCurrency, settings } = useSettings();
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullTable, setIsFullTable] = useState(false);

  // Date Filter State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: { name: '' }
  });

  // Fetch Categories with date-filtered expenses
  const { data: expenseCategories = [], isLoading, refetch } = useQuery({ 
    queryKey: ['expenseCategories', startDate, endDate], 
    queryFn: async () => {
      const res = await api.get('/expense-categories', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
      });
      return res.data;
    } 
  });

  const categoriesWithTotals = expenseCategories.map((c: any) => {
    const entriesCount = c.expenses?.length || 0;
    const totalAmount = c.expenses?.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 0;
    return {
      ...c,
      entriesCount,
      totalAmount,
    };
  });

  const filteredCategories = categoriesWithTotals.filter((c: any) => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const grandTotalAmount = filteredCategories.reduce((sum: number, c: any) => sum + Number(c.totalAmount || 0), 0);

  const mutation = useMutation({
    mutationFn: async (data: ExpenseCategoryFormValues) => {
      if (editingId) {
        return api.patch(`/expense-categories/${editingId}`, data);
      }
      return api.post('/expense-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
      reset();
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/expense-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
      setItemToDelete(null);
    }
  });

  const onSubmit = (data: ExpenseCategoryFormValues) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, onSubmit]);

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setValue('name', category.name);
  };

  const setQuickDate = (type: 'today' | 'thisMonth' | 'all') => {
    const now = new Date();
    if (type === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handlePdfExport = () => {
    exportTableToPdf('expense-categories-export', 'Expense_Categories_Report');
  };

  const handleExcelExport = () => {
    const exportData = filteredCategories.map((c: any) => ({
      'Category ID': c.id,
      'Category Name': c.name,
      'Total Expenses Count': c.entriesCount,
      'Total Amount Spent': c.totalAmount,
    }));
    exportToExcel(exportData, 'Expense_Categories_Report');
  };

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)] flex flex-col gap-4">
      
      {/* Date Filter & Export Header */}
      <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <Calendar size={18} />
            <h1 className="font-bold text-[15px] uppercase tracking-wide">EXPENSE CATEGORIES & DATE FILTER</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button" 
              onClick={handleExcelExport}
              className="bg-[#10B981] hover:bg-[#059669] text-white text-[12px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Export Excel
            </button>
            <button 
              type="button" 
              onClick={handlePdfExport}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[12px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Date Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
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
          <div className="sm:col-span-2 flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => refetch()}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[12px] font-bold px-4 py-2 rounded flex items-center gap-1 transition-colors"
            >
              <Filter size={14} /> Apply Filter
            </button>
            <button 
              type="button" 
              onClick={() => setQuickDate('today')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-bold px-3 py-2 rounded transition-colors"
            >
              Today
            </button>
            <button 
              type="button" 
              onClick={() => setQuickDate('thisMonth')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-bold px-3 py-2 rounded transition-colors"
            >
              This Month
            </button>
            <button 
              type="button" 
              onClick={() => setQuickDate('all')}
              className="text-gray-500 hover:text-gray-700 text-[12px] font-bold px-2 py-2 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Form */}
        {!isFullTable && (
        <div className="lg:col-span-1 bg-white border border-[#E6E9ED] shadow-sm rounded-sm self-start">
          <div className="bg-[#EBF5FF] border-b border-[#3B82F6] px-4 py-3 flex items-center gap-2 rounded-t-sm">
            <List size={16} className="text-[#1E3A8A]" />
            <h2 className="font-bold text-[14px] text-[#1E3A8A]">EXPENSE CATEGORY FORM</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#1F2937] mb-1">Category Name *</label>
              <input 
                {...register('name')}
                type="text" 
                placeholder="e.g. Rent, Salary, Office Supplies"
                className="w-full px-3 py-2 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
              />
              {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
            </div>

            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded flex justify-center items-center gap-2 mt-4 transition-colors"
            >
              <CheckCircle size={16} />
              {editingId ? 'UPDATE CATEGORY' : 'SAVE CATEGORY (F10)'}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={() => { reset(); setEditingId(null); }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded flex justify-center items-center gap-2 transition-colors"
              >
                CANCEL EDIT
              </button>
            )}
          </form>
        </div>
        )}

        {/* Right Column: List & Report Export Area */}
        <div className={`${isFullTable ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#E6E9ED] shadow-sm rounded-sm overflow-hidden flex flex-col self-start`}>
          <div className="bg-[#EBF5FF] border-b border-[#3B82F6] px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2 text-[#1E3A8A]">
                <Grid size={16} className="text-[#1E3A8A]" />
                <h2 className="font-bold text-[14px]">EXPENSE CATEGORIES & TOTAL SPENT</h2>
              </div>
              <div className="md:hidden bg-gray-500 text-white text-[11px] font-bold px-2 py-1 rounded-xl">
                {filteredCategories.length} Categories
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="hidden md:block bg-gray-500 text-white text-[11px] font-bold px-2 py-1 rounded-xl">
                {filteredCategories.length} Categories
              </div>
              <div className="flex flex-row items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search size={14} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search categories..."
                    className="pl-7 pr-3 py-1 border border-[#ccc] rounded text-[12px] w-full md:w-48 outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <button type="button" 
                  onClick={() => setIsFullTable(!isFullTable)}
                  className="whitespace-nowrap text-[#3B82F6] hover:bg-white px-2 py-1 rounded text-[12px] font-bold flex items-center justify-center gap-1 transition-colors border border-[#3B82F6]"
                >
                  {isFullTable ? <Minimize size={14} /> : <Maximize size={14} />}
                  <span className="hidden sm:inline">{isFullTable ? 'Show Form' : 'View Full Table'}</span>
                  <span className="sm:hidden">{isFullTable ? 'Form' : 'Full Table'}</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Export Wrapper Container */}
          <div id="expense-categories-export" className="p-4 flex flex-col flex-1">
            
            {/* Hidden Printable PDF Header */}
            <div className="pdf-header hidden mb-4 border-b border-black pb-3">
              <div className="text-center">
                <h1 className="text-xl font-bold uppercase">{settings?.shopName || 'MY SHOP'}</h1>
                <p className="text-sm font-semibold">EXPENSE CATEGORIES SUMMARY REPORT</p>
                <p className="text-xs text-gray-600 mt-1">
                  Filter Date Range: {startDate || 'All Time'} to {endDate || 'All Time'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap min-w-[650px]">
                <thead>
                  <tr className="bg-[#2A2A2A] text-white font-bold">
                    <th className="px-3 py-2.5 border-r border-[#444] text-center w-12">ID</th>
                    <th className="px-3 py-2.5 border-r border-[#444]">Category Name</th>
                    <th className="px-3 py-2.5 border-r border-[#444] text-center">Entries Count</th>
                    <th className="px-3 py-2.5 border-r border-[#444] text-right">Total Spent (RM)</th>
                    <th className="px-3 py-2.5 text-center w-24 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-4">No categories found.</td></tr>
                  ) : (
                    filteredCategories.map((category: any, index: number) => (
                      <tr key={category.id} className={`border-b border-[#E5E7EB] ${index % 2 === 0 ? 'bg-[#F9F9F9]' : 'bg-white'} hover:bg-blue-50`}>
                        <td data-label="ID" className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold">{category.id}</td>
                        <td data-label="Category Name" className="px-3 py-2.5 border-r border-[#E5E7EB] font-bold text-[#16A34A]">
                          {category.name}
                        </td>
                        <td data-label="Entries Count" className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold text-gray-700">
                          {category.entriesCount}
                        </td>
                        <td data-label="Total Spent" className="px-3 py-2.5 border-r border-[#E5E7EB] text-right font-bold text-[#3B82F6]">
                          {formatCurrency(category.totalAmount)}
                        </td>
                        <td data-label="Actions" className="px-3 py-2.5 text-center print:hidden">
                          <div className="flex justify-center gap-2">
                            <button type="button" 
                              onClick={() => handleEdit(category)}
                              className="text-[#3B82F6] border border-[#3B82F6] rounded p-1 hover:bg-[#3B82F6] hover:text-white transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button type="button" 
                              onClick={() => {
                                setItemToDelete(category);
                              }}
                              className="text-[#EF4444] border border-[#EF4444] rounded p-1 hover:bg-[#EF4444] hover:text-white transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Expense Summary Footer */}
            <div className="mt-4 pt-3 border-t-2 border-[#1E3A8A] flex justify-between items-center bg-[#F0F7FF] px-4 py-3 rounded">
              <span className="font-bold text-[14px] text-[#1E3A8A] uppercase">Total Expenses Across Filtered Categories</span>
              <span className="font-bold text-[16px] text-[#16A34A]">{formatCurrency(grandTotalAmount)}</span>
            </div>

            {/* Hidden Printable PDF Footer */}
            <div className="pdf-footer hidden mt-6 pt-2 border-t border-black text-right">
              <p className="text-xs text-gray-500">Printed on: {new Date().toLocaleString()}</p>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        itemName={itemToDelete?.name}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default ExpenseCategories;
