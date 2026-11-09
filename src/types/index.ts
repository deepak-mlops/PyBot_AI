export type Role = 'user' | 'admin';

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: PlanType;
  questionsUsedToday: number;
  questionLimitDaily: number;
  createdAt: string;
  avatar?: string;
  organization?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PythonCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  itemCount?: number;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  question: string;
  answer: string;
  codeSnippet: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  updatedAt: string;
  usageCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  codeSnippet?: string;
  category?: string;
  confidence?: number;
  modelUsed?: string;
  source?: 'knowledge_base' | 'gemini_ai' | 'hybrid' | 'system';
  matchedKbItem?: {
    id: string;
    title: string;
    category: string;
  };
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface MLModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTimeMs: number;
  inferenceTimeMs: number;
  epochs?: number;
  loss?: number;
  status: 'active' | 'evaluating' | 'baseline';
}

export interface ClassificationResult {
  predictedCategory: string;
  confidence: number;
  allProbabilities: { category: string; probability: number }[];
  matchedKbItem?: KnowledgeBaseItem;
  similarityScore: number;
  processingTimeMs: number;
}

export interface ModelComparisonData {
  models: MLModelMetrics[];
  categories: string[];
  confusionMatrix: number[][];
  totalSamples: number;
  featureCount: number;
  activeModel: string;
}

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  error?: string;
}

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  priceMonthlyUSD: number;
  priceMonthlyINR: number;
  tagline: string;
  questionLimitDaily: number;
  features: string[];
  popular?: boolean;
}

export interface Invoice {
  id: string;
  userId: string;
  plan: PlanType;
  amountUSD: number;
  amountINR: number;
  currency: 'USD' | 'INR';
  status: 'paid' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
  transactionId: string;
  invoiceUrl?: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalQuestions: number;
  totalConversations: number;
  unansweredQuestionsCount: number;
  avgResponseTimeMs: number;
  dailyTrend: { date: string; questions: number; users: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  topQuestions: { question: string; category: string; count: number }[];
  unansweredLog: { id: string; query: string; timestamp: string; suggestedCategory: string }[];
}
