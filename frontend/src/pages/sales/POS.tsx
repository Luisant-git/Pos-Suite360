import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Save, X, Printer, RefreshCw, List, UserPlus, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import SearchableSelect from '../../components/SearchableSelect';

const saleItemSchema = z.object({
  productId: z.coerce.number().min(1, 'Product is required').or(z.literal(0)),
  quantity: z.coerce.number().min(1, 'Quantity must be > 0'),
  stock: z.coerce.number(),
  rate: z.coerce.number().min(0),
  unit: z.string().optional(),
  discPercent: z.coerce.number().min(0).max(100),
  discAmt: z.coerce.number().min(0),
  total: z.coerce.number(),
});

const saleSchema = z.object({
  customerId: z.coerce.number().min(1, 'Customer is required').or(z.literal(0)),
  invoiceNo: z.string(),
  date: z.string(),
  rateType: z.string(),
  paymentModeId: z.coerce.number().min(1, 'Payment Mode is required').or(z.literal(0)),
  
  grossAmount: z.coerce.number(),
  totalDiscount: z.coerce.number(),
  totalDiscountPercent: z.coerce.number().optional(),
  roundOff: z.coerce.number(),
  netAmount: z.coerce.number(),

  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

const POS = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const activeTab = 'Amount Details';
  
  const { register, control, handleSubmit, watch, setValue, reset } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      invoiceNo: 'Generating...',
      customerId: 0,
      rateType: 'Wholesale Rate',
      paymentModeId: 0,
      items: [{ productId: 0, quantity: 1, stock: 0, rate: 0, unit: 'Nos', discPercent: 0, discAmt: 0, total: 0 }],
      grossAmount: 0,
      totalDiscountPercent: 0,
      totalDiscount: 0,
      roundOff: 0,
      netAmount: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Fetch Masters & Next Invoice
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: async () => (await api.get('/customers')).data });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => (await api.get('/products')).data });
  const { data: paymentModes = [] } = useQuery({ queryKey: ['paymentModes'], queryFn: async () => (await api.get('/payment-modes')).data });
  const { data: nextInvoiceData } = useQuery({ queryKey: ['nextInvoiceNo'], queryFn: async () => (await api.get('/sales/next-invoice-no')).data });

  // Update default invoice no
  useEffect(() => {
    if (nextInvoiceData?.invoiceNo) {
      setValue('invoiceNo', nextInvoiceData.invoiceNo);
    }
  }, [nextInvoiceData, setValue]);

  // Watch values
  const items = watch('items');
  const watchTotalDiscount = watch('totalDiscount');
  const watchRoundOff = watch('roundOff');
  const watchRateType = watch('rateType');
  const selectedCustomerId = watch('customerId');

  const selectedCustomer = customers.find((c: any) => c.id === Number(selectedCustomerId));

  // Calculations
  useEffect(() => {
    let grossAmount = 0;
    
    items.forEach((item, index) => {
      const q = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discPercent = Number(item.discPercent) || 0;
      
      let discAmt = Number(item.discAmt) || 0;
      if (discPercent > 0 && discAmt === 0) {
        discAmt = (rate * q * discPercent) / 100;
        setValue(`items.${index}.discAmt`, Number(discAmt.toFixed(2)));
      }

      const total = (q * rate) - discAmt;
      
      if (item.total !== total) {
        setValue(`items.${index}.total`, Number(total.toFixed(2)), { shouldValidate: false });
      }
      grossAmount += total;
    });

    const d = Number(watchTotalDiscount) || 0;
    const r = Number(watchRoundOff) || 0;
    const netAmount = grossAmount - d + r;

    setValue('grossAmount', Number(grossAmount.toFixed(2)));
    setValue('netAmount', Number(netAmount.toFixed(2)));

  }, [JSON.stringify(items), watchTotalDiscount, watchRoundOff, setValue]);

  // Product change handler
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === Number(productId));
    if (product) {
      setValue(`items.${index}.stock`, product.currentStock || 0);
      setValue(`items.${index}.unit`, product.unit?.shortCode || product.unit?.name || 'Nos');
      
      // Assign rate based on rate type
      if (watchRateType === 'Wholesale Rate') {
        setValue(`items.${index}.rate`, product.wholesaleRate || 0);
      } else {
        setValue(`items.${index}.rate`, product.sellingRate || 0);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: SaleFormValues) => api.post('/sales', data),
    onSuccess: () => {
      toast.success('Sale recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['nextInvoiceNo'] });
      reset();
      navigate('/sales');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to record sale. Please check your inputs.');
    }
  });

  const onSubmit = (data: SaleFormValues) => {
    if (!data.customerId) {
      toast.error('Please select a Customer before saving.');
      return;
    }
    if (!data.paymentModeId) {
      toast.error('Please select a Payment Mode before saving.');
      return;
    }
    
    const validItems = data.items.filter(item => item.productId > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one product before saving.');
      return;
    }

    const payload = {
      ...data,
      subtotal: data.grossAmount,
      discount: data.totalDiscount,
      tax: 0,
      grandTotal: data.netAmount,
      items: validItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discAmt,
        tax: 0,
        amount: item.total,
      }))
    };

    createMutation.mutate(payload as any);
  };

  const addCustomerMutation = useMutation({
    mutationFn: (data: any) => api.post('/customers', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '', address: '' });
      if (res.data && res.data.id) {
        setValue('customerId', res.data.id);
      }
    },
    onError: () => {
      alert('Failed to add customer.');
    }
  });

  const handleQuickAddCustomer = () => {
    if (!newCustomer.name) return;
    addCustomerMutation.mutate(newCustomer);
  };

  return (
    <div className="absolute inset-0 bg-[#F3F4F6] flex flex-col font-sans overflow-hidden z-10">
      
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white px-4 py-2 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleSubmit(onSubmit as any)}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-1.5 rounded flex items-center gap-2 font-bold text-[13px] transition-colors"
          >
            <Printer size={16} /> SAVE & PRINT (F10)
          </button>
          <button 
            type="button"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-1.5 rounded flex items-center gap-2 font-bold text-[13px] transition-colors"
          >
            <Phone size={16} /> WhatsApp
          </button>
        </div>
        <button 
          type="button"
          onClick={() => navigate('/dashboard')}
          className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-1.5 rounded flex items-center gap-2 font-bold text-[13px] transition-colors"
        >
          <X size={16} /> Close
        </button>
      </div>

      <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleSubmit(onSubmit as any)}>
        
        {/* Header Section */}
        <div className="bg-white p-4 border-b border-[#E5E7EB] shrink-0">
          <div className="flex gap-4">
            
            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Entry No</label>
              <input
                {...register('invoiceNo')}
                type="text"
                readOnly
                className="w-full px-2 py-1.5 border border-[#D1D5DB] bg-[#F9FAFB] rounded text-[13px] font-bold outline-none"
              />
            </div>

            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Entry Date</label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex-[2]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Customer Name (Searchable Dropdown) *</label>
              <div className="flex items-center gap-1">
                <SearchableSelect
                  value={watch('customerId')}
                  onChange={(val) => setValue('customerId', Number(val))}
                  options={[
                    { label: 'Click or type customer name / phone...', value: 0 },
                    ...customers.map((c: any) => ({ label: `${c.name} - ${c.phone || ''}`, value: c.id }))
                  ]}
                />
              </div>
              <div className="flex justify-between mt-1">
                <button type="button" onClick={() => setIsCustomerModalOpen(true)} className="bg-[#059669] hover:bg-[#047857] text-white px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px] font-bold">
                  <UserPlus size={12} /> Add Customer
                </button>
                <span className="text-[11px] text-[#6B7280]">
                  {selectedCustomer ? `${selectedCustomer.address || 'Counter Sale'}` : 'Counter Sale'}
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-[250px]">
              <label className="block text-[11px] font-bold text-[#059669] mb-1">Rate Type *</label>
              <select
                {...register('rateType')}
                className="w-full px-2 py-1.5 border border-[#059669] text-[#059669] font-medium rounded text-[13px] outline-none focus:ring-1 focus:ring-[#059669] bg-white"
              >
                <option value="Wholesale Rate">Wholesale Rate</option>
                <option value="Retail Rate">Retail Rate</option>
                <option value="MRP">MRP</option>
              </select>
            </div>

            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Payment Mode</label>
              <select
                {...register('paymentModeId')}
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
              >
                <option value="0">Select Payment Mode...</option>
                {paymentModes.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-auto bg-white border-b border-[#E5E7EB]">
          <div className="flex justify-end gap-2 p-2">
            <button 
              type="button"
              onClick={() => append({ productId: 0, quantity: 1, stock: 0, rate: 0, unit: 'Nos', discPercent: 0, discAmt: 0, total: 0 })}
              className="border border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] transition-colors font-bold"
            >
              <Plus size={14} /> Add Row
            </button>
            <button 
              type="button"
              onClick={() => reset()}
              className="border border-[#713F12] text-[#713F12] hover:bg-[#713F12] hover:text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] transition-colors font-bold"
            >
              <RefreshCw size={14} /> Clear (Esc)
            </button>
            <button 
              type="button"
              onClick={() => navigate('/sales')}
              className="border border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] transition-colors font-bold"
            >
              <List size={14} /> Sales Report
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white">
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-10">#</th>
                <th className="px-2 py-2 text-left text-[12px] font-medium border border-[#334155]">Product Code / Name (Searchable Dropdown)</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-20">Stock</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-24">Qty</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-28">Rate</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-20">Unit</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-20">Disc %</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-24">Disc Amt</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-32">Total</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-16">Act</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                  <td className="px-2 py-1 text-center text-[13px] border-r border-[#E5E7EB]">{index + 1}</td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <select
                      {...register(`items.${index}.productId`)}
                      onChange={(e) => {
                        register(`items.${index}.productId`).onChange(e);
                        handleProductChange(index, e.target.value);
                      }}
                      className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
                    >
                      <option value="0">Type product name / code...</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB] text-center">
                    <span className="bg-[#EF4444] text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {watch(`items.${index}.stock`)}
                    </span>
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.quantity`)} type="number" min="1" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.rate`)} type="number" step="0.01" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.unit`)} type="text" readOnly className="w-full px-1 py-1 bg-transparent text-[13px] outline-none text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.discPercent`)} type="number" step="0.01" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.discAmt`)} type="number" step="0.01" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.total`)} type="number" readOnly className="w-full px-2 py-1 bg-transparent text-[13px] outline-none text-right font-bold" />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => append({ productId: 0, quantity: 1, stock: 0, rate: 0, unit: 'Nos', discPercent: 0, discAmt: 0, total: 0 })} className="text-[#059669] hover:text-[#047857]">
                        <Plus size={14} />
                      </button>
                      <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="text-[#EF4444] hover:text-[#DC2626] disabled:opacity-30">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabs & Footer Calculation Area */}
        <div className="bg-[#F9FAFB] shrink-0">
          
          {/* 
          <div className="flex border-b border-[#E5E7EB]">
            {['Amount Details', 'Shipping Address', 'Delivery Address', 'Extra Details'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-[#3B82F6] text-[#3B82F6] bg-white' 
                    : 'border-transparent text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          */}

          <div className="p-4 bg-white border-b border-[#E5E7EB]">
            {activeTab === 'Amount Details' && (
              <div className="flex items-center gap-6">
                
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#4B5563]">Gross Amount:</label>
                  <input
                    {...register('grossAmount')}
                    type="number"
                    readOnly
                    className="w-full px-3 py-2 border border-[#D1D5DB] bg-[#F9FAFB] rounded text-[14px] outline-none text-right font-medium"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#4B5563]">Total Discount:</label>
                  <div className="flex gap-2">
                    <input
                      {...register('totalDiscountPercent')}
                      type="number"
                      placeholder="%"
                      step="0.01"
                      onChange={(e) => {
                        register('totalDiscountPercent').onChange(e);
                        const percent = Number(e.target.value) || 0;
                        const amount = (watch('grossAmount') * percent) / 100;
                        setValue('totalDiscount', Number(amount.toFixed(2)));
                      }}
                      className="w-1/3 px-2 py-2 border border-[#D1D5DB] rounded text-[14px] outline-none focus:border-[#3B82F6] text-center font-medium"
                    />
                    <input
                      {...register('totalDiscount')}
                      type="number"
                      placeholder="RM Amount"
                      step="0.01"
                      onChange={(e) => {
                        register('totalDiscount').onChange(e);
                        const amt = Number(e.target.value) || 0;
                        const grossAmt = watch('grossAmount');
                        if (grossAmt > 0) {
                          setValue('totalDiscountPercent', Number(((amt / grossAmt) * 100).toFixed(2)));
                        } else {
                          setValue('totalDiscountPercent', 0);
                        }
                      }}
                      className="w-2/3 px-3 py-2 border border-[#D1D5DB] rounded text-[14px] outline-none focus:border-[#3B82F6] text-right font-medium"
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#4B5563]">Round Off:</label>
                  <input
                    {...register('roundOff')}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] outline-none focus:border-[#3B82F6] text-right font-medium"
                  />
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                  {/* Empty space to balance layout */}
                </div>

              </div>
            )}
            {activeTab !== 'Amount Details' && (
              <div className="text-[13px] text-gray-500 italic py-4">
                More fields will go here in future updates.
              </div>
            )}
          </div>

          {/* Bottom Black Bar */}
          <div className="bg-[#020617] text-white px-4 py-3 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="bg-[#2563EB] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1">
                <span className="opacity-70 border-r border-[#60A5FA] pr-1 mr-1">F2</span> POS
              </div>
              <div className="bg-[#4B5563] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer hover:bg-[#374151]" onClick={handleSubmit(onSubmit as any)}>
                <span className="opacity-70 border-r border-[#9CA3AF] pr-1 mr-1">F10</span> Save & Print
              </div>
              <div className="bg-[#0891B2] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer hover:bg-[#0E7490]" onClick={() => navigate('/dashboard')}>
                <span className="opacity-70 border-r border-[#67E8F9] pr-1 mr-1">Esc</span> Dashboard
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[16px] font-bold text-white uppercase tracking-wide">TOTAL NET AMOUNT:</span>
              <span className="text-[28px] font-bold text-[#38BDF8]">
                RM {watch('netAmount')?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

        </div>

      </form>

      {/* Quick Add Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#059669] text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-[15px]">
                <UserPlus size={18} /> Quick Add New Customer
              </div>
              <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#1F2937] mb-1">Customer Name *</label>
                <input 
                  type="text" 
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]" 
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#4B5563] mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]" 
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#4B5563] mb-1">Billing Address</label>
                <textarea 
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] min-h-[80px]" 
                />
              </div>
            </div>
            <div className="p-4 bg-white pt-2 border-none pb-5">
              <button 
                type="button"
                onClick={handleQuickAddCustomer}
                disabled={!newCustomer.name || addCustomerMutation.isPending}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded font-bold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save size={16} /> Save Customer & Select
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default POS;
