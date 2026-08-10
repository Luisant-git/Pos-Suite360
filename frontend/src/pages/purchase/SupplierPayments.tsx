import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, Filter, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

const paymentSchema = z.object({
  paymentNo: z.string(),
  date: z.string(),
  supplierId: z.coerce.number().min(1, 'Supplier is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentModeId: z.coerce.number().min(1, 'Payment Mode is required'),
  reference: z.string().optional(),
  remarks: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const SupplierPayments = () => {
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters for History Table
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [unpaidBills, setUnpaidBills] = useState<any[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      paymentNo: 'Generating...',
      date: new Date().toISOString().split('T')[0],
      supplierId: 0,
      amount: 0,
      paymentModeId: 0,
      reference: '',
      remarks: '',
    }
  });

  const selectedSupplierId = watch('supplierId');
  const amountToPay = watch('amount') || 0;

  // Master Data
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await api.get('/suppliers')).data });
  const { data: paymentModes = [] } = useQuery({ queryKey: ['paymentModes'], queryFn: async () => (await api.get('/payment-modes')).data });
  const { data: nextPaymentNoData } = useQuery({ queryKey: ['nextPaymentNo'], queryFn: async () => (await api.get('/supplier-payments/next-payment-no')).data });
  
  // History Data
  const { data: payments = [], isLoading: historyLoading } = useQuery({
    queryKey: ['supplierPayments'],
    queryFn: async () => (await api.get('/supplier-payments')).data
  });

  useEffect(() => {
    if (nextPaymentNoData?.paymentNo) {
      setValue('paymentNo', nextPaymentNoData.paymentNo);
    }
  }, [nextPaymentNoData, setValue]);

  // Fetch balance dynamically when supplier changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (selectedSupplierId && selectedSupplierId > 0) {
        try {
          const res = await api.get(`/supplier-payments/balance/${selectedSupplierId}`);
          setCurrentBalance(res.data.balance);
          
          const billsRes = await api.get(`/supplier-payments/unpaid-bills/${selectedSupplierId}`);
          setUnpaidBills(billsRes.data);
        } catch (error) {
          console.error(error);
          setCurrentBalance(0);
          setUnpaidBills([]);
        }
      } else {
        setCurrentBalance(0);
        setUnpaidBills([]);
        setShowBreakdown(false);
      }
    };
    fetchBalance();
  }, [selectedSupplierId]);

  const createMutation = useMutation({
    mutationFn: (data: PaymentFormValues) => api.post('/supplier-payments', data),
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['supplierPayments'] });
      queryClient.invalidateQueries({ queryKey: ['nextPaymentNo'] });
      reset();
      setCurrentBalance(0);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to record payment. Please check your inputs.');
    }
  });

  const onSubmit = (data: PaymentFormValues) => {
    createMutation.mutate(data);
  };

  // Filter history
  const filteredHistory = payments.filter((p: any) => {
    if (filterSupplier && p.supplierId.toString() !== filterSupplier) return false;
    if (filterFromDate && new Date(p.date) < new Date(filterFromDate)) return false;
    if (filterToDate && new Date(p.date) > new Date(filterToDate)) return false;
    return true;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-64px)] p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#E11D48] flex items-center gap-2">
            <span className="bg-[#E11D48] text-white p-1 rounded"><FileText size={16} /></span>
            SUPPLIER PAYMENTS & PAYOUTS
          </h1>
          <p className="text-[12px] text-gray-500 mt-1">Record vendor credit payouts and supplier payments</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/purchase')} className="bg-[#EFF6FF] text-[#2563EB] font-bold text-[13px] px-4 py-2 rounded border border-[#BFDBFE] hover:bg-[#DBEAFE] flex items-center gap-1 transition-colors">
            Purchase Hub
          </button>
          <button type="button" onClick={() => navigate(-1)} className="bg-[#FEF2F2] text-[#E11D48] font-bold text-[13px] px-4 py-2 rounded border border-[#FECDD3] hover:bg-[#FFE4E6] flex items-center gap-1 transition-colors">
            <X size={14} /> Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - New Entry Form */}
        <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-2">
            <FileText size={16} className="text-[#334155]" />
            <h2 className="font-bold text-[13px] text-[#1E293B]">NEW SUPPLIER PAYMENT ENTRY</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit as any)} className="p-4 flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Payment No</label>
                <input
                  {...register('paymentNo')}
                  readOnly
                  className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[13px] font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Payment Date *</label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#2563EB] mb-1">Supplier Name (Searchable) *</label>
              <select
                {...register('supplierId')}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] font-medium outline-none focus:border-[#3B82F6]"
              >
                <option value={0}>Type supplier name / mobile number...</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.phone || 'No Phone'}</option>
                ))}
              </select>
            </div>

            {selectedSupplierId > 0 && (
              <div className="flex flex-col gap-3">
                <div className="border border-[#CBD5E1] rounded-lg p-3 flex justify-between items-center bg-white">
                  <div className="text-[13px] font-bold text-[#475569]">
                    Over All Outstanding Balance: <span className="text-[#E11D48] text-[15px]">{formatCurrency(currentBalance)}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="border-2 border-[#E11D48] text-[#E11D48] px-3 py-1.5 rounded font-bold text-[13px] hover:bg-[#FFF1F2] flex items-center gap-2 transition-colors"
                  >
                    <FileText size={14} /> Bill-by-Bill Breakdown
                  </button>
                </div>

                {showBreakdown && (
                  <div className="border border-[#E11D48] rounded-lg overflow-hidden bg-white">
                    <div className="bg-[#E11D48] text-white px-3 py-2 flex justify-between items-center text-[12px] font-bold">
                      <div className="flex items-center gap-2"><FileText size={14} /> BILL-BY-BILL OUTSTANDING BREAKDOWN</div>
                      <span className="bg-white text-[#E11D48] px-2 py-0.5 rounded-full text-[10px]">{unpaidBills.length} Bills</span>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0">
                          <tr>
                            <th className="px-3 py-2 font-bold text-[#334155]">Entry / Inv No</th>
                            <th className="px-3 py-2 font-bold text-[#334155]">Bill Date</th>
                            <th className="px-3 py-2 font-bold text-[#334155] text-right">Bill Total</th>
                            <th className="px-3 py-2 font-bold text-[#334155] text-right">Paid Amount</th>
                            <th className="px-3 py-2 font-bold text-[#E11D48] text-right">Pending Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unpaidBills.length > 0 ? unpaidBills.map((bill, idx) => (
                            <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                              <td className="px-3 py-2 font-bold text-[#1E293B]">{bill.entryNo}</td>
                              <td className="px-3 py-2 text-[#475569]">{new Date(bill.date).toISOString().split('T')[0]}</td>
                              <td className="px-3 py-2 text-right text-[#475569]">{formatCurrency(bill.total)}</td>
                              <td className="px-3 py-2 text-right text-[#10B981]">{formatCurrency(bill.received)}</td>
                              <td className="px-3 py-2 text-right font-bold text-[#E11D48]">{formatCurrency(bill.pending)}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-[#64748B] italic">No outstanding bills found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#E11D48] mb-1">Amount Pay Now *</label>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[15px] font-bold outline-none focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] mb-1">Remaining Balance After Payment</label>
                <div className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[13px] font-bold text-[#1E293B]">
                  {formatCurrency(currentBalance - amountToPay)}
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
                className="bg-[#E11D48] hover:bg-[#BE123C] text-white px-6 py-2.5 rounded font-bold text-[14px] flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={16} /> SAVE PAYMENT (F10)
              </button>
            </div>

          </form>
        </div>

        {/* Right Side - History Table */}
        <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden flex flex-col">
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#334155]" />
              <h2 className="font-bold text-[13px] text-[#1E293B]">PAYMENTS HISTORY</h2>
            </div>
            <div className="bg-[#E11D48] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {filteredHistory.length} Payments
            </div>
          </div>

          <div className="p-3 border-b border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[12px] outline-none focus:border-[#3B82F6]"
            >
              <option value="">-- All Suppliers --</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
              <button type="button" className="bg-[#E11D48] hover:bg-[#BE123C] text-white px-3 rounded flex items-center justify-center transition-colors">
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#F8FAFC]">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead>
                <tr className="bg-[#1E293B] text-white font-bold">
                  <th className="px-3 py-2 border-r border-[#334155]">Payment No</th>
                  <th className="px-3 py-2 border-r border-[#334155]">Date</th>
                  <th className="px-3 py-2 border-r border-[#334155]">Supplier</th>
                  <th className="px-3 py-2 border-r border-[#334155]">Mode</th>
                  <th className="px-3 py-2 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr><td colSpan={5} className="text-center p-4 text-gray-500">Loading history...</td></tr>
                ) : filteredHistory.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-4 text-gray-500">No payment records found.</td></tr>
                ) : (
                  filteredHistory.map((p: any, idx: number) => (
                    <tr key={p.id} className={`border-b border-[#E2E8F0] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] font-bold text-[#E11D48]">{p.paymentNo}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] text-[#64748B]">{new Date(p.date).toISOString().split('T')[0]}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] font-medium text-[#334155]">{p.supplier?.name}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0]">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.paymentMode?.name?.includes('Return') ? 'bg-[#F59E0B] text-white' : 'bg-[#64748B] text-white'
                        }`}>
                          {p.paymentMode?.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-[#E11D48]">{formatCurrency(p.amount)}</td>
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

export default SupplierPayments;
