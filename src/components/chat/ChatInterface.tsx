import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  Download,
  Copy,
  Check,
  Cpu,
  BookOpen,
  Terminal,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, ClassificationResult, User } from '../../types/index.js';
import { CodeBlock } from '../common/CodeBlock.js';
import { api } from '../../services/api.js';

interface ChatInterfaceProps {
  conversationId: string | null;
  messages: ChatMessage[];
  onSendMessage: (text: string, modelChoice: string) => Promise<void>;
  isLoading: boolean;
  user: User | null;
  onNavigateToPricing: () => void;
}

const STARTER_PROMPTS = [
  {
    category: 'Loops',
    title: 'List Comprehensions',
    query: 'How do list comprehensions work in Python and why are they faster than loops?',
  },
  {
    category: 'NumPy',
    title: 'Array Broadcasting',
    query: 'What is NumPy array broadcasting and vectorization with a code example?',
  },
  {
    category: 'OOP',
    title: 'Classes and __init__',
    query: 'How do classes, inheritance, and the __init__ constructor work in Python?',
  },
  {
    category: 'Functions',
    title: '*args and **kwargs',
    query: 'Explain the difference between *args and **kwargs in Python functions.',
  },
];

export function ChatInterface({
  conversationId,
  messages,
  onSendMessage,
  isLoading,
  user,
  onNavigateToPricing,
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('XGBoost Baseline');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text, selectedModel);
  };

  const handleCopyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = (format: 'markdown' | 'json') => {
    if (messages.length === 0) return;

    let content = '';
    let filename = `pybot_chat_${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      filename += '.json';
    } else {
      content = messages
        .map((m) => {
          const roleLabel = m.role === 'user' ? '### User' : '### PyBot AI Assistant';
          const meta = m.category ? `*Category: ${m.category} | Confidence: ${Math.round((m.confidence || 0) * 100)}%*\n` : '';
          const code = m.codeSnippet ? `\n\`\`\`python\n${m.codeSnippet}\n\`\`\`\n` : '';
          return `${roleLabel} (${new Date(m.timestamp).toLocaleTimeString()})\n${meta}\n${m.content}\n${code}`;
        })
        .join('\n---\n\n');
      filename += '.md';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-slate-950">
      {/* Chat Top Sub-bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-200">ML Question Classifier:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="XGBoost Baseline">XGBoost Baseline (94.8% Acc)</option>
            <option value="Scikit-learn Logistic Regression">Logistic Regression (92.5% Acc)</option>
            <option value="Multinomial Naive Bayes">Naive Bayes (89.2% Acc)</option>
            <option value="TensorFlow / Keras MLP (Neural Net)">Neural Network MLP (95.5% Acc)</option>
          </select>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportChat('markdown')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition text-[11px]"
              title="Export thread to Markdown"
            >
              <Download className="h-3 w-3" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={() => handleExportChat('json')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition text-[11px]"
              title="Export thread to JSON"
            >
              <Download className="h-3 w-3" />
              <span>Export JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[420px] max-w-2xl mx-auto text-center space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                PyBot AI – Python Programming Assistant
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Ask Python questions in natural language. Powered by machine learning classification, verified
                knowledge base retrieval, and instant browser Python 3 execution.
              </p>
            </div>

            {/* Prompt Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter.title}
                  onClick={() => {
                    setInputText(starter.query);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:bg-white dark:hover:bg-slate-900 transition group text-left shadow-xs"
                >
                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    {starter.category}
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {starter.query}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-mono font-bold text-xs shadow-xs mt-1">
                      py
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-xs ${
                      isUser
                        ? 'bg-slate-900 text-white dark:bg-slate-800 rounded-br-xs'
                        : 'bg-slate-100/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {/* Header info for assistant */}
                    {!isUser && (
                      <div className="flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                        {m.category && (
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {m.category}
                          </span>
                        )}
                        {m.confidence !== undefined && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {Math.round(m.confidence * 100)}% match
                            </span>
                          </>
                        )}
                        {m.source && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              {m.source === 'knowledge_base' ? (
                                <>
                                  <BookOpen className="h-3 w-3 text-emerald-500" />
                                  <span>Verified KB</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                  <span>Gemini AI</span>
                                </>
                              )}
                            </span>
                          </>
                        )}
                        <span className="ml-auto text-[10px] tabular-nums">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="prose dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>

                    {/* Code Snippet with Run in Python 3 button */}
                    {m.codeSnippet && (
                      <CodeBlock
                        code={m.codeSnippet}
                        language="python"
                        title="Python Solution"
                      />
                    )}

                    {/* Action footer */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {isUser && new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleCopyMessage(m.id, `${m.content}\n${m.codeSnippet || ''}`)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs flex items-center gap-1 transition"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-slate-500 dark:text-slate-400 text-xs py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-mono font-bold text-xs shadow-xs animate-pulse">
                  py
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  <span>Classifying question and retrieving Python solution...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask any Python question (e.g. 'How do decorators work in Python?')..."
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 pr-14 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition shadow-inner"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-amber-500 text-white hover:bg-slate-800 dark:hover:bg-amber-600 disabled:opacity-30 disabled:pointer-events-none transition active:scale-95 shadow-xs"
            aria-label="Send question"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>

        <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>Python 3.10 runtime sandbox ready</span>
          {user && (
            <span className="tabular-nums">
              Daily quota: {user.questionsUsedToday} / {user.questionLimitDaily} used
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
