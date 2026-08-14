import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, CheckCircle, Grid, Maximize, Minimize } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand Name is required'),
  parentId: z.string().optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

const Brands = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFullTable, setIsFullTable] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', parentId: '' }
  });

  const { data: brands = [], isLoading } = useQuery({ 
    queryKey: ['brands'], 
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: BrandFormValues) => {
      const payload = {
        name: data.name,
        parentId: data.parentId ? parseInt(data.parentId) : null
      };
      if (editingId) {
        return api.patch(`/brands/${editingId}`, payload);
      }
      return api.post('/brands', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      reset();
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/brands/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] })
  });

  const onSubmit = (data: BrandFormValues) => {
    mutation.mutate(data);
  };

  const handleEdit = (brand: any) => {
    setEditingId(brand.id);
    setValue('name', brand.name);
    setValue('parentId', brand.parentId ? brand.parentId.toString() : '');
  };

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      {/* Left Column: Form */}
      {!isFullTable && (
      <div className="lg:col-span-1 bg-white border border-[#E6E9ED] shadow-sm rounded-sm">
        <div className="bg-[#3B82F6] text-white px-4 py-3 flex items-center gap-2 rounded-t-sm">
          <CheckCircle size={18} className="text-white" />
          <h2 className="font-bold text-[14px]">BRAND MASTER</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#1F2937] mb-1">Brand Name *</label>
            <input 
              {...register('name')}
              type="text" 
              placeholder="Enter Brand Name"
              className="w-full px-3 py-2 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#1F2937] mb-1">Parent Brand (Under)</label>
            <select 
              {...register('parentId')}
              className="w-full px-3 py-2 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] bg-white"
            >
              <option value="">-- Primary Brand --</option>
              {brands.filter((b: any) => b.id !== editingId).map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded flex justify-center items-center gap-2 mt-4 transition-colors"
          >
            <CheckCircle size={16} />
            {editingId ? 'UPDATE BRAND' : 'SAVE BRAND (F10)'}
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
      <div className={`${isFullTable ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-[#E6E9ED] shadow-sm rounded-sm overflow-hidden flex flex-col`}>
        <div className="bg-[#f9f9f9] border-b border-[#E6E9ED] px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
          <div className="flex items-center justify-between w-full md:w-auto text-[#1F2937]">
            <div className="flex items-center gap-2">
            <Grid size={16} className="text-[#3B82F6]" />
            <h2 className="font-bold text-[14px]">BRAND LIST</h2>
          </div>
            <div className="bg-gray-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-xl">
              {brands.length} Brands
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button type="button" 
              onClick={() => setIsFullTable(!isFullTable)}
              className="text-[#3B82F6] hover:bg-[#EFF6FF] px-2 py-1 rounded text-[12px] font-bold flex items-center gap-1 transition-colors border border-[#3B82F6]"
            >
              {isFullTable ? <Minimize size={14} /> : <Maximize size={14} />}
              {isFullTable ? 'Show Form' : 'View Full Table'}
            </button>
            
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-[#2A2A2A] text-white font-bold">
                <th className="px-3 py-2.5 border-r border-[#444] text-center w-12">ID</th>
                <th className="px-3 py-2.5 border-r border-[#444]">Brand Name</th>
                <th className="px-3 py-2.5 border-r border-[#444]">Parent Brand</th>
                <th className="px-3 py-2.5 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-4">No brands found.</td></tr>
              ) : (
                brands.map((brand: any, index: number) => (
                  <tr key={brand.id} className={`border-b border-[#E5E7EB] ${index % 2 === 0 ? 'bg-[#F9F9F9]' : 'bg-white'} hover:bg-blue-50`}>
                    <td data-label="ID" className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold">{brand.id}</td>
                    <td data-label="Brand Name" className="px-3 py-2.5 border-r border-[#E5E7EB] font-bold text-[#3B82F6]">{brand.name}</td>
                    <td data-label="Parent Brand" className="px-3 py-2.5 border-r border-[#E5E7EB] text-gray-500">{brand.parent ? brand.parent.name : '-'}</td>
                    <td data-label="Actions" className="px-3 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button type="button" 
                          onClick={() => handleEdit(brand)}
                          className="text-[#3B82F6] border border-[#3B82F6] rounded p-1 hover:bg-[#3B82F6] hover:text-white transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button type="button" 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this brand?')) {
                              deleteMutation.mutate(brand.id);
                            }
                          }}
                          className="text-[#EF4444] border border-[#EF4444] rounded p-1 hover:bg-[#EF4444] hover:text-white transition-colors"
                        >
                          <Trash2 size={14} />
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

export default Brands;
