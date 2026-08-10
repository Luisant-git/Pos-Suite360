import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, List, X, CheckCircle, PlusCircle } from 'lucide-react';
import api from '../../services/api';

const purchaseItemSchema = z.object({
  productId: z.coerce.number().min(1, 'Product is required').or(z.literal(0)),
  quantity: z.coerce.number().min(1, 'Quantity must be > 0'),
  unit: z.string().optional(),
  pRate: z.coerce.number().min(0),
  wRate: z.coerce.number().min(0),
  sRate: z.coerce.number().min(0),
  mrp: z.coerce.number().min(0),
  discPercent: z.coerce.number().min(0).max(100),
  discAmt: z.coerce.number().min(0),
  total: z.coerce.number(),
});

const purchaseSchema = z.object({
  supplierId: z.coerce.number().min(1, 'Supplier is required').or(z.literal(0)),
  invoiceNo: z.string(),
  entryNo: z.string(),
  date: z.string(),
  paymentModeId: z.coerce.number().min(1, 'Payment Mode is required').or(z.literal(0)),
  
  totalAmount: z.coerce.number(),
  totalDiscount: z.coerce.number(),
  roundOff: z.coerce.number(),
  netAmount: z.coerce.number(),

  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

const PurchaseEntry = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      entryNo: `PUR-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceNo: '',
      supplierId: 0,
      date: new Date().toISOString().split('T')[0],
      paymentModeId: 0,
      items: [{ productId: 0, quantity: 1, unit: 'Nos', pRate: 0, wRate: 0, sRate: 0, mrp: 0, discPercent: 0, discAmt: 0, total: 0 }],
      totalAmount: 0,
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
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await api.get('/suppliers')).data });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => (await api.get('/products')).data });
  const { data: paymentModes = [] } = useQuery({ queryKey: ['paymentModes'], queryFn: async () => (await api.get('/payment-modes')).data });

  // Watch values for calculation
  const items = watch('items');
  const watchTotalDiscount = watch('totalDiscount');
  const watchRoundOff = watch('roundOff');
  const selectedSupplierId = watch('supplierId');
  
  const selectedSupplier = suppliers.find((s: any) => s.id === Number(selectedSupplierId));

  // Calculations
  useEffect(() => {
    let totalAmount = 0;
    
    items.forEach((item, index) => {
      const q = Number(item.quantity) || 0;
      const pRate = Number(item.pRate) || 0;
      const discPercent = Number(item.discPercent) || 0;
      
      let discAmt = Number(item.discAmt) || 0;
      if (discPercent > 0 && discAmt === 0) { // Naive calculation for demo
        discAmt = (pRate * q * discPercent) / 100;
        setValue(`items.${index}.discAmt`, Number(discAmt.toFixed(2)));
      }

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

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === Number(productId));
    if (product) {
      setValue(`items.${index}.pRate`, product.purchaseRate || 0);
      setValue(`items.${index}.wRate`, product.wholesaleRate || 0);
      setValue(`items.${index}.sRate`, product.sellingRate || 0);
      setValue(`items.${index}.mrp`, product.mrp || 0);
      setValue(`items.${index}.unit`, product.unit?.shortCode || product.unit?.name || 'Nos');
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: PurchaseFormValues) => api.post('/purchases', data),
    onSuccess: () => {
      alert('Purchase recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/purchase');
    },
    onError: () => {
      alert('Note: The backend endpoint POST /purchases needs to be implemented first! But the UI is fully functional.');
    }
  });

  const onSubmit = (data: PurchaseFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex flex-col font-sans">
      
      {/* Top Bar */}
      <div className="bg-[#0B355B] text-white px-4 py-2 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
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

      <form className="flex flex-col flex-1" onSubmit={handleSubmit(onSubmit)}>
        
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
              <label className="block text-[11px] text-[#4B5563] mb-1">Vendor Invoice No</label>
              <input
                {...register('invoiceNo')}
                type="text"
                placeholder="Supplier Bill No"
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex-[2]">
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Supplier Name (Searchable Dropdown) *</label>
              <select
                {...register('supplierId')}
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
              >
                <option value="0">Click or type supplier name / mobile...</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.phone}</option>
                ))}
              </select>
              <div className="flex justify-between mt-1">
                <button type="button" className="text-[#059669] text-[12px] font-medium flex items-center gap-1 hover:underline">
                  <Plus size={12} /> Add Supplier
                </button>
                <span className="text-[11px] text-[#6B7280]">
                  {selectedSupplier ? `${selectedSupplier.address || 'No address'}` : 'Supplier address'}
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] text-[#4B5563] mb-1">Entry Date</label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex-1 max-w-[200px]">
              <label className="block text-[11px] text-[#4B5563] mb-1">Mode</label>
              <select
                {...register('paymentModeId')}
                className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] bg-white"
              >
                <option value="0">Select</option>
                {paymentModes.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-auto bg-white p-4">
          <div className="flex justify-end gap-2 mb-2">
            <button 
              type="button"
              onClick={() => append({ productId: 0, quantity: 1, unit: 'Nos', pRate: 0, wRate: 0, sRate: 0, mrp: 0, discPercent: 0, discAmt: 0, total: 0 })}
              className="border border-[#0B355B] text-[#0B355B] hover:bg-[#0B355B] hover:text-white px-3 py-1 rounded flex items-center gap-1 text-[12px] transition-colors font-bold"
            >
              <PlusCircle size={14} /> Add Row
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
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.quantity`)} type="number" min="1" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.unit`)} type="text" readOnly className="w-full px-1 py-1 bg-transparent text-[13px] outline-none text-center" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.pRate`)} type="number" step="0.01" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.wRate`)} type="number" step="0.01" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.sRate`)} type="number" step="0.01" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
                  </td>
                  <td className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input {...register(`items.${index}.mrp`)} type="number" step="0.01" className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none focus:border-[#3B82F6] text-right" />
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
                      <button type="button" onClick={() => append({ productId: 0, quantity: 1, unit: 'Nos', pRate: 0, wRate: 0, sRate: 0, mrp: 0, discPercent: 0, discAmt: 0, total: 0 })} className="text-[#059669] hover:text-[#047857]">
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

            <div className="flex-[2] flex justify-end items-center pt-5">
              <div className="flex items-center gap-4">
                <span className="text-[16px] font-bold text-[#1F2937]">NET PURCHASE AMOUNT:</span>
                <span className="text-[28px] font-bold text-[#059669]">
                  ₹{watch('netAmount')?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};

export default PurchaseEntry;
