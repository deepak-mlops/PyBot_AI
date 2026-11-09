import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Database,
  Cpu,
  BarChart2,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Check,
  Plus,
} from 'lucide-react';
import { User, AnalyticsSummary } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AdminDashboardProps {
  onNavigateToKb: () => void;
  onNavigateToMl: () => void;
}

export function AdminDashboard({ onNavigateToKb, onNavigateToMl }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, analyticsData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminAnalytics(),
      ]);
      setUsers(userData.users);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRole = async (u: User, newRole: 'user' | 'admin') => {
    setUpdatingUserId(u.id);
    try {
      await api.updateAdminUser(u.id, { role: newRole });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdatePlan = async (u: User, newPlan: 'free' | 'pro' | 'enterprise') => {
    setUpdatingUserId(u.id);
    try {
      await api.updateAdminUser(u.id, { plan: newPlan });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating user plan');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleResetQuota = async (u: User) => {
    setUpdatingUserId(u.id);
    try {
      await api.updateAdminUser(u.id, { resetQuota: true });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error resetting quota');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <span>Loading PyBot AI Admin Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            PyBot AI Administrator Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            RBAC user controls, daily question quota management, and continuous knowledge base training.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToKb}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <Database className="h-3.5 w-3.5 text-amber-500" />
            <span>Manage Knowledge Base</span>
          </button>
          <button
            onClick={onNavigateToMl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg shadow-xs transition"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Retrain ML Pipeline</span>
          </button>
        </div>
      </div>

      {/* Admin Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Registered Users</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {users.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-role permissions enabled</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Knowledge Base Articles</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            22 Verified Topics
          </div>
          <div className="text-[11px] text-emerald-500 mt-1">100% TF-IDF Indexed</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">System Health</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>Nominal</span>
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Python 3 Sandbox active</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              User Accounts & Quota Administration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control RBAC roles, modify subscription tiers, and reset daily questions used.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">{users.length} accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Plan Tier</th>
                <th className="px-4 py-3 text-center">Daily Quota</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const isUpdating = updatingUserId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                      {u.organization && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{u.organization}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        disabled={isUpdating}
                        onChange={(e) => handleUpdateRole(u, e.target.value as any)}
                        className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={u.plan}
                        disabled={isUpdating}
                        onChange={(e) => handleUpdatePlan(u, e.target.value as any)}
                        className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs uppercase font-medium text-amber-600 dark:text-amber-400"
                      >
                        <option value="free">Free (15)</option>
                        <option value="pro">Pro (150)</option>
                        <option value="enterprise">Enterprise (∞)</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {u.questionsUsedToday} / {u.questionLimitDaily}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleResetQuota(u)}
                        disabled={isUpdating}
                        className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Reset daily usage counter back to 0"
                      >
                        {isUpdating ? 'Saving...' : 'Reset Quota'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
