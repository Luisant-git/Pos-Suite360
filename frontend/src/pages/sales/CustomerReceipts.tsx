import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Save, X, RotateCcw, Filter, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const receiptSchema = z.object({
  receiptNo: z.string(),
  date: z.string(),
  customerId: z.coerce.number().min(1, 'Customer is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentModeId: z.coerce.number().min(1, 'Payment Mode is required'),
  reference: z.string().optional(),
  remarks: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

const CustomerReceipts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters for History Table
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receiptNo: 'Generating...',
      date: new Date().toISOString().split('T')[0],
      customerId: 0,
      amount: 0,
      paymentModeId: 0,
      reference: '',
      remarks: '',
    }
  });

  const selectedCustomerId = watch('customerId');
  const amountCollected = watch('amount') || 0;

  // Master Data
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: async () => (await api.get('/customers')).data });
  const { data: paymentModes = [] } = useQuery({ queryKey: ['paymentModes'], queryFn: async () => (await api.get('/payment-modes')).data });
  const { data: nextReceiptNoData } = useQuery({ queryKey: ['nextReceiptNo'], queryFn: async () => (await api.get('/customer-receipts/next-receipt-no')).data });
  
  // History Data
  const { data: receipts = [], isLoading: historyLoading } = useQuery({
    queryKey: ['customerReceipts'],
    queryFn: async () => (await api.get('/customer-receipts')).data
  });

  useEffect(() => {
    if (nextReceiptNoData?.receiptNo) {
      setValue('receiptNo', nextReceiptNoData.receiptNo);
    }
  }, [nextReceiptNoData, setValue]);

  // Fetch balance dynamically when customer changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (selectedCustomerId && selectedCustomerId > 0) {
        try {
          const res = await api.get(`/customer-receipts/balance/${selectedCustomerId}`);
          setCurrentBalance(res.data.balance);
        } catch (error) {
          console.error(error);
          setCurrentBalance(0);
        }
      } else {
        setCurrentBalance(0);
      }
    };
    fetchBalance();
  }, [selectedCustomerId]);

  const createMutation = useMutation({
    mutationFn: (data: ReceiptFormValues) => api.post('/customer-receipts', data),
    onSuccess: () => {
      toast.success('Receipt recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['customerReceipts'] });
      queryClient.invalidateQueries({ queryKey: ['nextReceiptNo'] });
      reset();
      setCurrentBalance(0);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to record receipt. Please check your inputs.');
    }
  });

  const onSubmit = (data: ReceiptFormValues) => {
    createMutation.mutate(data);
  };

  // Filter history
  const filteredHistory = receipts.filter((r: any) => {
    if (filterCustomer && r.customerId.toString() !== filterCustomer) return false;
    if (filterFromDate && new Date(r.date) < new Date(filterFromDate)) return false;
    if (filterToDate && new Date(r.date) > new Date(filterToDate)) return false;
    return true;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-64px)] p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#059669] flex items-center gap-2">
            <span className="bg-[#059669] text-white p-1 rounded"><FileText size={16} /></span>
            CUSTOMER COLLECTION RECEIPTS
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">Record customer credit collections and payment receipts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/sales')} className="bg-[#EFF6FF] text-[#2563EB] font-bold text-[13px] px-4 py-2 rounded border border-[#BFDBFE] hover:bg-[#DBEAFE] flex items-center gap-1 transition-colors">
            Sales Hub
          </button>
          <button onClick={() => navigate(-1)} className="bg-[#FEF2F2] text-[#E11D48] font-bold text-[13px] px-4 py-2 rounded border border-[#FECDD3] hover:bg-[#FFE4E6] flex items-center gap-1 transition-colors">
            <X size={14} /> Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - New Entry Form */}
        <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-2">
            <FileText size={16} className="text-[#334155]" />
            <h2 className="font-bold text-[13px] text-[#1E293B]">NEW RECEIPT ENTRY</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Receipt No</label>
                <input
                  {...register('receiptNo')}
                  readOnly
                  className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[13px] font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Receipt Date *</label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#2563EB] mb-1">Customer Name (Searchable) *</label>
              <select
                {...register('customerId')}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] font-medium outline-none focus:border-[#3B82F6]"
              >
                <option value={0}>Type customer name / mobile number...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.phone || 'No Phone'}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#059669] mb-1">Amount Collected Now *</label>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[15px] font-bold outline-none focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] mb-1">Remaining Balance After Receipt</label>
                <div className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[13px] font-bold text-[#1E293B]">
                  ₹ {(currentBalance - amountCollected).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Payment Mode *</label>
                <select
                  {...register('paymentModeId')}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                >
                  <option value={0}>Select Mode</option>
                  {paymentModes.map((pm: any) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Reference / Cheque No (Optional for Cash)</label>
                <input
                  {...register('reference')}
                  type="text"
                  placeholder="Optional for Cash / Mandatory for UPI/Cheque..."
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">Remarks (Optional)</label>
              <input
                {...register('remarks')}
                type="text"
                placeholder="Optional remarks..."
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-[#059669] hover:bg-[#047857] text-white px-6 py-2.5 rounded font-bold text-[14px] flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={16} /> SAVE RECEIPT (F10)
              </button>
            </div>

          </form>
        </div>

        {/* Right Side - History Table */}
        <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden flex flex-col">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#334155]" />
              <h2 className="font-bold text-[13px] text-[#1E293B]">RECEIPTS HISTORY</h2>
            </div>
            <div className="bg-[#059669] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {filteredHistory.length} Receipts
            </div>
          </div>

          <div className="p-3 border-b border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] outline-none focus:border-[#3B82F6]"
            >
              <option value="">-- All Customers --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] outline-none focus:border-[#3B82F6]"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] outline-none focus:border-[#3B82F6]"
              />
              <button className="bg-[#059669] hover:bg-[#047857] text-white px-3 rounded flex items-center justify-center transition-colors">
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#F8FAFC]">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead>
                <tr className="bg-[#1E293B] text-white font-bold">
                  <th className="px-3 py-2 border-r border-[#334155]">Receipt No</th>
                  <th className="px-3 py-2 border-r border-[#334155]">Date</th>
                  <th className="px-3 py-2 border-r border-[#334155]">Customer</th>
                  <th className="px-3 py-2 border-r border-[#334155]">Mode</th>
                  <th className="px-3 py-2 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr><td colSpan={5} className="text-center p-4 text-gray-500">Loading history...</td></tr>
                ) : filteredHistory.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-4 text-gray-500">No receipt records found.</td></tr>
                ) : (
                  filteredHistory.map((r: any, idx: number) => (
                    <tr key={r.id} className={`border-b border-[#E2E8F0] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] font-bold text-[#059669]">{r.receiptNo}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] text-[#64748B]">{new Date(r.date).toISOString().split('T')[0]}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] font-medium text-[#334155]">{r.customer?.name}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0]">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.paymentMode?.name?.includes('Return') ? 'bg-[#F59E0B] text-white' : 'bg-[#64748B] text-white'
                        }`}>
                          {r.paymentMode?.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-[#059669]">RM {Number(r.amount).toFixed(2)}</td>
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

export default CustomerReceipts;
