import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

const PurchaseList = () => {
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Purchases
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data } = await api.get('/purchases');
      return data;
    },
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: () => {
      alert('Failed to delete purchase.');
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this purchase? This will revert the stock and ledger entries.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-sm border border-[#E6E9ED]">
      {/* Header & Breadcrumbs */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E6E9ED]">
        <div>
          <h2 className="text-[22px] font-bold text-[#1F2937]">Purchase Invoices</h2>
          <div className="text-[12px] text-[#6B7280] flex items-center gap-2 mt-1">
            <span className="hover:text-[#3B82F6] cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Home</span> 
            <span>/</span>
            <span className="hover:text-[#3B82F6] cursor-pointer transition-colors">Transactions</span>
            <span>/</span>
            <span className="text-[#3B82F6] font-medium">Purchase Entry</span>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] px-4 py-3 rounded-md mb-6 flex items-center text-[13px]">
        <svg className="w-5 h-5 mr-2 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Manage your purchase invoices here. Click <span className="font-bold mx-1">"Add New Purchase"</span> to create a new entry.
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="text-[#73879C]">Show</span>
          <select className="border border-[#ccc] rounded px-2 py-1 outline-none text-[#555]">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-[#73879C]">entries</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#ccc] rounded px-3 py-1 outline-none text-[#555]"
            />
          </div>

          <button 
            onClick={() => navigate('/purchase/new')}
            className="bg-[#3B82F6] hover:bg-[#2563EB] font-bold text-white px-3 py-1 rounded border border-[#2563EB] flex items-center gap-1 transition-colors"
          >
            <Plus size={16} />
            Add New Purchase
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E6E9ED] shadow-sm rounded-sm overflow-hidden">
        <div className="bg-[#EBF5FF] border-b border-[#3B82F6] px-4 py-3 flex items-center gap-2">
          <FileText size={16} className="text-[#1E3A8A]" />
          <h2 className="font-bold text-[14px] text-[#1E3A8A]">PURCHASE INVOICES LIST</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#2A2A2A] text-white font-bold">
                <th className="px-3 py-2.5 border-r border-[#444] relative">Date</th>
                <th className="px-3 py-2.5 border-r border-[#444] relative">Invoice No</th>
                <th className="px-3 py-2.5 border-r border-[#444] relative">Supplier</th>
                <th className="px-3 py-2.5 border-r border-[#444] relative text-right">Total Amount (₹)</th>
                <th className="px-3 py-2.5 border-r border-[#444] relative text-center">Payment</th>
                <th className="px-3 py-2.5 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-[#73879C]">Loading...</td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-[#73879C]">No purchase invoices found.</td>
                </tr>
              ) : (
                purchases.map((purchase: any, index: number) => (
                  <tr key={purchase.id} className={`border-b border-[#E5E7EB] ${index % 2 === 0 ? 'bg-[#F9F9F9]' : 'bg-white'} hover:bg-blue-50`}>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-[#333] font-medium">{purchase.date ? new Date(purchase.date).toISOString().split('T')[0] : '-'}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-[#3B82F6] font-bold cursor-pointer hover:underline">{purchase.invoiceNo}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-[#333] font-medium">{purchase.supplier?.name || 'Unknown Supplier'}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-[#333] font-bold text-right">{formatCurrency(purchase.grandTotal)}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-center">
                      <span className="bg-[#22C55E] text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">PAID</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="text-[#3B82F6] border border-[#3B82F6] rounded p-1 hover:bg-[#3B82F6] hover:text-white transition-colors">
                          <FileText size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(purchase.id)}
                          disabled={deleteMutation.isPending}
                          className="text-[#EF4444] border border-[#EF4444] rounded p-1 hover:bg-[#EF4444] hover:text-white transition-colors disabled:opacity-50"
                          title="Delete Invoice"
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
      </div>
    </div>
  );
};

export default PurchaseList;
