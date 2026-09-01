import { useState, useEffect } from 'react';
import Editor from 'react-simple-wysiwyg';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, Save, X, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const storeSettingsSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  shopAddress: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  currencySymbol: z.string().min(1, 'Currency symbol is required'),
  currencyPosition: z.string(),
  invoicePrefix: z.string().min(1, 'Prefix is required'),
  invoiceNotes: z.string().optional(),
  signatureImage: z.string().optional(),
  yearlyInvoiceReset: z.boolean().optional(),
});

type StoreSettingsValues = z.infer<typeof storeSettingsSchema>;

const Settings = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [devPasswordInput, setDevPasswordInput] = useState('');
  const [resetType, setResetType] = useState<'transactions' | 'master' | 'full' | ''>('');

  // Fetch Settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    }
  });

  const { register: registerStore, handleSubmit: handleSubmitStore, reset: resetStoreForm, setValue: setValueStore, watch: watchStore, formState: { errors: storeErrors } } = useForm<StoreSettingsValues>({
    resolver: zodResolver(storeSettingsSchema) as any,
  });

  useEffect(() => {
    if (settings) {
      resetStoreForm({
        shopName: settings.shopName || '',
        shopAddress: settings.shopAddress || '',
        phone: settings.phone || '',
        email: settings.email || '',
        currencySymbol: settings.currencySymbol || 'RM',
        currencyPosition: settings.currencyPosition || 'before',
        invoicePrefix: settings.invoicePrefix || 'INV-',
        invoiceNotes: settings.invoiceNotes || '',
        signatureImage: settings.signatureImage || '',
        yearlyInvoiceReset: settings.yearlyInvoiceReset || false,
      });
    }
  }, [settings, resetStoreForm]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: StoreSettingsValues) => api.post('/settings', data),
    onSuccess: () => {
      toast.success('Store settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error('Failed to update settings')
  });

  const verifyDevMutation = useMutation({
    mutationFn: (password: string) => api.post('/settings/verify-dev-password', { password }),
    onSuccess: () => {
      setIsDevUnlocked(true);
      toast.success('Developer zone unlocked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid developer password');
    }
  });

  const resetDatabaseMutation = useMutation({
    mutationFn: (data: { type: string, password?: string }) => api.post('/settings/reset-database', data),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Database has been reset.');
      setShowResetModal(false);
      setResetConfirmation('');
      setResetType('');
      // Force refresh data
      queryClient.clear();
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset database');
      setShowResetModal(false);
    }
  });

  if (isLoading) return <div className="p-4">Loading settings...</div>;

  const onStoreSubmit = (data: StoreSettingsValues) => {
    updateSettingsMutation.mutate(data);
  };

  const handleReset = () => {
    if (resetConfirmation === 'TRUNCATE') {
      resetDatabaseMutation.mutate({ type: resetType, password: devPasswordInput });
    } else {
      toast.error('Please type TRUNCATE to confirm');
    }
  };

  const handleDevUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    verifyDevMutation.mutate(devPasswordInput);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-64px)] p-1 flex flex-col w-full">
      
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-2 px-2 gap-3 md:gap-0 mt-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#2563EB] flex items-center gap-2">
            <span className="text-[#F59E0B]"><SettingsIcon size={18} className="md:w-5 md:h-5" /></span>
            MY ACCOUNT & STORE SETTINGS
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">Manage company details, billing currency, shop address, and account password security</p>
        </div>
        <button type="button" onClick={() => navigate('/')} className="w-full md:w-auto justify-center bg-[#E11D48] text-white font-bold text-[14px] md:text-base px-4 py-2 rounded flex items-center gap-1 transition-colors shadow-sm hover:bg-[#BE123C]">
          <X size={14} /> Close
        </button>
      </div>

      <form onSubmit={handleSubmitStore(onStoreSubmit as any)} className="w-full px-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column - Store Settings */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
            <div className="bg-[#1E293B] text-white px-3 py-2 flex items-center gap-2 text-[14px] font-bold">
              <span className="text-[#F59E0B]"><Store size={16} /></span>
              Store & Business Profile Settings
            </div>
            
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Shop / Business Name *</label>
                <input
                  {...registerStore('shopName')}
                  className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {storeErrors.shopName && <p className="text-red-500 text-xs mt-1">{(storeErrors.shopName as any).message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Complete Shop Address</label>
                <textarea
                  {...registerStore('shopAddress')}
                  rows={2}
                  className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">Contact Phone Number</label>
                  <input
                    {...registerStore('phone')}
                    className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">Support Email</label>
                  <input
                    {...registerStore('email')}
                    className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-4 mt-2">
                <div className="flex items-center gap-2 text-[#475569] font-bold text-[13px] mb-2">
                  <span className="text-[#64748B]"><Store size={14} /></span> Currency & Regional Settings
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">Currency Symbol</label>
                    <input
                      {...registerStore('currencySymbol')}
                      className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">Currency Position</label>
                    <select
                      {...registerStore('currencyPosition')}
                      className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                    >
                      <option value="before">Before Amount (e.g. RM 100.00)</option>
                      <option value="after">After Amount (e.g. 100.00 RM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="bg-[#0F172A] hover:bg-[#334155] text-white px-4 py-1.5 rounded font-bold text-[13px] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save size={16} /> Save Store Settings
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column - Security & Reset */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
            <div className="bg-[#1E293B] text-white px-3 py-2 flex items-center gap-2 text-[14px] font-bold">
              <span className="text-[#F59E0B]"><SettingsIcon size={16} /></span>
              Invoice & Bill Numbering Settings
            </div>
            
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Invoice Number Prefix</label>
                <input
                  {...registerStore('invoicePrefix')}
                  className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                <p className="text-[11px] text-[#64748B] mt-1">Generated sales bills will use this prefix (e.g. <span className="text-[#2563EB] font-bold">{settings?.invoicePrefix || 'INV-'}788839</span>)</p>
              </div>
              <div className="flex items-center mt-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="yearlyInvoiceReset"
                    {...registerStore('yearlyInvoiceReset')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563EB]"></div>
                  <span className="ml-3 text-[12px] font-bold text-[#334155]">
                    Enable Auto Yearly Invoice Reset
                  </span>
                </label>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1 ml-[48px]">Automatically adds the current year to invoices (e.g. <span className="text-[#2563EB] font-bold">{settings?.invoicePrefix || 'INV-'}{new Date().getFullYear()}-00001</span>), causing the sequence to reset back to 1 every year.</p>
              
              <div className="mt-3">
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Invoice Footer Notes (Terms & Conditions)</label>
                <div className="border border-[#CBD5E1] rounded overflow-hidden">
                  <Editor
                    value={watchStore('invoiceNotes') || ''}
                    onChange={(e: any) => setValueStore('invoiceNotes', e.target.value)}
                    containerProps={{ className: 'html-content', style: { height: '150px', fontSize: '13px', color: 'black', fontWeight: '500' } }}
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-1">These notes will be printed at the bottom of all sales receipts. Supports multiple lines.</p>
              </div>
              
              {/* <div className="border-t border-[#E2E8F0] pt-4 mt-2">
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Authorised Signature Image</label>
                {watchStore('signatureImage') && (
                  <div className="mb-3 p-2 border border-[#E2E8F0] rounded-lg inline-block bg-[#F8FAFC]">
                    <img src={watchStore('signatureImage') || ''} alt="Signature" className="h-20 object-contain" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                        const toastId = toast.loading('Uploading signature...');
                        const response = await api.post('/settings/upload-signature', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        const url = response.data.url;
                        setValueStore('signatureImage', url, { shouldValidate: true, shouldDirty: true });
                        // Auto-save so the signature URL is persisted immediately
                        const currentValues = watchStore();
                        await api.post('/settings', { ...currentValues, signatureImage: url });
                        queryClient.invalidateQueries({ queryKey: ['settings'] });
                        toast.success('Signature uploaded and saved', { id: toastId });
                      } catch (error) {
                        toast.error('Failed to upload signature image');
                      }
                    }
                  }}
                  className="w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-base file:font-bold file:bg-[#EFF6FF] file:text-[#2563EB] hover:file:bg-[#DBEAFE] cursor-pointer"
                />
                <p className="text-[11px] text-[#64748B] mt-1">Upload a clear signature image. Best with transparent background (PNG).</p>
              </div> */}
              
              <div className="flex justify-end mt-2">
                <button 
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="bg-[#0F172A] hover:bg-[#334155] text-white px-4 py-1.5 rounded font-bold text-[13px] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save size={16} /> Save Invoice Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* Password Management temporarily disabled as requested */}
          {/*
          <form onSubmit={handleSubmitPassword(onPasswordSubmit as any)} className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
            <div className="bg-[#1E293B] text-white px-3 py-2 flex items-center gap-2 text-[14px] font-bold">
              <span className="text-[#38BDF8]"><Shield size={16} /></span>
              Security & Password Management
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">User Account</label>
                <div className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-base text-[#475569] font-medium">
                  Administrator (admin)
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Current Password *</label>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{(passwordErrors.currentPassword as any).message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">New Password *</label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{(passwordErrors.newPassword as any).message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Confirm New Password *</label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full px-2 py-1.5 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{(passwordErrors.confirmPassword as any).message}</p>}
              </div>

              <button 
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-2.5 rounded font-bold text-base flex justify-center items-center gap-2 transition-colors mt-2 disabled:opacity-50"
              >
                <Shield size={16} /> Update Account Password
              </button>
            </div>
          </form>
          */}

          <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-5">
            <h2 className="text-[14px] font-bold text-[#E11D48] flex items-center gap-2 mb-4">
              <AlertTriangle size={16} /> Database Reset Zone
            </h2>
            
            {!isDevUnlocked ? (
              <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-lg p-4 flex flex-col gap-3">
                <p className="text-[13px] text-[#BE123C] font-bold">
                  Developer zone locked. Enter developer password to access dangerous operations.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Developer Password"
                    value={devPasswordInput}
                    onChange={(e) => setDevPasswordInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#FDA4AF] rounded text-[13px] outline-none focus:border-[#E11D48]"
                  />
                  <button 
                    type="button"
                    onClick={handleDevUnlock}
                    disabled={verifyDevMutation.isPending || !devPasswordInput}
                    className="bg-[#E11D48] hover:bg-[#BE123C] text-white px-4 py-2 rounded font-bold text-[13px] transition-colors disabled:opacity-50"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#64748B] mb-2">
                  Select a section to reset. This action is irreversible.
                </p>
                
                <button type="button" 
                  onClick={() => { setResetType('transactions'); setShowResetModal(true); }}
                  className="w-full border border-[#F59E0B] text-[#D97706] hover:bg-[#FEF3C7] py-2.5 rounded font-bold text-base flex justify-center items-center gap-2 transition-colors"
                >
                  <AlertTriangle size={14} /> Reset Transactions Only
                </button>
                
                <button type="button" 
                  onClick={() => { setResetType('master'); setShowResetModal(true); }}
                  className="w-full border border-[#E11D48] text-[#E11D48] hover:bg-[#FFF1F2] py-2.5 rounded font-bold text-base flex justify-center items-center gap-2 transition-colors"
                >
                  <AlertTriangle size={14} /> Reset Master Data & Transactions
                </button>
                
                <button type="button" 
                  onClick={() => { setResetType('full'); setShowResetModal(true); }}
                  className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white py-2.5 rounded font-bold text-base flex justify-center items-center gap-2 transition-colors"
                >
                  <AlertTriangle size={14} /> Full Database Reset
                </button>
              </div>
            )}
          </div>

        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-sm overflow-hidden flex flex-col p-6">
            <div className="flex justify-center mb-4 text-[#E11D48]">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-center font-bold text-[18px] text-[#1E293B] mb-2">Are you sure?</h3>
            <p className="text-center text-[13px] text-[#64748B] mb-4">
              {resetType === 'transactions' && "All Sales, Purchases, Expenses, and Returns will be deleted. Stock quantities will be reset to 0. Master data will remain intact."}
              {resetType === 'master' && "All Master data (Products, Suppliers, Customers, etc) AND all transactions will be deleted."}
              {resetType === 'full' && "The entire database (except Settings and Users) will be permanently deleted."}
            </p>
            <p className="text-center text-[13px] text-[#BE123C] font-bold mb-4">This action is irreversible.</p>
            
            <label className="block text-[12px] font-bold text-[#334155] mb-1">Type TRUNCATE to confirm</label>
            <input 
              type="text"
              value={resetConfirmation}
              onChange={(e) => setResetConfirmation(e.target.value)}
              placeholder="TRUNCATE"
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-base outline-none focus:border-[#E11D48] mb-4 uppercase"
            />

            <div className="flex gap-2">
              <button type="button" 
                onClick={() => { setShowResetModal(false); setResetConfirmation(''); setResetType(''); }}
                className="flex-1 bg-[#F1F5F9] text-[#475569] font-bold py-2 rounded text-base hover:bg-[#E2E8F0]"
              >
                Cancel
              </button>
              <button type="button" 
                onClick={handleReset}
                disabled={resetConfirmation !== 'TRUNCATE' || resetDatabaseMutation.isPending}
                className="flex-1 bg-[#E11D48] text-white font-bold py-2 rounded text-base hover:bg-[#BE123C] disabled:opacity-50"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
