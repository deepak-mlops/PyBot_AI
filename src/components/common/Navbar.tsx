import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Sun, Moon, Sparkles, User as UserIcon, LogOut, Shield } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenProfile: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export function Navbar({ currentView, onNavigate, onOpenProfile, onOpenAuthModal }: NavbarProps) {
  const { user, logout, quickDemoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-8 border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-left group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-mono font-bold text-sm shadow-xs transition group-hover:scale-105">
            py
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            PyBot AI
          </span>
        </button>
      </div>

      {/* Zone 2: 4–5 concise single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onNavigate('chat')}
          className={`whitespace-nowrap transition-colors ${
            currentView === 'chat'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          AI Chatbot
        </button>
        <button
          onClick={() => onNavigate('kb')}
          className={`whitespace-nowrap transition-colors ${
            currentView === 'kb'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Knowledge Base
        </button>
        <button
          onClick={() => onNavigate('ml')}
          className={`whitespace-nowrap transition-colors ${
            currentView === 'ml'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          ML Workbench
        </button>
        <button
          onClick={() => onNavigate('sandbox')}
          className={`whitespace-nowrap transition-colors ${
            currentView === 'sandbox'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Python Sandbox
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className={`whitespace-nowrap transition-colors ${
            currentView === 'analytics'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onNavigate('pricing')}
          className={`whitespace-nowrap transition-colors ${
            currentView === 'pricing'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pricing
        </button>
      </nav>

      {/* Zone 3: 1 primary action & user profile / theme controls */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-[10px]">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
              <span className="rounded bg-slate-200 dark:bg-slate-700 px-1 py-0.2 text-[9px] uppercase tracking-wider font-bold">
                {user.plan}
              </span>
            </button>

            <button
              onClick={logout}
              className="rounded-lg p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => quickDemoLogin('user')}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              title="Instant login with demo student/developer profile"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Demo User</span>
            </button>

            <button
              onClick={() => quickDemoLogin('admin')}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              title="Instant login with admin profile"
            >
              <Shield className="h-3 w-3 text-amber-500" />
              <span>Demo Admin</span>
            </button>

            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Log in
            </button>

            <button
              onClick={() => onOpenAuthModal('register')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg shadow-sm transition active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
