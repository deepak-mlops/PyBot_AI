import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { X, Sparkles, Shield, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';

interface AuthModalProps {
  initialMode: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const { login, register, quickDemoLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        onSuccess();
        onClose();
      } else if (mode === 'register') {
        await register(name, email, password, organization);
        onSuccess();
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email);
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await quickDemoLogin(role);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-mono font-bold text-base shadow-sm">
            py
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome Back to PyBot AI' : mode === 'register' ? 'Create your PyBot Account' : 'Reset your Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent Python programming assistant & ML classification platform.
          </p>
        </div>

        {/* Quick Demo Logins for instant evaluation */}
        {mode !== 'forgot' && (
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center">
              Instant One-Click Evaluation Logins
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('user')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:border-amber-500 hover:text-amber-500 transition shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Demo User (Pro)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:border-amber-500 hover:text-amber-500 transition shadow-xs"
              >
                <Shield className="h-3.5 w-3.5 text-amber-500" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Error / Success Notices */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-600 dark:text-emerald-400">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Developer"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Organization or School (optional)
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Stanford University or Self-Employed"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 shadow-sm transition active:scale-98 disabled:opacity-50 text-xs mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
