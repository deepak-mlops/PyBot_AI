import {
  AuthResponse,
  User,
  KnowledgeBaseItem,
  PythonCategory,
  ChatMessage,
  Conversation,
  ModelComparisonData,
  ClassificationResult,
  PythonExecutionResult,
  SubscriptionPlan,
  Invoice,
  AnalyticsSummary,
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('pybot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.error) errorMsg = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; organization?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ user: User }>(res);
  },

  async updateProfile(data: Partial<User> & { password?: string }): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: User }>(res);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Python Code Execution
  async executePython(code: string, timeoutMs: number = 3000): Promise<PythonExecutionResult> {
    const res = await fetch(`${API_BASE}/python/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ code, timeoutMs }),
    });
    return handleResponse<PythonExecutionResult>(res);
  },

  // Knowledge Base
  async getKnowledgeBase(params?: { search?: string; category?: string; difficulty?: string }): Promise<{ items: KnowledgeBaseItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.difficulty) query.set('difficulty', params.difficulty);

    const res = await fetch(`${API_BASE}/kb?${query.toString()}`);
    return handleResponse<{ items: KnowledgeBaseItem[]; total: number }>(res);
  },

  async getCategories(): Promise<{ categories: PythonCategory[] }> {
    const res = await fetch(`${API_BASE}/kb/categories`);
    return handleResponse<{ categories: PythonCategory[] }>(res);
  },

  async createKbItem(item: Partial<KnowledgeBaseItem>): Promise<{ item: KnowledgeBaseItem }> {
    const res = await fetch(`${API_BASE}/kb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(item),
    });
    return handleResponse<{ item: KnowledgeBaseItem }>(res);
  },

  async updateKbItem(id: string, item: Partial<KnowledgeBaseItem>): Promise<{ item: KnowledgeBaseItem }> {
    const res = await fetch(`${API_BASE}/kb/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(item),
    });
    return handleResponse<{ item: KnowledgeBaseItem }>(res);
  },

  async deleteKbItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/kb/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // ML Engine
  async predictQuestion(query: string, model?: string): Promise<ClassificationResult> {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, model }),
    });
    return handleResponse<ClassificationResult>(res);
  },

  async getModelMetrics(): Promise<ModelComparisonData> {
    const res = await fetch(`${API_BASE}/ml/metrics`);
    return handleResponse<ModelComparisonData>(res);
  },

  async retrainModels(): Promise<{ success: boolean; message: string; metrics: ModelComparisonData }> {
    const res = await fetch(`${API_BASE}/ml/train`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string; metrics: ModelComparisonData }>(res);
  },

  // Chat & Conversations
  async askChatbot(data: { question: string; conversationId?: string; modelChoice?: string }): Promise<{
    conversationId: string;
    message: ChatMessage;
    mlResult: ClassificationResult;
    latencyMs: number;
    userQuotaRemaining?: number;
  }> {
    const res = await fetch(`${API_BASE}/chat/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getConversations(): Promise<{ conversations: Conversation[] }> {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ conversations: Conversation[] }>(res);
  },

  async getConversation(id: string): Promise<{ conversation: Conversation; messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ conversation: Conversation; messages: ChatMessage[] }>(res);
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async clearConversations(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Subscription & Billing
  async getSubscriptionPlans(): Promise<{ plans: SubscriptionPlan[] }> {
    const res = await fetch(`${API_BASE}/subscription/plans`);
    return handleResponse<{ plans: SubscriptionPlan[] }>(res);
  },

  async getCurrentSubscription(): Promise<{
    plan: SubscriptionPlan;
    questionsUsedToday: number;
    questionLimitDaily: number;
    resetTimeHours: number;
  }> {
    const res = await fetch(`${API_BASE}/subscription/current`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async checkoutSubscription(planId: string, paymentMethod?: string, currency: 'USD' | 'INR' = 'USD'): Promise<{
    success: boolean;
    message: string;
    user: User;
    invoice: Invoice;
  }> {
    const res = await fetch(`${API_BASE}/subscription/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ planId, paymentMethod, currency }),
    });
    return handleResponse(res);
  },

  async getInvoices(): Promise<{ invoices: Invoice[] }> {
    const res = await fetch(`${API_BASE}/subscription/invoices`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ invoices: Invoice[] }>(res);
  },

  // Admin & Analytics
  async getAdminAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<AnalyticsSummary>(res);
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ users: User[] }>(res);
  },

  async updateAdminUser(id: string, updates: { role?: string; plan?: string; resetQuota?: boolean }): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    return handleResponse<{ user: User }>(res);
  },

  async getUnansweredQueries(): Promise<{ unanswered: any[] }> {
    const res = await fetch(`${API_BASE}/admin/unanswered`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ unanswered: any[] }>(res);
  },

  async resolveUnanswered(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/unanswered/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ id }),
    });
    return handleResponse<{ success: boolean }>(res);
  },
};
