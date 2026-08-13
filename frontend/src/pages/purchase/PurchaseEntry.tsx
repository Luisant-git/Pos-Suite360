import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Plus, Trash2, CheckCircle, PlusCircle, X, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import SearchableSelect from '../../components/SearchableSelect';

const purchaseItemSchema = z.object({
  productId: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
  unit: z.string().optional(),
  pRate: z.coerce.number().min(0),
  wRate: z.coerce.number().min(0),
  sRate: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),
  discPercent: z.coerce.number().min(0).max(100),
  discAmt: z.coerce.number().min(0),
  total: z.coerce.number(),
}).superRefine((data, ctx) => {
  if (data.productId > 0) {
    if (data.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity must be > 0",
        path: ["quantity"]
      });
    }
    if (data.pRate < 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Purchase Rate is required",
        path: ["pRate"]
      });
    }
  }
});

const purchaseSchema = z.object({
  supplierId: z.coerce.number().min(1, 'Supplier is required').or(z.literal(0)),
  invoiceNo: z.string(),
  invoiceDate: z.string().optional(),
  entryNo: z.string(),
  date: z.string(),
  paymentModeId: z.coerce.number().min(1, 'Payment Mode is required').or(z.literal(0)),
  
  totalAmount: z.coerce.number(),
  totalDiscount: z.coerce.number(),
  totalDiscountPercent: z.coerce.number().optional(),
  roundOff: z.coerce.number(),
  netAmount: z.coerce.number(),

  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

const PurchaseEntry = () => {
  const { settings, formatCurrency } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', address: '' });

  const { register, control, handleSubmit, watch, setValue, reset } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: {
      entryNo: 'Generating...',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      supplierId: 0,
      date: new Date().toISOString().split('T')[0],
      paymentModeId: 0,
      items: [{ productId: 0, quantity: '' as any, unit: 'Nos', pRate: '' as any, wRate: '' as any, sRate: '' as any, mrp: '' as any, discPercent: '' as any, discAmt: '' as any, total: 0 }],
      totalAmount: 0,
      totalDiscountPercent: '' as any,
      totalDiscount: '' as any,
      roundOff: '' as any,
      netAmount: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Fetch Masters & Next Entry No
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await api.get('/suppliers')).data });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => (await api.get('/products')).data });
  const { data: nextEntryData } = useQuery({ queryKey: ['nextEntryNo'], queryFn: async () => (await api.get('/purchases/next-entry-no')).data });

  // Update default entry no
  useEffect(() => {
    if (nextEntryData?.entryNo) {
      setValue('entryNo', nextEntryData.entryNo);
    }
  }, [nextEntryData, setValue]);

  // Watch values for calculation
  const items = watch('items');
  const watchTotalDiscount = watch('totalDiscount');
  const watchRoundOff = watch('roundOff');
  
  // Calculations
  useEffect(() => {
    let totalAmount = 0;
    
    items.forEach((item, index) => {
      const q = Number(item.quantity) || 0;
      const pRate = Number(item.pRate) || 0;
      
      let discAmt = Number(item.discAmt) || 0;


      const total = (q * pRate) - discAmt;
      
      if (item.total !== total) {
        setValue(`items.${index}.total`, Number(total.toFixed(2)), { shouldValidate: false });
      }
      totalAmount += total;
    });

    const d = Number(watchTotalDiscount) || 0;
    const r = Number(watchRoundOff) || 0;
    const netAmount = totalAmount - d + r;

    setValue('totalAmount', Number(totalAmount.toFixed(2)));
    setValue('netAmount', Number(netAmount.toFixed(2)));

  }, [JSON.stringify(items), watchTotalDiscount, watchRoundOff, setValue]);

  const handleProductChange = async (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === Number(productId));
    if (product) {
      setValue(`items.${index}.unit`, product.unit?.shortCode || product.unit?.name || 'Nos');
      
      try {
        const response = await api.get(`/purchases/latest-rate/${productId}`);
        const latest = response.data;
        if (latest) {
          setValue(`items.${index}.pRate`, latest.rate || product.purchaseRate || 0);
          setValue(`items.${index}.wRate`, latest.wRate || product.wholesaleRate || 0);
          setValue(`items.${index}.sRate`, latest.sRate || product.sellingRate || 0);
          setValue(`items.${index}.mrp`, latest.mrp || product.mrp || 0);
        } else {
          setValue(`items.${index}.pRate`, product.purchaseRate || 0);
          setValue(`items.${index}.wRate`, product.wholesaleRate || 0);
          setValue(`items.${index}.sRate`, product.sellingRate || 0);
          setValue(`items.${index}.mrp`, product.mrp || 0);
        }
      } catch (e) {
        setValue(`items.${index}.pRate`, product.purchaseRate || 0);
        setValue(`items.${index}.wRate`, product.wholesaleRate || 0);
        setValue(`items.${index}.sRate`, product.sellingRate || 0);
        setValue(`items.${index}.mrp`, product.mrp || 0);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: PurchaseFormValues) => api.post('/purchases', data),
    onSuccess: () => {
      toast.success('Purchase recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['nextEntryNo'] });
      reset();
      navigate('/purchase');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to record purchase. Please check your inputs.');
    }
  });

  const onSubmit = (data: PurchaseFormValues) => {
    if (!data.supplierId) {
      toast.error('Please select a Supplier before saving.');
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
      supplierInvoiceNo: data.invoiceNo,
      invoiceNo: data.entryNo,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate).toISOString() : null,
      subtotal: data.totalAmount,
      discount: data.totalDiscount,
      tax: 0,
      grandTotal: data.netAmount,
      items: validItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.pRate,
        wRate: item.wRate,
        sRate: item.sRate,
        mrp: item.mrp,
        tax: 0,
        amount: item.total,
      }))
    };

    createMutation.mutate(payload as any);
  };

  const addSupplierMutation = useMutation({
    mutationFn: (data: any) => api.post('/suppliers', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsSupplierModalOpen(false);
      setNewSupplier({ name: '', phone: '', address: '' });
      if (res.data && res.data.id) {
        setValue('supplierId', res.data.id);
      }
    },
    onError: () => {
      alert('Failed to add supplier.');
    }
  });

  const handleQuickAddSupplier = () => {
    if (!newSupplier.name) return;
    addSupplierMutation.mutate(newSupplier);
  };

  const handleClear = () => {
    reset({
      entryNo: nextEntryData?.entryNo || 'Generating...',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      supplierId: 0,
      date: new Date().toISOString().split('T')[0],
      paymentModeId: 0,
      items: [{ productId: 0, quantity: '' as any, unit: 'Nos', pRate: '' as any, wRate: '' as any, sRate: '' as any, mrp: '' as any, discPercent: '' as any, discAmt: '' as any, total: 0 }],
      totalAmount: 0,
      totalDiscountPercent: '' as any,
      totalDiscount: '' as any,
      roundOff: '' as any,
      netAmount: 0
    });
  };

  const onError = (errors: any) => {
    toast.error('Validation failed. Please fill all required fields correctly.');
    console.error(errors);
  };

  return (
    <div className="absolute inset-0 bg-[#F3F4F6] flex flex-col font-sans overflow-hidden z-10">
      
      {/* Top Bar */}
      <div className="bg-[#0B355B] text-white px-4 py-2 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleSubmit(onSubmit as any, onError)}
            className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-1.5 rounded flex items-center gap-2 font-bold text-[13px] transition-colors"
          >
            <CheckCircle size={16} /> SAVE PURCHASE
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

      <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleSubmit(onSubmit as any, onError)}>
        
        {/* Header Section */}
        <div className="bg-white p-4 border-b border-[#E5E7EB] shrink-0">
          <div className="flex gap-4">
            
            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Entry No *</label>
              <input
                {...register('entryNo')}
                type="text"
                readOnly
                className="w-full px-2 py-1.5 border border-[#D1D5DB] bg-[#F9FAFB] rounded text-[13px] font-bold outline-none"
              />
            </div>
            
            <div className="flex-1 max-w-[250px]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Supplier Invoice number</label>
              <input
                {...register('invoiceNo')}
                type="text"
                placeholder="Supplier Bill No"
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex-[2]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Supplier Name (Searchable Dropdown) *</label>
              <div className="flex items-center gap-1">
                <SearchableSelect
                  value={watch('supplierId')}
                  onChange={(val) => setValue('supplierId', Number(val))}
                  options={[
                    { label: 'Click or type supplier name / phone...', value: 0 },
                    ...suppliers.map((s: any) => ({ label: `${s.name} - ${s.phone || ''}`, value: s.id }))
                  ]}
                />
              </div>
              <div className="flex mt-1">
                <button type="button" onClick={() => setIsSupplierModalOpen(true)} className="bg-[#059669] hover:bg-[#047857] text-white px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px] font-bold">
                  <Plus size={12} /> Add Supplier
                </button>
              </div>
            </div>

            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Invoice date</label>
              <input
                {...register('invoiceDate')}
                type="date"
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]"
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

            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Mode</label>
              <select
                {...register('paymentModeId')}
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
              >
                <option value="0">Select Payment Mode...</option>
                <option value="3">Cash</option>
                <option value="4">Credit</option>
              </select>
            </div>

          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-auto bg-white p-4">
          <div className="flex justify-end gap-2 mb-2">
            <button 
              type="button"
              onClick={() => append({ productId: 0, quantity: '' as any, unit: 'Nos', pRate: '' as any, wRate: '' as any, sRate: '' as any, mrp: '' as any, discPercent: '' as any, discAmt: '' as any, total: 0 })}
              className="border border-[#0B355B] text-[#0B355B] hover:bg-[#0B355B] hover:text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] transition-colors font-bold"
            >
              <PlusCircle size={14} /> Add Row
            </button>
            <button 
              type="button"
              onClick={handleClear}
              className="border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] transition-colors font-bold"
            >
              <RotateCcw size={14} /> Clear
            </button>
            <button 
              type="button"
              onClick={() => navigate('/purchase')}
              className="border border-[#0B355B] text-[#0B355B] hover:bg-[#0B355B] hover:text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] transition-colors font-bold"
            >
              <List size={14} /> Purchase Report
            </button>
          </div>
          <table className="w-full border-collapse border border-[#E5E7EB]">
            <thead>
              <tr className="bg-[#0F172A] text-white">
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-10">#</th>
                <th className="px-2 py-2 text-left text-[12px] font-medium border border-[#334155]">Item Code / Name (Searchable Dropdown)</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-20">Qty</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-20">Unit</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-24">PRate</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-24">WRate</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-24">SRate</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-24">MRP</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-20">Disc %</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-24">Disc Amt</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-28">Total</th>
                <th className="px-2 py-2 text-center text-[12px] font-medium border border-[#334155] w-16">Act</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                  <td className="px-2 py-1 text-center text-[13px] border-r border-[#E5E7EB]">{index + 1}</td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <SearchableSelect
                      value={watch(`items.${index}.productId`)}
                      onChange={(val) => {
                        setValue(`items.${index}.productId`, Number(val));
                        handleProductChange(index, String(val));
                      }}
                      options={[
                        { label: 'Type product name / code...', value: 0 },
                        ...products.map((p: any) => ({ label: `${p.code} - ${p.name}`, value: p.id }))
                      ]}
                    />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.quantity`)} type="number" min="1" placeholder="0" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.unit`)} type="text" readOnly className="w-full px-1 py-1 bg-transparent text-[13px] outline-none text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.pRate`)} type="number" step="0.01" placeholder="0.00" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.wRate`)} type="number" step="0.01" placeholder="0.00" readOnly className="w-full px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded text-[13px] outline-none text-right cursor-not-allowed" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.sRate`)} type="number" step="0.01" placeholder="0.00" readOnly className="w-full px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded text-[13px] outline-none text-right cursor-not-allowed" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.mrp`)} type="number" step="0.01" placeholder="0.00" readOnly className="w-full px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded text-[13px] outline-none text-right cursor-not-allowed" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input 
                      {...register(`items.${index}.discPercent`)} 
                      type="number" step="0.01" placeholder="0" 
                      onChange={(e) => {
                        register(`items.${index}.discPercent`).onChange(e);
                        const pct = Number(e.target.value) || 0;
                        const rate = Number(watch(`items.${index}.pRate`)) || 0;
                        const q = Number(watch(`items.${index}.quantity`)) || 0;
                        const amt = (rate * q * pct) / 100;
                        setValue(`items.${index}.discAmt`, Number(amt.toFixed(2)));
                      }}
                      className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" 
                    />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input 
                      {...register(`items.${index}.discAmt`)} 
                      type="number" step="0.01" placeholder="0.00" 
                      onChange={(e) => {
                        register(`items.${index}.discAmt`).onChange(e);
                        const amt = Number(e.target.value) || 0;
                        const rate = Number(watch(`items.${index}.pRate`)) || 0;
                        const q = Number(watch(`items.${index}.quantity`)) || 0;
                        const totalGross = rate * q;
                        if (totalGross > 0) {
                          const pct = (amt / totalGross) * 100;
                          setValue(`items.${index}.discPercent`, Number(pct.toFixed(2)));
                        } else {
                          setValue(`items.${index}.discPercent`, 0);
                        }
                      }}
                      className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" 
                    />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.total`)} type="number" readOnly className="w-full px-2 py-1 bg-transparent text-[13px] outline-none text-right font-bold" />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => append({ productId: 0, quantity: '' as any, unit: 'Nos', pRate: '' as any, wRate: '' as any, sRate: '' as any, mrp: '' as any, discPercent: '' as any, discAmt: '' as any, total: 0 })} className="text-[#059669] hover:text-[#047857]">
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

        {/* Footer Calculation Area */}
        <div className="bg-white border-t border-[#E5E7EB] p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-6">
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#4B5563]">Total Amount:</label>
              <input
                {...register('totalAmount')}
                type="number"
                readOnly
                className="w-full px-3 py-2 border border-[#D1D5DB] bg-[#F9FAFB] rounded text-[14px] outline-none text-right font-medium"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#4B5563]">Total Discount:</label>
              <div className="flex gap-2">
                <div className="relative w-1/3">
                  <input
                    {...register('totalDiscountPercent')}
                    type="number"
                    step="0.01"
                    onChange={(e) => {
                      register('totalDiscountPercent').onChange(e);
                      const percent = Number(e.target.value) || 0;
                      const amount = (watch('totalAmount') * percent) / 100;
                      setValue('totalDiscount', Number(amount.toFixed(2)));
                    }}
                    className="w-full pl-2 pr-6 py-2 border border-[#D1D5DB] rounded text-[14px] outline-none focus:border-[#3B82F6] text-right font-medium"
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[13px] pointer-events-none">%</span>
                </div>
                <div className="relative w-2/3">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[13px] pointer-events-none">{settings?.currencySymbol || 'RM'}</span>
                  <input
                    {...register('totalDiscount')}
                    type="number"
                    step="0.01"
                    onChange={(e) => {
                      register('totalDiscount').onChange(e);
                      const amt = Number(e.target.value) || 0;
                      const totalAmt = watch('totalAmount');
                      if (totalAmt > 0) {
                        setValue('totalDiscountPercent', Number(((amt / totalAmt) * 100).toFixed(2)));
                      } else {
                        setValue('totalDiscountPercent', 0);
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-[#D1D5DB] rounded text-[14px] outline-none focus:border-[#3B82F6] text-right font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/*
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#4B5563]">Round Off:</label>
              <input
                {...register('roundOff')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] outline-none focus:border-[#3B82F6] text-right font-medium"
              />
            </div>
            */}


            <div className="flex-[2] flex justify-end items-center pt-5">
              <div className="flex items-center gap-4">
                <span className="text-[16px] font-bold text-[#1F2937]">NET PURCHASE AMOUNT:</span>
                <span className="text-[28px] font-bold text-[#059669]">
                  {formatCurrency(watch('netAmount') || 0)}
                </span>
              </div>
            </div>

          </div>
        </div>

      </form>

      {/* Quick Add Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#059669] text-white px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-[15px]">
                <Plus size={18} /> Quick Add New Supplier
              </div>
              <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#1F2937] mb-1">Supplier Name *</label>
                <input 
                  type="text" 
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]" 
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#4B5563] mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]" 
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#4B5563] mb-1">Address</label>
                <textarea 
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] min-h-[80px]" 
                />
              </div>
            </div>
            <div className="p-4 bg-white pt-2 border-none pb-5">
              <button 
                type="button"
                onClick={handleQuickAddSupplier}
                disabled={!newSupplier.name || addSupplierMutation.isPending}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded font-bold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={16} /> Save Supplier & Select
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseEntry;
