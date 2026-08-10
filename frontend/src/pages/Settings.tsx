import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, Shield, AlertTriangle, Save, X, Settings as SettingsIcon } from 'lucide-react';
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
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type StoreSettingsValues = z.infer<typeof storeSettingsSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const Settings = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');

  // Fetch Settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    }
  });

  const { register: registerStore, handleSubmit: handleSubmitStore, reset: resetStoreForm, formState: { errors: storeErrors } } = useForm<StoreSettingsValues>({
    resolver: zodResolver(storeSettingsSchema) as any,
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema) as any,
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

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordValues) => api.post('/auth/change-password', data),
    onSuccess: (res) => {
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        toast.success('Password updated successfully');
        resetPasswordForm();
      }
    },
    onError: () => toast.error('Failed to update password')
  });

  const resetDatabaseMutation = useMutation({
    mutationFn: () => api.post('/settings/reset-database'),
    onSuccess: () => {
      toast.success('Database has been completely reset.');
      setShowResetModal(false);
      setResetConfirmation('');
      // Force refresh data
      queryClient.clear();
      window.location.reload();
    },
    onError: () => {
      toast.error('Failed to reset database');
      setShowResetModal(false);
    }
  });

  if (isLoading) return <div className="p-4">Loading settings...</div>;

  const onStoreSubmit = (data: StoreSettingsValues) => {
    updateSettingsMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordValues) => {
    updatePasswordMutation.mutate(data);
  };

  const handleReset = () => {
    if (resetConfirmation === 'RESET') {
      resetDatabaseMutation.mutate();
    } else {
      toast.error('Please type RESET to confirm');
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-64px)] p-4 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#2563EB] flex items-center gap-2">
            <span className="text-[#F59E0B]"><SettingsIcon size={20} /></span>
            MY ACCOUNT & STORE SETTINGS
          </h1>
          <p className="text-[12px] text-[#64748B] mt-1">Manage company details, billing currency, shop address, and account password security</p>
        </div>
        <button type="button" onClick={() => navigate('/')} className="bg-[#E11D48] text-white font-bold text-[13px] px-4 py-2 rounded flex items-center gap-1 transition-colors shadow-sm hover:bg-[#BE123C]">
          <X size={14} /> Close
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column - Store Settings */}
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmitStore(onStoreSubmit as any)} className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
            <div className="bg-[#1E293B] text-white px-4 py-3 flex items-center gap-2 text-[13px] font-bold">
              <span className="text-[#F59E0B]"><Store size={16} /></span>
              Store & Business Profile Settings
            </div>
            
            <div className="p-5 flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Shop / Business Name *</label>
                <input
                  {...registerStore('shopName')}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {storeErrors.shopName && <p className="text-red-500 text-[11px] mt-1">{(storeErrors.shopName as any).message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Complete Shop Address</label>
                <textarea
                  {...registerStore('shopAddress')}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">Contact Phone Number</label>
                  <input
                    {...registerStore('phone')}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">Support Email</label>
                  <input
                    {...registerStore('email')}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-4 mt-2">
                <div className="flex items-center gap-2 text-[#475569] font-bold text-[13px] mb-3">
                  <span className="text-[#64748B]"><Store size={14} /></span> Currency & Regional Settings
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">Currency Symbol</label>
                    <input
                      {...registerStore('currencySymbol')}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">Currency Position</label>
                    <select
                      {...registerStore('currencyPosition')}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                    >
                      <option value="before">Before Amount (e.g. RM 100.00)</option>
                      <option value="after">After Amount (e.g. 100.00 RM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-4 mt-2">
                <div className="flex items-center gap-2 text-[#475569] font-bold text-[13px] mb-3">
                  <span className="text-[#64748B]"><Store size={14} /></span> Invoice & Bill Numbering Settings
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">Invoice Number Prefix</label>
                  <input
                    {...registerStore('invoicePrefix')}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                  />
                  <p className="text-[11px] text-[#64748B] mt-1">Generated sales bills will use this prefix (e.g. <span className="text-[#2563EB] font-bold">{settings?.invoicePrefix || 'INV-'}788839</span>)</p>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="bg-[#0F172A] hover:bg-[#334155] text-white px-5 py-2.5 rounded font-bold text-[13px] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save size={16} /> Save Store Settings
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Security & Reset */}
        <div className="flex flex-col gap-6">
          
          {/* Password Management */}
          <form onSubmit={handleSubmitPassword(onPasswordSubmit as any)} className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg overflow-hidden">
            <div className="bg-[#1E293B] text-white px-4 py-3 flex items-center gap-2 text-[13px] font-bold">
              <span className="text-[#38BDF8]"><Shield size={16} /></span>
              Security & Password Management
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">User Account</label>
                <div className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[13px] text-[#475569] font-medium">
                  Administrator (admin)
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Current Password *</label>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {passwordErrors.currentPassword && <p className="text-red-500 text-[11px] mt-1">{(passwordErrors.currentPassword as any).message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">New Password *</label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {passwordErrors.newPassword && <p className="text-red-500 text-[11px] mt-1">{(passwordErrors.newPassword as any).message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">Confirm New Password *</label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6]"
                />
                {passwordErrors.confirmPassword && <p className="text-red-500 text-[11px] mt-1">{(passwordErrors.confirmPassword as any).message}</p>}
              </div>

              <button 
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-2.5 rounded font-bold text-[13px] flex justify-center items-center gap-2 transition-colors mt-2 disabled:opacity-50"
              >
                <Shield size={16} /> Update Account Password
              </button>
            </div>
          </form>

          {/* Database Reset Zone */}
          <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-lg p-5">
            <h2 className="text-[14px] font-bold text-[#E11D48] flex items-center gap-2 mb-2">
              <AlertTriangle size={16} /> Database Reset Zone
            </h2>
            <p className="text-[12px] text-[#64748B] mb-4">
              Clear all demo items, categories, brands, customers, suppliers, sales, and purchases to start with a fresh clean empty database.
            </p>
            <button type="button" 
              onClick={() => setShowResetModal(true)}
              className="w-full border border-[#E11D48] text-[#E11D48] hover:bg-[#FFF1F2] py-2.5 rounded font-bold text-[13px] flex justify-center items-center gap-2 transition-colors"
            >
              <AlertTriangle size={14} /> Empty / Reset Database
            </button>
          </div>

        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-sm overflow-hidden flex flex-col p-6">
            <div className="flex justify-center mb-4 text-[#E11D48]">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-center font-bold text-[18px] text-[#1E293B] mb-2">Are you sure?</h3>
            <p className="text-center text-[13px] text-[#64748B] mb-6">
              This action is irreversible. All transactional data and master records will be permanently deleted. Only your User Account and Store Settings will remain.
            </p>
            
            <label className="block text-[12px] font-bold text-[#334155] mb-1">Type RESET to confirm</label>
            <input 
              type="text"
              value={resetConfirmation}
              onChange={(e) => setResetConfirmation(e.target.value)}
              placeholder="RESET"
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#E11D48] mb-4"
            />

            <div className="flex gap-2">
              <button type="button" 
                onClick={() => { setShowResetModal(false); setResetConfirmation(''); }}
                className="flex-1 bg-[#F1F5F9] text-[#475569] font-bold py-2 rounded text-[13px] hover:bg-[#E2E8F0]"
              >
                Cancel
              </button>
              <button type="button" 
                onClick={handleReset}
                disabled={resetConfirmation !== 'RESET' || resetDatabaseMutation.isPending}
                className="flex-1 bg-[#E11D48] text-white font-bold py-2 rounded text-[13px] hover:bg-[#BE123C] disabled:opacity-50"
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
