import { useState, useEffect, useMemo } from 'react';
import { Save, Plus, Trash2, RotateCcw, FileText, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import SearchableSelect from '../../components/SearchableSelect';

const PurchaseReturn = () => {
  const navigate = useNavigate();
  const [returnNo, setReturnNo] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch next sequential code
  const fetchNextCode = async () => {
    try {
      const { data } = await api.get('/purchase-returns/next-code');
      setReturnNo(data);
    } catch (error) {
      console.error('Error fetching next return code', error);
    }
  };

  useEffect(() => {
    fetchNextCode();
  }, []);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch Suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => (await api.get('/suppliers')).data
  });

  // Fetch Purchases for selected supplier
  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', selectedSupplierId],
    queryFn: async () => {
      if (!selectedSupplierId) return [];
      const res = await api.get(`/purchases?supplierId=${selectedSupplierId}`);
      return res.data;
    },
    enabled: !!selectedSupplierId
  });

  // Fetch Purchase Details when purchase is selected
  const { data: purchaseDetails } = useQuery({
    queryKey: ['purchaseDetails', selectedPurchaseId],
    queryFn: async () => {
      if (!selectedPurchaseId) return null;
      const res = await api.get(`/purchases/${selectedPurchaseId}`);
      return res.data;
    },
    enabled: !!selectedPurchaseId
  });

  const [returnItems, setReturnItems] = useState<any[]>([]);

  useEffect(() => {
    if (purchaseDetails && purchaseDetails.items) {
      setReturnItems(purchaseDetails.items.map((item: any) => ({
        ...item,
        returnQty: 0,
      })));
    } else {
      setReturnItems([]);
    }
  }, [purchaseDetails]);

  const handleReturnQtyChange = (index: number, val: string) => {
    const qty = parseInt(val) || 0;
    const newItems = [...returnItems];
    // prevent returning more than purchased
    if (qty > newItems[index].quantity) return;
    newItems[index].returnQty = qty >= 0 ? qty : 0;
    setReturnItems(newItems);
  };

  const handleClear = () => {
    setSelectedSupplierId('');
    setSelectedPurchaseId('');
    setRemarks('');
    setReturnItems([]);
    fetchNextCode();
  };

  const totals = useMemo(() => {
    return returnItems.reduce((acc, item) => {
      if (item.returnQty > 0) {
        acc.itemsCount += 1;
        acc.qtyCount += item.returnQty;
        acc.totalAmount += (item.returnQty * parseFloat(item.rate));
      }
      return acc;
    }, { itemsCount: 0, qtyCount: 0, totalAmount: 0 });
  }, [returnItems]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/purchase-returns', payload);
      return res.data;
    },
    onSuccess: () => {
      alert('Purchase Return Saved Successfully!');
      handleClear();
    },
    onError: (err: any) => {
      console.error(err);
      alert(`Failed to save purchase return: ${err.response?.data?.message || err.message}`);
    }
  });

  const handleSave = () => {
    if (!selectedSupplierId) return alert('Select a supplier');
    if (totals.qtyCount === 0) return alert('Return at least 1 quantity');
    
    const itemsPayload = returnItems
      .filter(item => item.returnQty > 0)
      .map(item => ({
        productId: item.productId,
        returnQty: item.returnQty,
        rate: Number(item.rate),
        amount: item.returnQty * Number(item.rate)
      }));

    saveMutation.mutate({
      returnNo,
      date: returnDate,
      purchaseId: selectedPurchaseId ? Number(selectedPurchaseId) : undefined,
      supplierId: Number(selectedSupplierId),
      remarks,
      totalAmount: totals.totalAmount,
      items: itemsPayload
    });
  };

  return (
    <div className="absolute inset-0 bg-[#F3F4F6] flex flex-col font-sans overflow-hidden z-10">
      {/* Header */}
      <div className="bg-[#0f172a] text-white px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-1.5 px-4 rounded text-sm flex items-center gap-2 disabled:opacity-50" disabled={saveMutation.isPending}>
            <Save size={16} /> {saveMutation.isPending ? 'SAVING...' : 'SAVE PURCHASE RETURN (F10)'}
          </button>
        </div>
        <Link to="/dashboard" className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-4 rounded text-sm flex items-center gap-2">
          <X size={16} /> Close
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2 overflow-hidden flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          
          <div className="flex-shrink-0">
          
          {/* Top Form */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50/50">
            <div>
              <label className="block text-[11px] font-bold text-orange-400 mb-1">Return No</label>
              <input type="text" value={returnNo} readOnly className="w-full text-orange-400 font-bold bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Return Date</label>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#1ABB9C]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Supplier Name *</label>
              <SearchableSelect
                value={selectedSupplierId}
                onChange={(val) => { setSelectedSupplierId(String(val)); setSelectedPurchaseId(''); }}
                options={[
                  { label: 'Select Supplier...', value: '' },
                  ...suppliers.map((s: any) => ({ label: `${s.name} - ${s.phone || ''}`, value: s.id }))
                ]}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-blue-600 mb-1">Vendor Invoice / Bill No *</label>
              <SearchableSelect
                value={selectedPurchaseId}
                onChange={(val) => setSelectedPurchaseId(String(val))}
                options={[
                  { label: 'Select Purchase Invoice...', value: '' },
                  ...purchases.map((p: any) => ({ label: `${p.invoiceNo} (Date: ${new Date(p.date).toLocaleDateString()})`, value: p.id }))
                ]}
              />
            </div>
          </div>
          
          {/* Optional remarks */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
             <label className="block text-[11px] font-bold text-gray-700 mb-1">Remarks / Reason</label>
             <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional return remarks..." className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#1ABB9C]" />
          </div>

          {/* Table Header */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase">
              <span className="text-gray-500">grid</span> PURCHASED ITEMS TO RETURN (ITEMS DEDUCTED FROM STOCK)
            </h3>
            <div className="flex items-center gap-2">
              {/* <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-1 px-3 rounded text-xs flex items-center gap-1 shadow-sm">
                <Plus size={14} /> Add Custom Row
              </button> */}
              <button onClick={handleClear} className="bg-white border border-gray-300 hover:bg-gray-50 text-orange-500 font-semibold py-1 px-3 rounded text-xs flex items-center gap-1 shadow-sm">
                <RotateCcw size={14} /> Clear
              </button>
              <button onClick={() => navigate('/reports/purchase-return')} className="bg-white border border-gray-300 hover:bg-gray-50 text-blue-600 font-semibold py-1 px-3 rounded text-xs flex items-center gap-1 shadow-sm">
                <FileText size={14} /> Reports
              </button>
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full ml-2 shadow-sm border border-yellow-500">{returnItems.length} Items</span>
            </div>
          </div>

          </div>

          {/* Table */}
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-white uppercase bg-[#2d3748]">
                <tr>
                  <th className="px-4 py-2 border-r border-gray-600 text-center w-12">#</th>
                  <th className="px-4 py-2 border-r border-gray-600">Product Name / Code</th>
                  <th className="px-4 py-2 border-r border-gray-600 text-center w-24">Unit</th>
                  <th className="px-4 py-2 border-r border-gray-600 text-center w-32">Purchased Qty</th>
                  <th className="px-4 py-2 border-r border-gray-600 text-right w-24">Pur. Rate</th>
                  <th className="px-4 py-2 border-r border-gray-600 text-center text-red-400 w-32">Return Qty</th>
                  <th className="px-4 py-2 border-r border-gray-600 text-right w-32">Total Amount</th>
                  <th className="px-4 py-2 text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {returnItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Select a Vendor Invoice / Bill No above to load items for return.
                    </td>
                  </tr>
                ) : (
                  returnItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 border-r border-gray-200 text-center">{index + 1}</td>
                      <td className="px-4 py-2 border-r border-gray-200 font-medium">
                        {item.product.name} <span className="text-gray-400 text-xs ml-1">({item.product.code})</span>
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200 text-center">
                        {item.product.unit?.name || 'Nos'}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200 text-center font-bold text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200 text-right">
                        {Number(item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200">
                        <input 
                          type="number" 
                          min="0" 
                          max={item.quantity}
                          value={item.returnQty || ''} 
                          onChange={(e) => handleReturnQtyChange(index, e.target.value)} 
                          className="w-full border border-red-300 bg-red-50 rounded px-2 py-1 text-sm text-center text-red-600 font-bold focus:outline-none focus:ring-1 focus:ring-red-400" 
                        />
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200 text-right font-bold text-gray-700">
                        {(item.returnQty * parseFloat(item.rate)).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => handleReturnQtyChange(index, '0')} className="text-red-500 hover:text-red-700" title="Clear return quantity">
                          <Trash2 size={16} className="mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex-shrink-0 mt-auto">
            {/* Totals */}
            <div className="grid grid-cols-3 gap-4 p-4 border-t border-gray-200 bg-gray-50">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Total Items Returned</label>
              <div className="border border-gray-300 rounded px-3 py-1.5 bg-white text-center font-bold">{totals.itemsCount}</div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Total Quantity Returned</label>
              <div className="border border-gray-300 rounded px-3 py-1.5 bg-white text-center font-bold text-yellow-600">{totals.qtyCount.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Total Debit / Claim Amount</label>
              <div className="flex items-center justify-between border-b-2 border-gray-200 pb-1">
                <span className="bg-yellow-400 text-black font-bold px-2 py-0.5 rounded text-xs">TOTAL CLAIM</span>
                <span className="font-bold text-lg">{totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 bg-gray-50 flex justify-end">
             <button onClick={handleSave} disabled={saveMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-6 rounded shadow-md flex items-center gap-2 disabled:opacity-50">
                <Save size={18} /> {saveMutation.isPending ? 'SAVING...' : 'SAVE PURCHASE RETURN (F10)'}
             </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturn;

