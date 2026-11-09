import React from 'react';
import {
  MessageSquare,
  BookOpen,
  Cpu,
  Terminal,
  BarChart3,
  CreditCard,
  Shield,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Conversation, User } from '../../types/index.js';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onClearAllConversations: () => void;
  user: User | null;
}

export function Sidebar({
  currentView,
  onNavigate,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAllConversations,
  user,
}: SidebarProps) {
  const navItems = [
    { id: 'chat', label: 'AI Chatbot', icon: MessageSquare },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'ml', label: 'ML Workbench', icon: Cpu },
    { id: 'sandbox', label: 'Python Sandbox', icon: Terminal },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'pricing', label: 'Subscriptions', icon: CreditCard },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: Shield });
  }

  const usagePercent = user
    ? Math.min(100, Math.round((user.questionsUsedToday / Math.max(1, user.questionLimitDaily)) * 100))
    : 0;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col h-[calc(100vh-4rem)] shrink-0">
      {/* Top Action: New Chat */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg shadow-xs transition active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>New Python Chat</span>
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
          Workspace
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Recent Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
          <span>Recent Threads</span>
          {conversations.length > 0 && (
            <button
              onClick={onClearAllConversations}
              className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 normal-case flex items-center gap-1 transition"
              title="Clear all chat history"
            >
              <span>Clear</span>
            </button>
          )}
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 px-4">
            <p>No chat history yet.</p>
            <p className="text-[11px] mt-1 text-slate-400/80">Start asking questions in Python!</p>
          </div>
        ) : (
          <div className="space-y-1 mt-1">
            {conversations.map((c) => {
              const isActive = currentView === 'chat' && activeConversationId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectConversation(c.id);
                    onNavigate('chat');
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 text-xs rounded-lg cursor-pointer transition ${
                    isActive
                      ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-6">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="truncate">{c.title || 'Untitled Thread'}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(c.id, e);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Quota / Plan Box */}
      {user && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{user.plan} Plan</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {user.questionsUsedToday} / {user.questionLimitDaily}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usagePercent > 85 ? 'bg-rose-500' : usagePercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          {user.plan === 'free' && (
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 py-1 transition"
            >
              <Sparkles className="h-3 w-3" />
              <span>Upgrade to Pro (150/day)</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
