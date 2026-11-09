import React, { useState, useEffect } from 'react';
import { User, Invoice } from '../../types/index.js';
import { api } from '../../services/api.js';
import { X, User as UserIcon, Shield, CreditCard, Download, Check, Loader2 } from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (u: User) => void;
}

export function UserProfileModal({ user, onClose, onUpdateUser }: UserProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [organization, setOrganization] = useState(user.organization || '');
  const [newPassword, setNewPassword] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getInvoices().then((res) => {
      setInvoices(res.invoices);
      setLoadingInvoices(false);
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile({
        name,
        organization,
        password: newPassword.trim() || undefined,
      });
      onUpdateUser(res.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    const text = `INVOICE RECEIPT\n---------------------------------\nInvoice ID: ${inv.id}\nDate: ${new Date(inv.date).toLocaleString()}\nCustomer ID: ${inv.userId}\nPlan: ${inv.plan.toUpperCase()} Developer SaaS\nAmount Paid: ${inv.currency === 'INR' ? '₹' + inv.amountINR : '$' + inv.amountUSD}\nPayment Method: ${inv.paymentMethod}\nTransaction Ref: ${inv.transactionId}\nStatus: VERIFIED & PAID\n---------------------------------\nThank you for choosing PyBot AI!`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{user.email}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize font-semibold text-amber-600 dark:text-amber-400">
                {user.plan} Tier
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Organization / Team
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Acme AI Labs"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Update Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Account created on {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : saveSuccess ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : null}
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Profile'}</span>
            </button>
          </div>
        </form>

        {/* Billing & Invoice History */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" />
              <span>Billing & Invoices History</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {invoices.length} transactions
            </span>
          </div>

          {loadingInvoices ? (
            <div className="text-center py-4 text-xs text-slate-400">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
              No paid invoices yet. You are currently on the Free plan.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Invoice ID</th>
                    <th className="px-3 py-2.5">Plan</th>
                    <th className="px-3 py-2.5">Amount</th>
                    <th className="px-3 py-2.5">Method</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-mono text-slate-800 dark:text-slate-200">
                        {inv.id}
                      </td>
                      <td className="px-3 py-2.5 uppercase font-bold text-amber-500">
                        {inv.plan}
                      </td>
                      <td className="px-3 py-2.5 font-mono tabular-nums">
                        {inv.currency === 'INR' ? `₹${inv.amountINR}` : `\$${inv.amountUSD}`}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 truncate max-w-[120px]">
                        {inv.paymentMethod}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {new Date(inv.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(inv)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Download Receipt"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
