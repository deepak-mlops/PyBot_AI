import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/common/Navbar.js';
import { Sidebar } from './components/common/Sidebar.js';
import { ChatInterface } from './components/chat/ChatInterface.js';
import { KnowledgeBaseExplorer } from './components/kb/KnowledgeBaseExplorer.js';
import { MLEngineWorkbench } from './components/ml/MLEngineWorkbench.js';
import { TerminalRunner } from './components/common/TerminalRunner.js';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard.js';
import { PricingPlans } from './components/pricing/PricingPlans.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { UserProfileModal } from './components/profile/UserProfileModal.js';
import { Conversation, ChatMessage } from './types/index.js';
import { api } from './services/api.js';

function AppContent() {
  const { user, updateUser } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'kb' | 'ml' | 'sandbox' | 'analytics' | 'pricing' | 'admin'>('landing');

  // Chat & Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load conversations on mount or user change
  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);
      if (res.conversations.length > 0 && !activeConversationId) {
        // Optionally select first conversation
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setActiveMessages([]);
      return;
    }
    api.getConversation(activeConversationId)
      .then((res) => setActiveMessages(res.messages))
      .catch((err) => console.error('Failed to load conversation messages:', err));
  }, [activeConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setCurrentView('chat');
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setActiveMessages([]);
    setCurrentView('chat');
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    try {
      await api.deleteConversation(id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setActiveMessages([]);
      }
      await loadConversations();
    } catch (err: any) {
      alert(err.message || 'Error deleting thread');
    }
  };

  const handleClearAllConversations = async () => {
    if (!confirm('Clear all conversation history?')) return;
    try {
      await api.clearConversations();
      setActiveConversationId(null);
      setActiveMessages([]);
      await loadConversations();
    } catch (err: any) {
      alert(err.message || 'Error clearing threads');
    }
  };

  const handleSendMessage = async (text: string, modelChoice: string) => {
    setIsChatLoading(true);
    try {
      const res = await api.askChatbot({
        question: text,
        conversationId: activeConversationId || undefined,
        modelChoice,
      });

      if (!activeConversationId) {
        setActiveConversationId(res.conversationId);
      }

      // Append assistant message
      setActiveMessages((prev) => [
        ...prev,
        {
          id: `u_${Date.now()}`,
          conversationId: res.conversationId,
          role: 'user',
          content: text,
          timestamp: new Date().toISOString(),
        },
        res.message,
      ]);

      if (user && res.userQuotaRemaining !== undefined) {
        updateUser({
          ...user,
          questionsUsedToday: user.questionLimitDaily - res.userQuotaRemaining,
        });
      }

      await loadConversations();
    } catch (err: any) {
      alert(err?.message || 'Chatbot request failed');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAskQuestionFromKb = (question: string) => {
    setCurrentView('chat');
    handleSendMessage(question, 'XGBoost Baseline');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const isWorkspaceView = currentView !== 'landing';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/20">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v as any)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={handleOpenAuth}
      />

      {/* Main Content Layout */}
      {isWorkspaceView ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Workspace Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={(v) => setCurrentView(v as any)}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onClearAllConversations={handleClearAllConversations}
            user={user}
          />

          {/* Central Workspace View */}
          <main className="flex-1 overflow-hidden">
            {currentView === 'chat' && (
              <ChatInterface
                conversationId={activeConversationId}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                user={user}
                onNavigateToPricing={() => setCurrentView('pricing')}
              />
            )}

            {currentView === 'kb' && (
              <KnowledgeBaseExplorer
                user={user}
                onAskQuestionInChat={handleAskQuestionFromKb}
              />
            )}

            {currentView === 'ml' && <MLEngineWorkbench />}

            {currentView === 'sandbox' && (
              <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
                <TerminalRunner />
              </div>
            )}

            {currentView === 'analytics' && <AnalyticsDashboard />}

            {currentView === 'pricing' && (
              <PricingPlans
                user={user}
                onUpdateUser={updateUser}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboard
                onNavigateToKb={() => setCurrentView('kb')}
                onNavigateToMl={() => setCurrentView('ml')}
              />
            )}
          </main>
        </div>
      ) : (
        /* Marketing Landing Page View */
        <LandingPage
          onStartChat={() => setCurrentView('chat')}
          onExploreKb={() => setCurrentView('kb')}
          onExploreMl={() => setCurrentView('ml')}
          onViewPricing={() => setCurrentView('pricing')}
        />
      )}

      {/* Modals */}
      {isAuthModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => loadConversations()}
        />
      )}

      {isProfileModalOpen && user && (
        <UserProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateUser={updateUser}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
