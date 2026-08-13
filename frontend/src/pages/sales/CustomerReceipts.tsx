import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, Filter, FileText, Maximize2, Minimize2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

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
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters for History Table
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [unpaidBills, setUnpaidBills] = useState<any[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [billFilter, setBillFilter] = useState<'Unpaid' | 'Cleared' | 'All'>('Unpaid');

  const { register, control, handleSubmit, watch, setValue, reset, } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema) as any,
    defaultValues: {
      receiptNo: 'Generating...',
      date: new Date().toISOString().split('T')[0],
      customerId: 0,
      amount: '' as any,
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
          setTotalSalesReturns(res.data.totalReturns || 0);
          
          const billsRes = await api.get(`/customer-receipts/unpaid-bills/${selectedCustomerId}`);
          setUnpaidBills(billsRes.data);
        } catch (error) {
          console.error(error);
          setCurrentBalance(0);
          setTotalSalesReturns(0);
          setUnpaidBills([]);
        }
      } else {
        setCurrentBalance(0);
        setTotalSalesReturns(0);
        setUnpaidBills([]);
        setShowBreakdown(false);
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

  const handleExportExcel = () => {
    const exportData = filteredHistory.map((r: any) => ({
      'Receipt No': r.receiptNo,
      'Date': new Date(r.date).toISOString().split('T')[0],
      'Customer': r.customer?.name || 'Unknown',
      'Payment Mode': r.paymentMode?.name || 'Unknown',
      'Amount Collected': r.amount,
      'Reference': r.reference || '',
      'Remarks': r.remarks || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipts History");
    XLSX.writeFile(wb, "Customer_Receipts_History.xlsx");
  };

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
          <button type="button" onClick={() => navigate('/sales')} className="bg-[#EFF6FF] text-[#2563EB] font-bold text-[13px] px-4 py-2 rounded border border-[#BFDBFE] hover:bg-[#DBEAFE] flex items-center gap-1 transition-colors">
            Sales Hub
          </button>
          <button type="button" onClick={() => navigate(-1)} className="bg-[#FEF2F2] text-[#E11D48] font-bold text-[13px] px-4 py-2 rounded border border-[#FECDD3] hover:bg-[#FFE4E6] flex items-center gap-1 transition-colors">
            <X size={14} /> Close
          </button>
        </div>
      </div>

      {/* Dark overlay when expanded */}
      {isTableExpanded && <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={() => setIsTableExpanded(false)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - New Entry Form */}
        <div className={`bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden ${isTableExpanded ? 'hidden' : 'block'}`}>
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-2">
            <FileText size={16} className="text-[#334155]" />
            <h2 className="font-bold text-[13px] text-[#1E293B]">NEW RECEIPT ENTRY</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit as any)} className="p-4 flex flex-col gap-4">
            
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
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: 0, label: 'Type customer name / mobile number...' },
                      ...customers.map((c: any) => ({
                        value: c.id,
                        label: `${c.name} - ${c.phone || 'No Phone'}`
                      }))
                    ]}
                    value={field.value ? { value: field.value, label: customers.find((c: any) => c.id === field.value)?.name || 'Select...' } : null}
                    onChange={(val: any) => field.onChange(val?.value || 0)}
                    className="text-[13px] font-medium"
                    styles={{
                      control: (base: any) => ({
                        ...base,
                        minHeight: '38px',
                        borderColor: '#CBD5E1',
                        borderRadius: '0.25rem',
                      }),
                      singleValue: (base: any) => ({
                        ...base,
                        color: '#000000', // Dark black as requested
                        fontWeight: 'bold',
                      }),
                      input: (base: any) => ({
                        ...base,
                        color: '#000000',
                      }),
                      option: (base: any, state: any) => ({
                        ...base,
                        color: state.isSelected ? '#ffffff' : '#000000',
                        backgroundColor: state.isSelected ? '#3B82F6' : base.backgroundColor,
                      })
                    }}
                  />
                )}
              />
            </div>

            {selectedCustomerId > 0 && (
              <div className="flex flex-col gap-3">
                <div className="border border-[#CBD5E1] rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#CBD5E1] flex justify-between items-center">
                    <span className="text-[13px] font-bold text-[#334155] flex items-center gap-2">
                      <FileText size={16} className="text-[#64748B]" /> Outstanding Summary
                    </span>
                    <button 
                      type="button"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="border border-[#059669] text-[#059669] bg-white px-3 py-1.5 rounded font-bold text-[12px] hover:bg-[#ECFDF5] flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      Bill-by-Bill Breakdown
                    </button>
                  </div>
                  
                  <div className="p-4 flex flex-col gap-3">
                    {/* Removed Total Amount Bal and Sales Return summaries as per user request */}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] font-bold text-[#1E293B]">Over All Outstanding Balance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-[#059669]">
                          {formatCurrency(currentBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {showBreakdown && (
                  <div className="border border-[#10B981] rounded-lg overflow-hidden bg-white">
                    <div className="bg-[#10B981] text-white px-3 py-2 flex justify-between items-center text-[12px] font-bold flex-wrap gap-2">
                      <div className="flex items-center gap-2"><FileText size={14} /> BILL-BY-BILL BREAKDOWN</div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={billFilter}
                          onChange={(e: any) => setBillFilter(e.target.value)}
                          className="text-[#10B981] bg-white rounded px-2 py-0.5 outline-none text-[10px]"
                        >
                          <option value="Unpaid">Unpaid Bills</option>
                          <option value="Cleared">Cleared Bills</option>
                          <option value="All">All Bills</option>
                        </select>
                        <span className="bg-white text-[#10B981] px-2 py-0.5 rounded-full text-[10px]">
                          {unpaidBills.filter(b => billFilter === 'All' ? true : billFilter === 'Cleared' ? b.pending === 0 : b.pending > 0).length} Bills
                        </span>
                      </div>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto overflow-x-auto">
                      <table className="w-full text-left text-[12px] whitespace-nowrap">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0">
                          <tr>
                            <th className="px-3 py-2 font-bold text-[#334155]">Entry / Inv No</th>
                            <th className="px-3 py-2 font-bold text-[#334155]">Bill Date</th>
                            <th className="px-3 py-2 font-bold text-[#334155] text-right">Bill Total</th>
                            <th className="px-3 py-2 font-bold text-[#E11D48] text-right">Sales Returns</th>
                            <th className="px-3 py-2 font-bold text-[#334155] text-right">Received Amount</th>
                            <th className="px-3 py-2 font-bold text-[#059669] text-right">Pending Balance</th>
                            <th className="px-3 py-2 font-bold text-[#3B82F6] text-right">Paying Now</th>
                            <th className="px-3 py-2 font-bold text-[#059669] text-right">Balance After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            let remainingForBills = amountCollected;
                            const displayedBills = unpaidBills.filter(b => billFilter === 'All' ? true : billFilter === 'Cleared' ? b.pending === 0 : b.pending > 0);
                            
                            return displayedBills.length > 0 ? displayedBills.map((bill, idx) => {
                              const currentPending = bill.pending;
                              const payingNow = currentPending > 0 ? Math.min(currentPending, remainingForBills) : 0;
                              remainingForBills = Math.max(0, remainingForBills - payingNow);
                              const balanceAfter = currentPending - payingNow;
                              const isCleared = currentPending === 0;
                              
                              return (
                                <tr key={idx} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] ${isCleared ? 'bg-[#ECFDF5]' : ''}`}>
                                  <td className="px-3 py-2 font-bold text-[#1E293B]">
                                    {bill.entryNo}
                                  </td>
                                  <td className="px-3 py-2 text-[#475569]">{new Date(bill.date).toISOString().split('T')[0]}</td>
                                  <td className="px-3 py-2 text-right text-[#475569]">{formatCurrency(bill.total)}</td>
                                  <td className="px-3 py-2 text-right text-[#E11D48]">{formatCurrency(bill.returned || 0)}</td>
                                  <td className="px-3 py-2 text-right text-[#10B981]">{formatCurrency(bill.received)}</td>
                                  <td className="px-3 py-2 text-right font-bold text-[#059669]">{formatCurrency(bill.pending)}</td>
                                  <td className="px-3 py-2 text-right font-bold text-[#3B82F6]">{formatCurrency(payingNow)}</td>
                                  <td className="px-3 py-2 text-right font-bold text-[#059669]">{formatCurrency(balanceAfter)}</td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan={8} className="px-3 py-4 text-center text-[#64748B] italic">No {billFilter.toLowerCase()} bills found.</td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#059669] mb-1">Amount Collected Now *</label>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[15px] font-bold outline-none focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#64748B] mb-1">Remaining Balance After Receipt</label>
                <div className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[13px] font-bold text-[#1E293B]">
                  {formatCurrency(currentBalance - amountCollected)}
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
        <div className={`bg-white border border-[#E2E8F0] shadow-sm flex flex-col ${isTableExpanded ? 'fixed inset-4 lg:inset-8 z-50 rounded-xl shadow-2xl' : 'rounded-lg overflow-hidden lg:col-span-1'}`}>
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#334155]" />
              <h2 className="font-bold text-[13px] text-[#1E293B]">RECEIPTS HISTORY</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#059669] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {filteredHistory.length} Receipts
              </div>
              <button 
                type="button" 
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="text-[#64748B] hover:text-[#059669] transition-colors ml-1"
                title={isTableExpanded ? "Minimize Table" : "View Full Table"}
              >
                {isTableExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
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
              <button type="button" className="bg-[#059669] hover:bg-[#047857] text-white px-3 rounded flex items-center justify-center transition-colors" title="Apply Filter">
                <Filter size={14} />
              </button>
              {isTableExpanded && (
                <button 
                  type="button" 
                  onClick={handleExportExcel}
                  className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-3 rounded flex items-center justify-center transition-colors" 
                  title="Export Excel"
                >
                  <Download size={14} />
                </button>
              )}
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
                      <td className="px-3 py-2 text-right font-bold text-[#059669]">{formatCurrency(r.amount)}</td>
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
