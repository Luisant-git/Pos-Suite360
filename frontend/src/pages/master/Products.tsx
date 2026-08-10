import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, CheckCircle, Package, Search, Grid, Maximize, Minimize } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const productSchema = z.object({
  code: z.string().min(1, 'Product Code is required'),
  name: z.string().min(1, 'Product Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  unitId: z.string().min(1, 'Unit is required'),
  supplierId: z.string().optional(),
  currentStock: z.number().min(0).default(0), // Opening Stock
  purchaseRate: z.number().min(0).default(0),
  wholesaleRate: z.number().min(0).default(0),
  sellingRate: z.number().min(0).default(0), // Sale Rate (Retail)
  minStock: z.number().min(0).default(0),    // Min Qty (Alert)
  reorderLevel: z.number().min(0).default(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

const Products = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullTable, setIsFullTable] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: '',
      name: '',
      categoryId: '',
      brandId: '',
      unitId: '',
      supplierId: '',
      currentStock: 0,
      purchaseRate: 0,
      wholesaleRate: 0,
      sellingRate: 0,
      minStock: 0,
      reorderLevel: 0,
    }
  });

  // Fetch Master Data
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: async () => (await api.get('/categories')).data });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: async () => (await api.get('/brands')).data });
  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: async () => (await api.get('/units')).data });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await api.get('/suppliers')).data });

  // Fetch Products
  const { data: products = [], isLoading } = useQuery({ 
    queryKey: ['products'], 
    queryFn: async () => (await api.get('/products')).data 
  });

  const filteredProducts = products.filter((p: any) => {
    if (filterCategory && p.categoryId.toString() !== filterCategory) return false;
    if (filterBrand && p.brandId?.toString() !== filterBrand) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const payload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        brandId: data.brandId ? parseInt(data.brandId) : undefined,
        unitId: parseInt(data.unitId),
        supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
      };
      
      if (editingId) {
        return api.patch(`/products/${editingId}`, payload);
      }
      return api.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const onSubmit = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setValue('code', product.code);
    setValue('name', product.name);
    setValue('categoryId', product.categoryId.toString());
    setValue('brandId', product.brandId ? product.brandId.toString() : '');
    setValue('unitId', product.unitId.toString());
    setValue('supplierId', product.supplierId ? product.supplierId.toString() : '');
    setValue('currentStock', Number(product.currentStock));
    setValue('purchaseRate', Number(product.purchaseRate));
    setValue('wholesaleRate', Number(product.wholesaleRate));
    setValue('sellingRate', Number(product.sellingRate));
    setValue('minStock', Number(product.minStock));
    setValue('reorderLevel', Number(product.reorderLevel));
  };

  return (
    <div className="bg-[#F7F7F7] min-h-[calc(100vh-100px)] grid grid-cols-1 xl:grid-cols-3 gap-4">
      
      {/* Left Column: Form */}
      {!isFullTable && (
      <div className="xl:col-span-1 bg-white border border-[#E6E9ED] shadow-sm rounded-sm flex flex-col">
        <div className="bg-[#3B82F6] text-white px-4 py-3 flex items-center justify-between rounded-t-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-white" />
            <h2 className="font-bold text-[14px]">PRODUCT MASTER</h2>
          </div>
          <button type="button" className="bg-[#1E3A8A] text-white text-[11px] px-3 py-1 font-bold rounded">
            Auto Code
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Product Code *</label>
              <input 
                {...register('code')}
                type="text" 
                placeholder="Code"
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
              />
              {errors.code && <span className="text-red-500 text-xs mt-1 block">{errors.code.message}</span>}
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Unit</label>
              <select 
                {...register('unitId')}
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] bg-white"
              >
                <option value="">-- Select --</option>
                {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.unitId && <span className="text-red-500 text-xs mt-1 block">{errors.unitId.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Product Name *</label>
            <input 
              {...register('name')}
              type="text" 
              placeholder="Full item description"
              className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px]"
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Category</label>
              <select 
                {...register('categoryId')}
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] bg-white"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Brand</label>
              <select 
                {...register('brandId')}
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] bg-white"
              >
                <option value="">-- Select Brand --</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Default Supplier</label>
            <select 
              {...register('supplierId')}
              className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] bg-white"
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <h3 className="font-bold text-[13px] text-gray-500 mt-2 uppercase">Pricing Matrix</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Opening Stock</label>
              <input 
                {...register('currentStock', { valueAsNumber: true })}
                type="number" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] text-right"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Pur Rate</label>
              <input 
                {...register('purchaseRate', { valueAsNumber: true })}
                type="number" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] text-right"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#16A34A] mb-1">Wholesale Rate *</label>
              <input 
                {...register('wholesaleRate', { valueAsNumber: true })}
                type="number" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] text-right"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#3B82F6] mb-1">Sale Rate (Retail) *</label>
              <input 
                {...register('sellingRate', { valueAsNumber: true })}
                type="number" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] text-right"
              />
            </div>
          </div>

          <h3 className="font-bold text-[13px] text-red-500 mt-2 uppercase">Stock Alerts & Thresholds</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Min Qty (Alert)</label>
              <input 
                {...register('minStock', { valueAsNumber: true })}
                type="number" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] text-right"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#1F2937] mb-1">Reorder Level</label>
              <input 
                {...register('reorderLevel', { valueAsNumber: true })}
                type="number" 
                className="w-full px-3 py-1.5 border border-[#ccc] rounded shadow-inner focus:border-[#3B82F6] outline-none text-[13px] text-right"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded flex justify-center items-center gap-2 transition-colors"
          >
            <CheckCircle size={16} />
            {editingId ? 'UPDATE PRODUCT' : 'SAVE PRODUCT (F10)'}
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
        <div className="bg-[#E5E7EB] border-b border-[#E6E9ED] px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#1F2937]">
            <Grid size={16} className="text-[#3B82F6]" />
            <h2 className="font-bold text-[14px]">MASTER PRODUCT LIST BY CATEGORY & BRAND</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFullTable(!isFullTable)}
              className="text-[#3B82F6] hover:bg-white px-2 py-1 rounded text-[12px] font-bold flex items-center gap-1 transition-colors border border-[#3B82F6]"
            >
              {isFullTable ? <Minimize size={14} /> : <Maximize size={14} />}
              {isFullTable ? 'Show Form' : 'View Full Table'}
            </button>
            <div className="bg-gray-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-xl">
              {filteredProducts.length} Products
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-3 border-b border-[#E6E9ED] grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#F9F9F9] items-end">
          <div>
            <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Category:</label>
            <select 
              value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#ccc] rounded outline-none text-[12px] bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Brand:</label>
            <select 
              value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#ccc] rounded outline-none text-[12px] bg-white"
            >
              <option value="">All Brands</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[12px] font-bold text-[#1F2937] mb-1">Search:</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by name / code..."
                  className="w-full px-3 py-1.5 border border-[#ccc] rounded outline-none text-[12px]"
                />
              </div>
            </div>
            <button 
              onClick={() => { setFilterCategory(''); setFilterBrand(''); setSearchTerm(''); }}
              className="px-4 py-1.5 border border-[#ccc] rounded bg-white text-gray-700 text-[12px] font-bold hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#2A2A2A] text-white font-bold">
                <th className="px-3 py-2 border-r border-[#444] text-center w-8">#</th>
                <th className="px-3 py-2 border-r border-[#444]">Code</th>
                <th className="px-3 py-2 border-r border-[#444]">Product Description</th>
                <th className="px-3 py-2 border-r border-[#444]">Category</th>
                <th className="px-3 py-2 border-r border-[#444]">Brand</th>
                <th className="px-3 py-2 border-r border-[#444] text-center">Stock</th>
                <th className="px-3 py-2 border-r border-[#444] text-right">Pur Rate</th>
                <th className="px-3 py-2 border-r border-[#444] text-right">Wholesale</th>
                <th className="px-3 py-2 border-r border-[#444] text-right">Sale Rate</th>
                <th className="px-3 py-2 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="text-center p-4">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={10} className="text-center p-4">No products found.</td></tr>
              ) : (
                filteredProducts.map((product: any, index: number) => (
                  <tr key={product.id} className={`border-b border-[#E5E7EB] ${index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'} hover:bg-blue-50`}>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold text-gray-700">{index + 1}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] font-bold text-[#3B82F6]">{product.code}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] font-bold text-[#1F2937]">{product.name}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-[#16A34A] uppercase bg-[#DCFCE7] px-2 py-0.5 rounded">{product.category?.name || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB]">
                      <span className="text-[10px] font-bold text-[#D97706] uppercase bg-[#FEF3C7] px-2 py-0.5 rounded">{product.brand?.name || '-'}</span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold">
                      {product.currentStock} {product.unit?.name}
                    </td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-right text-gray-600 font-medium">RM {Number(product.purchaseRate).toFixed(2)}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-right font-bold text-[#16A34A]">RM {Number(product.wholesaleRate).toFixed(2)}</td>
                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-right font-bold text-[#3B82F6]">RM {Number(product.sellingRate).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-[#3B82F6] border border-[#3B82F6] rounded p-1 hover:bg-[#3B82F6] hover:text-white transition-colors"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              deleteMutation.mutate(product.id);
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

export default Products;
