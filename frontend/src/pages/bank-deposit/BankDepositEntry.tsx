import { useState } from 'react';
import { X, Briefcase, PlusSquare, Filter, Building } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import TableLoader from '../../components/TableLoader';

const BankDepositEntry = () => {
  const { formatCurrency, settings } = useSettings();
  const queryClient = useQueryClient();

  // New Deposit Form State
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [depositType, setDepositType] = useState('BANK');
  
  // Date-wise Filter & Search State for History
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [filterEndDate, setFilterEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Fetch Deposits List with date filter
  const { data: deposits = [], isLoading: historyLoading } = useQuery({
    queryKey: ['bankDeposits', filterStartDate, filterEndDate],
    queryFn: async () => {
      const res = await api.get('/bank-deposits', {
        params: {
          fromDate: filterStartDate || undefined,
          toDate: filterEndDate || undefined,
        }
      });
      return res.data;
    }
  });

  const totalDepositAmount = deposits.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/bank-deposits', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDeposits'] });
      toast.success('Bank Deposit saved successfully!');
      setAmount('');
      setDepositType('BANK');
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(`Failed to save bank deposit: ${err.message}`);
    }
  });

  const handleSave = () => {
    if (!amount) {
      toast.error('Please enter the amount');
      return;
    }
    createMutation.mutate({
      date: depositDate,
      amount: Number(amount),
      depositType: depositType
    });
  };

  const setQuickDate = (type: 'today' | 'thisMonth' | 'all') => {
    const now = new Date();
    if (type === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setFilterStartDate(todayStr);
      setFilterEndDate(todayStr);
    } else if (type === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      setFilterStartDate(start);
      setFilterEndDate(end);
    } else {
      setFilterStartDate('');
      setFilterEndDate('');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bank-deposits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDeposits'] });
      toast.success('Deposit deleted successfully');
    },
    onError: (err: any) => {
      toast.error('Failed to delete deposit');
      console.error(err);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this deposit?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col font-sans overflow-hidden z-10">
      
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 flex items-center justify-between z-10 shadow-sm relative h-[60px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 flex items-center justify-center rounded-lg shadow-inner">
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 tracking-wide uppercase">BANK DEPOSIT ENTRY</h2>
            <p className="text-[11px] text-gray-500 font-medium">Record and manage bank deposits</p>
          </div>
        </div>
      </div>

      {/* Main Content split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: Entry Form */}
        <div className="w-full md:w-[350px] lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 relative z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="p-4 bg-gray-50/50 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <PlusSquare className="w-4 h-4 text-blue-600" /> NEW DEPOSIT
            </h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold bg-white"
              />
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">Deposit Type</label>
              <select
                value={depositType}
                onChange={(e) => setDepositType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold bg-white"
              >
                <option value="BANK">BANK</option>
                <option value="ATM MACHINE">ATM MACHINE</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">{settings?.currencySymbol || 'RM'}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow transition-colors flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? 'Saving...' : 'SAVE DEPOSIT'}
            </button>
          </div>
        </div>

        {/* Right Side: Recent Deposits & Filters */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          {/* Quick Filters */}
          <div className="p-3 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setQuickDate('today')} className="px-3 py-1 bg-white border border-gray-300 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">Today</button>
              <button onClick={() => setQuickDate('thisMonth')} className="px-3 py-1 bg-white border border-gray-300 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">This Month</button>
              <button onClick={() => setQuickDate('all')} className="px-3 py-1 bg-white border border-gray-300 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">All Time</button>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="p-1.5 border border-gray-300 rounded text-[11px] font-bold" title="From Date" />
              <span className="text-gray-400 font-medium text-[11px]">to</span>
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="p-1.5 border border-gray-300 rounded text-[11px] font-bold" title="To Date" />
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" /> DEPOSIT HISTORY
                </h3>
                <span className="text-xs font-bold text-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{deposits.length} Records</span>
              </div>
              
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#1E293B] text-white sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#334155] w-12 text-center">#</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#334155]">Date</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#334155]">Type</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#334155] text-right">Amount</th>
                      <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr><td colSpan={5} className="p-0"><TableLoader columns={5} /></td></tr>
                    ) : deposits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-gray-500 font-bold bg-gray-50/50">
                          <div className="flex flex-col items-center justify-center">
                            <Briefcase className="w-8 h-8 text-gray-300 mb-2" />
                            No deposits found for selected criteria.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      deposits.map((dep: any, idx: number) => (
                        <tr key={dep.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-center text-gray-500 border-r border-gray-100 text-xs font-bold">{idx + 1}</td>
                          <td className="p-3 border-r border-gray-100 text-gray-800 font-bold">{new Date(dep.date).toLocaleDateString()}</td>
                          <td className="p-3 border-r border-gray-100 text-gray-700">
                            <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-1 rounded font-bold uppercase border border-gray-200">
                              {dep.depositType}
                            </span>
                          </td>
                          <td className="p-3 border-r border-gray-100 text-right text-black font-bold text-[15px]">
                            {formatCurrency(dep.amount)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDelete(dep.id)}
                              className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete Deposit"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Summary Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
                <span className="font-bold text-[13px] text-gray-600 uppercase">Total Deposits</span>
                <span className="font-bold text-[18px] text-blue-600">{formatCurrency(totalDepositAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDepositEntry;
