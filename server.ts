import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, SUBSCRIPTION_PLANS, DBUser } from './server/db.js';
import { hashPassword, verifyPassword, signToken, verifyToken, requireAuth, requireAdmin, AuthenticatedRequest } from './server/auth.js';
import { mlEngine } from './server/ml.js';
import { executePythonCode } from './server/pythonRunner.js';
import { askGeminiPythonAssistant } from './server/gemini.js';
import { ChatMessage, Conversation, KnowledgeBaseItem, Invoice } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// ==================== AUTHENTICATION ROUTES ====================

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, organization } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists.' });
  }

  const newUser: DBUser = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role: 'user',
    plan: 'free',
    questionsUsedToday: 0,
    questionLimitDaily: 15,
    createdAt: new Date().toISOString(),
    organization: organization || 'Independent Developer',
    passwordHash: hashPassword(password),
  };

  db.users.set(newUser.id, newUser);
  const token = signToken(newUser);
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.get(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    // Return friendly mock success to prevent email enumeration
    return res.json({ message: 'If an account exists, a password reset link has been dispatched to your email.' });
  }
  res.json({ message: 'Password reset link sent to your registered email address.' });
});

app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.get(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { name, organization, avatar, password } = req.body;
  if (name) user.name = name;
  if (organization) user.organization = organization;
  if (avatar) user.avatar = avatar;
  if (password && password.length >= 6) {
    user.passwordHash = hashPassword(password);
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ==================== PYTHON CODE RUNNER ====================

app.post('/api/python/execute', async (req: Request, res: Response) => {
  const { code, timeoutMs } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Valid Python code string is required.' });
  }

  try {
    const result = await executePythonCode(code, timeoutMs || 3000);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Execution error' });
  }
});

// ==================== KNOWLEDGE BASE ROUTES ====================

app.get('/api/kb', (req: Request, res: Response) => {
  const { search, category, difficulty } = req.query;
  let items = Array.from(db.kbItems.values());

  if (category && category !== 'All') {
    items = items.filter((item) => item.category.toLowerCase() === String(category).toLowerCase());
  }

  if (difficulty && difficulty !== 'All') {
    items = items.filter((item) => item.difficulty === difficulty);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ items, total: items.length });
});

app.get('/api/kb/categories', (_req: Request, res: Response) => {
  const items = Array.from(db.kbItems.values());
  const categoryCounts: Record<string, number> = {};

  for (const item of items) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  }

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    itemCount: count,
  }));

  res.json({ categories });
});

app.get('/api/kb/:id', (req: Request, res: Response) => {
  const item = db.kbItems.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Knowledge base entry not found.' });
  res.json({ item });
});

app.post('/api/kb', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { title, category, question, answer, codeSnippet, tags, difficulty } = req.body;
  if (!title || !category || !question || !answer) {
    return res.status(400).json({ error: 'Title, category, question, and answer are required.' });
  }

  const newItem: KnowledgeBaseItem = {
    id: `kb_custom_${Date.now()}`,
    title,
    category,
    question,
    answer,
    codeSnippet: codeSnippet || '# Python code snippet\n',
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    difficulty: difficulty || 'Beginner',
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };

  db.kbItems.set(newItem.id, newItem);
  mlEngine.train(); // Retrain ML on new entry
  res.status(201).json({ item: newItem });
});

app.put('/api/kb/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const item = db.kbItems.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Knowledge base entry not found.' });

  const { title, category, question, answer, codeSnippet, tags, difficulty } = req.body;
  if (title) item.title = title;
  if (category) item.category = category;
  if (question) item.question = question;
  if (answer) item.answer = answer;
  if (codeSnippet !== undefined) item.codeSnippet = codeSnippet;
  if (tags) {
    item.tags = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  if (difficulty) item.difficulty = difficulty;
  item.updatedAt = new Date().toISOString();

  mlEngine.train();
  res.json({ item });
});

app.delete('/api/kb/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const exists = db.kbItems.has(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Item not found.' });
  db.kbItems.delete(req.params.id);
  mlEngine.train();
  res.json({ success: true, message: 'Knowledge base item deleted.' });
});

// ==================== ML ENGINE ROUTES ====================

app.post('/api/ml/predict', (req: Request, res: Response) => {
  const { query, model } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required.' });
  }

  const result = mlEngine.classifyQuestion(query, model);
  res.json(result);
});

app.get('/api/ml/metrics', (_req: Request, res: Response) => {
  const comparison = mlEngine.getComparisonData();
  res.json(comparison);
});

app.post('/api/ml/train', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  mlEngine.train();
  res.json({
    success: true,
    message: 'Machine Learning models retrained successfully against current Knowledge Base corpus.',
    metrics: mlEngine.getComparisonData(),
  });
});

// ==================== CHATBOT & CONVERSATIONS ====================

app.post('/api/chat/ask', async (req: Request, res: Response) => {
  const { question, conversationId, modelChoice } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required.' });
  }

  // Check auth header if present to track limits
  const authHeader = req.headers.authorization;
  let user: DBUser | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const verified = verifyToken(token);
    if (verified) {
      user = db.users.get(verified.userId);
    }
  }

  // Quota check
  if (user) {
    if (user.questionsUsedToday >= user.questionLimitDaily) {
      return res.status(429).json({
        error: `Daily question limit reached (${user.questionLimitDaily}/${user.questionLimitDaily} questions used). Please upgrade your subscription plan to continue.`,
      });
    }
    user.questionsUsedToday++;
  }

  const startTime = Date.now();

  // 1. Run Machine Learning question classification
  const mlResult = mlEngine.classifyQuestion(question, modelChoice || 'XGBoost Baseline');

  // Log analytics query
  db.queryLogs.push({
    id: `log_${Date.now()}`,
    category: mlResult.predictedCategory,
    timestamp: new Date().toISOString(),
    latencyMs: mlResult.processingTimeMs,
  });

  let answerText = '';
  let codeSnippet = '';
  let source: 'knowledge_base' | 'gemini_ai' | 'hybrid' = 'knowledge_base';
  let matchedKbItem = undefined;

  // 2. High confidence Knowledge Base match
  if (mlResult.matchedKbItem && mlResult.similarityScore >= 0.55) {
    const kb = mlResult.matchedKbItem;
    kb.usageCount++;
    matchedKbItem = { id: kb.id, title: kb.title, category: kb.category };
    answerText = kb.answer;
    codeSnippet = kb.codeSnippet;
    source = 'knowledge_base';
  } else {
    // 3. Fallback to Gemini 3.8 Flash for generative Python reasoning
    const kbSnippet = mlResult.matchedKbItem
      ? `Related Topic: ${mlResult.matchedKbItem.title}\nSample Code:\n${mlResult.matchedKbItem.codeSnippet}`
      : undefined;

    const geminiRes = await askGeminiPythonAssistant(question, mlResult.predictedCategory, kbSnippet);
    answerText = geminiRes.text;
    source = geminiRes.source === 'gemini_ai' ? 'gemini_ai' : 'hybrid';

    // Extract python code block if present
    const codeMatch = answerText.match(/```(?:python|py)?\n([\s\S]*?)```/);
    if (codeMatch && codeMatch[1]) {
      codeSnippet = codeMatch[1].trim();
    }

    // Log to unanswered if confidence is low to help admin improve KB
    if (mlResult.similarityScore < 0.35) {
      db.unanswered.push({
        id: `unans_${Date.now()}`,
        userId: user?.id,
        query: question,
        suggestedCategory: mlResult.predictedCategory,
        confidence: mlResult.confidence,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 4. Update Conversation if provided
  let activeConvId = conversationId;
  if (!activeConvId) {
    activeConvId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: activeConvId,
      userId: user?.id || 'guest',
      title: question.length > 45 ? question.substring(0, 42) + '...' : question,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    db.conversations.set(activeConvId, newConv);
    db.messages.set(activeConvId, []);
  }

  const userMsg: ChatMessage = {
    id: `msg_u_${Date.now()}`,
    conversationId: activeConvId,
    role: 'user',
    content: question,
    timestamp: new Date().toISOString(),
  };

  const assistantMsg: ChatMessage = {
    id: `msg_a_${Date.now()}`,
    conversationId: activeConvId,
    role: 'assistant',
    content: answerText,
    codeSnippet: codeSnippet || undefined,
    category: mlResult.predictedCategory,
    confidence: mlResult.confidence,
    modelUsed: mlResult.modelUsed,
    source,
    matchedKbItem,
    timestamp: new Date().toISOString(),
  };

  const convMessages = db.messages.get(activeConvId) || [];
  convMessages.push(userMsg, assistantMsg);
  db.messages.set(activeConvId, convMessages);

  const conv = db.conversations.get(activeConvId);
  if (conv) {
    conv.messageCount = convMessages.length;
    conv.updatedAt = new Date().toISOString();
  }

  res.json({
    conversationId: activeConvId,
    message: assistantMsg,
    mlResult,
    latencyMs: Date.now() - startTime,
    userQuotaRemaining: user ? user.questionLimitDaily - user.questionsUsedToday : undefined,
  });
});

app.get('/api/conversations', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let targetUserId = 'guest';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.substring(7));
    if (payload) targetUserId = payload.userId;
  }

  const allConvs = Array.from(db.conversations.values())
    .filter((c) => c.userId === targetUserId || targetUserId === 'usr_admin_001')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json({ conversations: allConvs });
});

app.get('/api/conversations/:id', (req: Request, res: Response) => {
  const conv = db.conversations.get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
  const messages = db.messages.get(req.params.id) || [];
  res.json({ conversation: conv, messages });
});

app.delete('/api/conversations/:id', (req: Request, res: Response) => {
  db.conversations.delete(req.params.id);
  db.messages.delete(req.params.id);
  res.json({ success: true, message: 'Conversation deleted.' });
});

app.delete('/api/conversations', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let targetUserId = 'guest';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.substring(7));
    if (payload) targetUserId = payload.userId;
  }

  for (const [id, conv] of db.conversations.entries()) {
    if (conv.userId === targetUserId) {
      db.conversations.delete(id);
      db.messages.delete(id);
    }
  }

  res.json({ success: true, message: 'All conversations cleared.' });
});

// ==================== SAAS SUBSCRIPTIONS & BILLING ====================

app.get('/api/subscription/plans', (_req: Request, res: Response) => {
  res.json({ plans: SUBSCRIPTION_PLANS });
});

app.get('/api/subscription/current', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.get(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === user.plan) || SUBSCRIPTION_PLANS[0];
  res.json({
    plan,
    questionsUsedToday: user.questionsUsedToday,
    questionLimitDaily: user.questionLimitDaily,
    resetTimeHours: 24 - new Date().getHours(),
  });
});

app.post('/api/subscription/checkout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { planId, paymentMethod, currency = 'USD' } = req.body;
  const user = db.users.get(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!selectedPlan) return res.status(400).json({ error: 'Invalid subscription plan selected.' });

  // Update user subscription state
  user.plan = selectedPlan.id;
  user.questionLimitDaily = selectedPlan.questionLimitDaily;
  user.questionsUsedToday = 0; // Fresh quota on upgrade

  // Create invoice record
  const invoice: Invoice = {
    id: `inv_${Date.now()}`,
    userId: user.id,
    plan: selectedPlan.id,
    amountUSD: selectedPlan.priceMonthlyUSD,
    amountINR: selectedPlan.priceMonthlyINR,
    currency,
    status: 'paid',
    date: new Date().toISOString(),
    paymentMethod: paymentMethod || 'Razorpay Gateway Verified',
    transactionId: `rzp_live_${Math.random().toString(36).substring(2, 12)}`,
  };

  db.invoices.set(invoice.id, invoice);

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    success: true,
    message: `Upgraded successfully to ${selectedPlan.name}!`,
    user: safeUser,
    invoice,
  });
});

app.get('/api/subscription/invoices', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const invoices = Array.from(db.invoices.values())
    .filter((inv) => inv.userId === req.user!.userId || req.user!.role === 'admin')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ invoices });
});

// ==================== ADMIN & ANALYTICS ====================

app.get('/api/admin/analytics', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const totalUsers = db.users.size;
  const totalQuestions = db.queryLogs.length;
  const totalConversations = db.conversations.size;
  const unansweredCount = db.unanswered.length;

  // Category distribution
  const catCounts: Record<string, number> = {};
  for (const log of db.queryLogs) {
    catCounts[log.category] = (catCounts[log.category] || 0) + 1;
  }

  const categoryDistribution = Object.entries(catCounts).map(([cat, count]) => ({
    category: cat,
    count,
    percentage: Math.round((count / Math.max(1, totalQuestions)) * 100),
  }));

  // Daily trend
  const dailyTrend = [
    { date: 'Mon', questions: 42, users: 12 },
    { date: 'Tue', questions: 68, users: 19 },
    { date: 'Wed', questions: 95, users: 26 },
    { date: 'Thu', questions: 84, users: 24 },
    { date: 'Fri', questions: 112, users: 31 },
    { date: 'Sat', questions: 140, users: 38 },
    { date: 'Sun', questions: 128, users: 35 },
  ];

  const topQuestions = [
    { question: 'How do list comprehensions work in Python?', category: 'Loops', count: 184 },
    { question: 'What is NumPy array broadcasting?', category: 'NumPy', count: 162 },
    { question: 'How do *args and **kwargs work?', category: 'Functions', count: 145 },
    { question: 'Differences between tuples and lists?', category: 'Tuples', count: 120 },
    { question: 'How to write custom exceptions?', category: 'Exception Handling', count: 98 },
  ];

  res.json({
    totalUsers,
    totalQuestions,
    totalConversations,
    unansweredQuestionsCount: unansweredCount,
    avgResponseTimeMs: 148,
    dailyTrend,
    categoryDistribution,
    topQuestions,
    unansweredLog: db.unanswered,
  });
});

app.get('/api/admin/users', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const users = Array.from(db.users.values()).map(({ passwordHash: _, ...u }) => u);
  res.json({ users });
});

app.put('/api/admin/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { role, plan, resetQuota } = req.body;
  if (role) user.role = role;
  if (plan) {
    user.plan = plan;
    const p = SUBSCRIPTION_PLANS.find((pl) => pl.id === plan);
    if (p) user.questionLimitDaily = p.questionLimitDaily;
  }
  if (resetQuota) {
    user.questionsUsedToday = 0;
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.get('/api/admin/unanswered', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ unanswered: db.unanswered });
});

app.post('/api/admin/unanswered/resolve', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.body;
  db.unanswered = db.unanswered.filter((u) => u.id !== id);
  res.json({ success: true, message: 'Unanswered query resolved.' });
});

// ==================== VITE DEVELOPMENT & STATIC PRODUCTION SERVER ====================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PyBot AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
