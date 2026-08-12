import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, CheckCircle, Truck, Grid, Maximize, Minimize } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().min(1, 'Mobile No is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  openingBalance: z.coerce.number().default(0),
  openingBalanceType: z.string().default('Cr'),
  accountNo: z.string().optional(),
  ifscCode: z.string().optional(),
  bankBranch: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

const Suppliers = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullTable, setIsFullTable] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      openingBalance: '' as any,
      openingBalanceType: 'Cr',
      accountNo: '',
      ifscCode: '',
      bankBranch: '',
    }
  });

  const { data: suppliers = [], isLoading } = useQuery({ 
    queryKey: ['suppliers'], 
    queryFn: async () => (await api.get('/suppliers')).data 
  });

  const filteredSuppliers = suppliers.filter((s: any) => {
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.phone?.includes(searchTerm)) return false;
    return true;
  });

  const mutation = useMutation({
    mutationFn: async (data: SupplierFormValues) => {
      if (editingId) {
        return api.patch(`/suppliers/${editingId}`, data);
      }
      return api.post('/suppliers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      reset();
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/suppliers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  });

  const onSubmit = (data: SupplierFormValues) => {
    mutation.mutate(data);
  };

  const handleEdit = (supplier: any) => {
    setEditingId(supplier.id);
    setValue('name', supplier.name);
    setValue('contactPerson', supplier.contactPerson || '');
    setValue('phone', supplier.phone || '');
    setValue('email', supplier.email || '');
    setValue('address', supplier.address || '');
    setValue('openingBalance', Number(supplier.openingBalance));
    setValue('openingBalanceType', supplier.openingBalanceType || 'Cr');
    setValue('accountNo', supplier.accountNo || '');
    setValue('ifscCode', supplier.ifscCode || '');
    setValue('bankBranch', supplier.bankBranch || '');
  };

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)] grid grid-cols-1 xl:grid-cols-3 gap-4">
      
      {/* Left Column: Form */}
      {!isFullTable && (
      <div className="xl:col-span-1 bg-white border border-[#E6E9ED] shadow-sm rounded-sm flex flex-col">
        <div className="bg-[#3B82F6] text-white px-4 py-3 flex items-center gap-2 rounded-t-sm">
          <Truck size={18} className="text-white" />
          <h2 className="font-bold text-[14px]">SUPPLIER MASTER</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit as any)} className="p-4 flex flex-col gap-3">
          
          <div>
            <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Supplier Name *</label>
            <input 
              {...register('name')}
              type="text" 
              placeholder="Enter Supplier / Company Name"
              className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Contact Person</label>
              <input 
                {...register('contactPerson')}
                type="text" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Mobile No *</label>
              <input 
                {...register('phone')}
                type="text" 
                placeholder="10-digit mobile"
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
              />
              {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-[#1F2937] mb-1">Email Address</label>
            <input 
              {...register('email')}
              type="email" 
              className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] text-[#1F2937] mb-1">Complete Address</label>
            <textarea 
              {...register('address')}
              rows={3}
              className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Opening Bal</label>
              <input 
                {...register('openingBalance')}
                type="number" 
                placeholder="0"
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] text-right"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Type</label>
              <select 
                {...register('openingBalanceType')}
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] bg-white"
              >
                <option value="Cr">Cr (Payable)</option>
                <option value="Dr">Dr (Receivable)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Account No</label>
              <input 
                {...register('accountNo')}
                type="text" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">IFSC Code</label>
              <input 
                {...register('ifscCode')}
                type="text" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-[#1F2937] mb-1">Bank Branch</label>
            <input 
              {...register('bankBranch')}
              type="text" 
              className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
            />
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded flex justify-center items-center gap-2 mt-2 transition-colors"
          >
            <CheckCircle size={16} />
            {editingId ? 'UPDATE SUPPLIER' : 'SAVE SUPPLIER (F10)'}
          </button>
          
          {editingId && (
            <button 
              type="button" 
              onClick={() => { reset(); setEditingId(null); }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded flex justify-center items-center gap-2 transition-colors"
            >
              CANCEL EDIT
            </button>
          )}
        </form>
      </div>
      )}

      {/* Right Column: List */}
      <div className={`${isFullTable ? 'xl:col-span-3' : 'xl:col-span-2'} bg-white border border-[#E6E9ED] shadow-sm rounded-sm overflow-hidden flex flex-col`}>
        <div className="bg-[#f9f9f9] border-b border-[#E6E9ED] px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#1F2937]">
            <Grid size={16} className="text-[#3B82F6]" />
            <h2 className="font-bold text-[14px]">SUPPLIER LIST</h2>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" 
              onClick={() => setIsFullTable(!isFullTable)}
              className="text-[#3B82F6] hover:bg-[#EFF6FF] px-2 py-1 rounded text-[12px] font-bold flex items-center gap-1 transition-colors border border-[#3B82F6]"
            >
              {isFullTable ? <Minimize size={14} /> : <Maximize size={14} />}
              {isFullTable ? 'Show Form' : 'View Full Table'}
            </button>
            <div className="bg-gray-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-xl">
              {filteredSuppliers.length} Suppliers
            </div>
          </div>
        </div>
        
        {/* Filter */}
        <div className="p-3 border-b border-[#E6E9ED] bg-white">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search supplier by name or phone number..."
            className="w-full px-3 py-2 border border-[#ccc] rounded outline-none text-[13px]"
          />
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#2A2A2A] text-white font-bold">
                <th className="px-3 py-2.5 border-r border-[#444] text-center w-8">#</th>
                <th className="px-3 py-2.5 border-r border-[#444]">Supplier Name</th>
                <th className="px-3 py-2.5 border-r border-[#444]">Mobile</th>
                <th className="px-3 py-2.5 border-r border-[#444]">Complete Address</th>
                <th className="px-3 py-2.5 border-r border-[#444] text-right">Opening Bal</th>
                <th className="px-3 py-2.5 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4">No suppliers found.</td></tr>
              ) : (
                filteredSuppliers.map((supplier: any, index: number) => (
                  <tr key={supplier.id} className={`border-b border-[#E5E7EB] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'} hover:bg-blue-50`}>
                    <td className="px-3 py-3 border-r border-[#E5E7EB] text-center font-bold text-gray-700">{index + 1}</td>
                    <td className="px-3 py-3 border-r border-[#E5E7EB] font-bold text-[#3B82F6]">{supplier.name}</td>
                    <td className="px-3 py-3 border-r border-[#E5E7EB] font-medium text-gray-700">{supplier.phone || '-'}</td>
                    <td className="px-3 py-3 border-r border-[#E5E7EB] text-gray-600 truncate max-w-[200px]">{supplier.address || '-'}</td>
                    <td className="px-3 py-3 border-r border-[#E5E7EB] text-right font-bold text-gray-800">
                      RM {Number(supplier.openingBalance).toFixed(2)} ({supplier.openingBalanceType})
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button type="button" 
                          onClick={() => handleEdit(supplier)}
                          className="text-[#3B82F6] border border-[#3B82F6] rounded p-1 hover:bg-[#3B82F6] hover:text-white transition-colors"
                        >
                          <Edit size={12} />
                        </button>
                        <button type="button" 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this supplier?')) {
                              deleteMutation.mutate(supplier.id);
                            }
                          }}
                          className="text-[#EF4444] border border-[#EF4444] rounded p-1 hover:bg-[#EF4444] hover:text-white transition-colors"
                        >
                          <Trash2 size={12} />
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

export default Suppliers;
