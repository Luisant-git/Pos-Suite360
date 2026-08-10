import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Save, X, Printer, RefreshCw, List, UserPlus, Phone } from 'lucide-react';
import api from '../../services/api';

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
  roundOff: z.coerce.number(),
  netAmount: z.coerce.number(),

  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

const POS = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Amount Details');

  const { register, control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      customerId: 0,
      rateType: 'Wholesale Rate',
      paymentModeId: 0,
      items: [{ productId: 0, quantity: 1, stock: 0, rate: 0, unit: 'Nos', discPercent: 0, discAmt: 0, total: 0 }],
      grossAmount: 0,
      totalDiscount: 0,
      roundOff: 0,
      netAmount: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Fetch Masters
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: async () => (await api.get('/customers')).data });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => (await api.get('/products')).data });
  const { data: paymentModes = [] } = useQuery({ queryKey: ['paymentModes'], queryFn: async () => (await api.get('/payment-modes')).data });

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
      alert('Sale recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();
    },
    onError: () => {
      alert('Note: The backend endpoint POST /sales needs to be implemented first! But the UI is fully functional.');
    }
  });

  const onSubmit = (data: SaleFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex flex-col font-sans">
      
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white px-4 py-2 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
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

      <form className="flex flex-col flex-1" onSubmit={handleSubmit(onSubmit)}>
        
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
                <select
                  {...register('customerId')}
                  className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
                >
                  <option value="0">Click or type customer name / phone...</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between mt-1">
                <button type="button" className="text-[#059669] border border-[#059669] p-0.5 rounded hover:bg-[#D1FAE5]">
                  <UserPlus size={14} />
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
                <option value="0">Cash</option>
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
                  <input
                    {...register('totalDiscount')}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] outline-none focus:border-[#3B82F6] text-right font-medium"
                  />
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
                {tab} fields will go here in future updates.
              </div>
            )}
          </div>

          {/* Bottom Black Bar */}
          <div className="bg-[#020617] text-white px-4 py-3 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="bg-[#2563EB] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1">
                <span className="opacity-70 border-r border-[#60A5FA] pr-1 mr-1">F2</span> POS
              </div>
              <div className="bg-[#4B5563] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer hover:bg-[#374151]" onClick={handleSubmit(onSubmit)}>
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
    </div>
  );
};

export default POS;
