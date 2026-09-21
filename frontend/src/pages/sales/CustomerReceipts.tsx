import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, Filter, FileText, Maximize2, Minimize2, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import TableLoader from '../../components/TableLoader';

const receiptSchema = z.object({
  receiptNo: z.string(),
  date: z.string(),
  customerId: z.coerce.number().min(1, 'Customer is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentTypeId: z.coerce.number().min(1, 'Payment Type is required'),
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
  const [billFilter, setBillFilter] = useState<'Unpaid' | 'Paid' | 'All'>('Unpaid');
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: storeSettings } = useQuery({ queryKey: ['settings'], queryFn: async () => (await api.get('/settings')).data });

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema) as any,
    defaultValues: {
      receiptNo: 'Generating...',
      date: new Date().toISOString().split('T')[0],
      customerId: 0,
      amount: '' as any,
      paymentTypeId: 0,
      reference: '',
      remarks: '',
    }
  });

  const selectedCustomerId = watch('customerId');
  const amountCollected = watch('amount') || 0;

  // Master Data
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: async () => (await api.get('/customers')).data });
  const { data: paymentTypes = [] } = useQuery({ queryKey: ['paymentTypes'], queryFn: async () => (await api.get('/payment-types')).data });
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
          
          const billsRes = await api.get(`/customer-receipts/unpaid-bills/${selectedCustomerId}`);
          setUnpaidBills(billsRes.data);
        } catch (error) {
          console.error(error);
          setCurrentBalance(0);
          setUnpaidBills([]);
          setAllocations({});
        }
      } else {
        setCurrentBalance(0);
        setUnpaidBills([]);
        setShowBreakdown(false);
        setAllocations({});
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
      setAllocations({});
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to record receipt. Please check your inputs.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, payload: any }) => api.put(`/customer-receipts/${data.id}`, data.payload),
    onSuccess: () => {
      toast.success('Receipt updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customerReceipts'] });
      reset();
      setEditingId(null);
      setCurrentBalance(0);
      setAllocations({});
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to update receipt.');
    }
  });

  const onSubmit = (data: ReceiptFormValues) => {
    const payload = {
      ...data,
      allocations: Object.entries(allocations).map(([saleId, amount]) => ({
        saleId: saleId === 'OB' ? null : saleId,
        amount
      }))
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const onError = (errors: any) => {
    console.error(errors);
    toast.error('Please fill all required fields correctly.');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        handleSubmit(onSubmit as any, onError)();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, onSubmit]);

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
      'Payment Type': r.paymentType?.name || 'Unknown',
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-4 print:hidden">
        <div>
          <h1 className="text-[16px] md:text-xl font-bold text-[#059669] flex items-center gap-2">
            <span className="bg-[#059669] text-white p-1 rounded"><FileText size={16} /></span>
            CUSTOMER COLLECTION RECEIPTS
          </h1>
          <p className="text-[12px] text-black font-bold mt-1">Record customer credit collections and payment receipts</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button type="button" onClick={() => navigate('/sales')} className="bg-[#EFF6FF] text-[#2563EB] font-bold text-[13px] px-4 py-2 rounded border border-[#BFDBFE] hover:bg-[#DBEAFE] flex items-center gap-1 transition-colors flex-1 md:flex-none justify-center">
            Sales Hub
          </button>
          <button type="button" onClick={() => navigate(-1)} className="bg-[#FEF2F2] text-[#E11D48] font-bold text-[13px] px-4 py-2 rounded border border-[#FECDD3] hover:bg-[#FFE4E6] flex items-center gap-1 transition-colors flex-1 md:flex-none justify-center">
            <X size={14} /> Close
          </button>
        </div>
      </div>

      {/* Dark overlay when expanded */}
      {isTableExpanded && <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={() => setIsTableExpanded(false)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:flex print:flex-col print:w-full print:block">
        {/* Left Side - New Entry Form */}
        <div className={`bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden ${isTableExpanded ? 'hidden' : 'block'} print:border-none print:shadow-none print:w-full`}>
          <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-2 print:hidden">
            <FileText size={16} className="text-black font-bold" />
            <h2 className="font-bold text-[13px] text-black font-bold">{editingId ? 'EDIT RECEIPT ENTRY' : 'NEW RECEIPT ENTRY'}</h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit as any, onError)} className="p-4 flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              <div>
                <label className="block text-[12px] font-bold text-black font-bold mb-1">Receipt No</label>
                <input
                  {...register('receiptNo')}
                  readOnly
                  className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[13px] font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-black font-bold mb-1">Receipt Date *</label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div className="print:hidden">
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
                    className="text-[13px] font-bold"
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
                <div className="border border-[#CBD5E1] rounded-lg overflow-hidden bg-white shadow-sm print:hidden">
                  <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#CBD5E1] flex justify-between items-center">
                    <span className="text-[13px] font-bold text-black font-bold flex items-center gap-2">
                      <FileText size={16} className="text-black font-bold" /> Outstanding Summary
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
                      <span className="text-[14px] font-bold text-black font-bold">Over All Outstanding Balance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-[#059669]">
                          {formatCurrency(currentBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {showBreakdown && (
                  <div className="border border-[#10B981] rounded-lg overflow-hidden bg-white print:border-none print:shadow-none print:m-0 print:w-full">
                    
                    {/* Print Only Header for Context */}
                    <div className="hidden print:block mb-4 text-black border-b border-black pb-2">
                      <h2 className="text-xl font-bold uppercase">Customer: {customers.find((c: any) => c.id === selectedCustomerId)?.name}</h2>
                      <p className="text-sm font-bold">Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="bg-[#10B981] text-white px-3 py-2 flex justify-between items-center text-[12px] font-bold flex-wrap gap-2 print:text-black print:bg-white print:border-b print:border-black print:px-0">
                      <div className="flex items-center gap-2"><FileText size={14} className="print:hidden" /> BILL-BY-BILL BREAKDOWN</div>
                      <div className="flex items-center gap-2 print:hidden">
                        <select 
                          value={billFilter}
                          onChange={(e: any) => setBillFilter(e.target.value)}
                          className="text-[#10B981] bg-white rounded px-2 py-0.5 outline-none text-[10px]"
                        >
                          <option value="Unpaid">Unpaid Bills</option>
                          <option value="Paid">Paid Bills</option>
                          <option value="All">All Bills</option>
                        </select>
                        <span className="bg-white text-[#10B981] px-2 py-0.5 rounded-full text-[10px]">
                          {unpaidBills.filter(b => billFilter === 'All' ? true : billFilter === 'Paid' ? b.pending < 0.01 : b.pending >= 0.01).length} Bills
                        </span>
                        <button 
                          type="button" 
                          onClick={() => window.print()}
                          className="bg-white text-[#10B981] hover:bg-gray-100 p-1 rounded transition-colors"
                          title="Print Breakdown"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[250px] overflow-y-auto overflow-x-auto print:max-h-none print:overflow-visible">
                      <table className="w-full text-left text-[12px] whitespace-nowrap">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0">
                          <tr>
                            <th className="px-3 py-2 font-bold text-black font-bold">Entry / Inv No</th>
                            <th className="px-3 py-2 font-bold text-black font-bold">Bill Date</th>
                            <th className="px-3 py-2 font-bold text-black font-bold text-right">Bill Total</th>
                            <th className="px-3 py-2 font-bold text-[#E11D48] text-right">Sales Returns</th>
                            <th className="px-3 py-2 font-bold text-black font-bold text-right">Received Amount</th>
                            <th className="px-3 py-2 font-bold text-[#059669] text-right">Pending Balance</th>
                            <th className="px-3 py-2 font-bold text-[#3B82F6] text-right print:hidden">Paying Now</th>
                            <th className="px-3 py-2 font-bold text-[#059669] text-right print:hidden">Balance After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const displayedBills = unpaidBills.filter(b => billFilter === 'All' ? true : billFilter === 'Paid' ? b.pending < 0.01 : b.pending >= 0.01);
                            
                            return displayedBills.length > 0 ? displayedBills.map((bill, idx) => {
                              const currentPending = bill.pending;
                              const payingNow = allocations[bill.id] || 0;
                              const balanceAfter = currentPending - payingNow;
                              const isCleared = currentPending === 0;
                              
                              return (
                                <tr key={bill.id || idx} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] ${isCleared ? 'bg-[#ECFDF5]' : ''}`}>
                                  <td className="px-3 py-2 font-bold text-black font-bold">
                                    {bill.entryNo}
                                  </td>
                                  <td className="px-3 py-2 text-black font-bold">{new Date(bill.date).toISOString().split('T')[0]}</td>
                                  <td className="px-3 py-2 text-right text-black font-bold">{formatCurrency(bill.total)}</td>
                                  <td className="px-3 py-2 text-right text-[#E11D48]">{formatCurrency(bill.returned || 0)}</td>
                                  <td className="px-3 py-2 text-right text-[#10B981]">{formatCurrency(bill.received)}</td>
                                  <td className="px-3 py-2 text-right font-bold text-[#059669]">{formatCurrency(bill.pending)}</td>
                                  <td className="px-2 py-1 text-right print:hidden">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max={currentPending}
                                      value={allocations[bill.id] || ''}
                                      disabled={isCleared}
                                      onChange={(e) => {
                                        let val = parseFloat(e.target.value);
                                        if (isNaN(val)) val = 0;
                                        if (val > currentPending) val = currentPending;
                                        const newAllocations = { ...allocations, [bill.id]: val };
                                        setAllocations(newAllocations);
                                        const newTotal = (Object.values(newAllocations) as number[]).reduce((sum: number, curr: number) => sum + (curr || 0), 0);
                                        setValue('amount', newTotal as any, { shouldValidate: true });
                                      }}
                                      placeholder="0.00"
                                      className={`w-[100px] text-right px-2 py-1 border rounded text-[13px] font-bold outline-none focus:border-[#059669] ${payingNow > 0 ? 'bg-[#ECFDF5] border-[#059669] text-[#059669]' : 'bg-white border-[#CBD5E1]'}`}
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-[#059669] print:hidden">{formatCurrency(balanceAfter)}</td>
                                </tr>
                              );
                            }) : (
                              <TableLoader columns={8} />
                ) : filteredHistory.length === 0 ? (
                  <tr><td colSpan={storeSettings?.allowEditReceipts ? 6 : 5} className="text-center p-4 text-black font-bold">No receipt records found.</td></tr>
                ) : (
                  filteredHistory.map((r: any, idx: number) => (
                    <tr key={r.id} className={`border-b border-[#E2E8F0] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] font-bold text-[#059669]">{r.receiptNo}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] text-black font-bold">{new Date(r.date).toISOString().split('T')[0]}</td>
                      <td className="px-3 py-2 border-r border-[#E2E8F0] font-bold text-black font-bold">{r.customer?.name}</td>
                      <td className="px-3 py-3 border-r border-[#E5E7EB] text-black font-bold">{r.paymentType?.name || r.paymentMode?.name || '-'}</td>
                      <td className="px-3 py-2 text-right font-bold text-[#059669]">{formatCurrency(r.amount)}</td>
                      {storeSettings?.allowEditReceipts && (
                        <td className="px-3 py-2 text-center border-l border-[#E2E8F0]">
                          <button
                            type="button"
                            onClick={() => {
                              reset({
                                receiptNo: r.receiptNo,
                                date: new Date(r.date).toISOString().split('T')[0],
                                customerId: r.customerId,
                                amount: r.amount,
                                paymentTypeId: r.paymentTypeId || 0,
                                reference: r.reference || '',
                                remarks: r.remarks || '',
                              });
                              setEditingId(r.id);
                              setAllocations({});
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] px-2 py-1 rounded text-[11px] font-bold border border-[#BFDBFE] transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      )}
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
