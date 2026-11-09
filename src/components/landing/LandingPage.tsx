import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  BookOpen,
  Terminal,
  ShieldCheck,
  Zap,
  Play,
  Copy,
  Check,
  CheckCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { CodeBlock } from '../common/CodeBlock.js';

interface LandingPageProps {
  onStartChat: () => void;
  onExploreKb: () => void;
  onExploreMl: () => void;
  onViewPricing: () => void;
}

export function LandingPage({ onStartChat, onExploreKb, onExploreMl, onViewPricing }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const heroSnippet = `# PyBot AI: Quick Python 3 Sandbox Demo
def analyze_fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

fib_10 = analyze_fibonacci(10)
print("Fibonacci terms:", fib_10)
print(f"Golden ratio approx: {fib_10[-1] / fib_10[-2]:.4f}")
`;

  const faqs = [
    {
      q: 'How does PyBot AI classify and answer Python questions?',
      a: 'PyBot AI uses a hybrid Natural Language Processing pipeline: first, incoming queries pass through text preprocessing, stopword removal, and TF-IDF feature extraction. Machine Learning models (such as XGBoost, Logistic Regression, and Naive Bayes) classify the query into one of 22 Python topics. We then perform Cosine Similarity matching against our verified Knowledge Base. If a query requires custom debugging, Gemini 3.8 Flash synthesizes verified Python solutions with executable code.',
    },
    {
      q: 'Can I execute Python code directly inside PyBot AI?',
      a: 'Yes. PyBot AI features a dedicated, secure Python 3.10 sandbox runner. Every code block rendered in the chat or knowledge base has a "Run Python 3" button that compiles and executes the snippet with stdout and stderr captured in real time.',
    },
    {
      q: 'What is included in the Free tier versus Pro?',
      a: 'The Free tier gives students 15 questions per day, access to all 22 Knowledge Base categories, and basic Python execution. Pro unlocks 150 questions per day, unlimited conversation threads, chat export to Markdown & JSON, high-priority execution, and model switching.',
    },
    {
      q: 'How does payment processing work for Indian and Global developers?',
      a: 'We support dual currency checkout (USD and INR) powered by a Razorpay architecture with instant UPI, QR code, debit/credit card payments, and server-side cryptographic signature verification.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Pitch (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Production-Ready Python SaaS Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-slate-100 text-balance">
              The Intelligent Python Programming Assistant.
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Ask any Python question in natural language. Powered by machine learning question classification,
              a verified Python standard library knowledge base, and instant browser Python 3 execution.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartChat}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-xl shadow-md transition active:scale-95"
              >
                <span>Launch AI Chatbot</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onExploreKb}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition"
              >
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>Explore Knowledge Base</span>
              </button>

              <button
                onClick={onExploreMl}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              >
                <Cpu className="h-4 w-4 text-amber-500" />
                <span>ML Benchmarks</span>
              </button>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-8 text-xs font-mono text-slate-500">
              <div>
                <strong className="block text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">22+</strong>
                <span>Python Topics</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <strong className="block text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">94.8%</strong>
                <span>XGBoost Accuracy</span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <strong className="block text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">&lt;150ms</strong>
                <span>Inference Latency</span>
              </div>
            </div>
          </div>

          {/* Right Live Interactive Demo Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950 p-4 shadow-2xl relative overflow-hidden text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500 text-white font-mono font-bold text-[10px]">
                    py
                  </div>
                  <span className="font-semibold text-slate-300">Live Assistant Preview</span>
                </div>
                <span className="rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-0.5 text-[10px] font-mono">
                  Loops · 96% Match
                </span>
              </div>

              <div className="text-xs text-slate-300 mb-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-sans">
                <span className="text-amber-400 font-semibold mr-1.5">User:</span>
                "How do I generate a Fibonacci series and calculate the golden ratio?"
              </div>

              <CodeBlock
                code={heroSnippet}
                language="python"
                title="Fibonacci Algorithm"
              />

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Click "Run Python 3" above to test code</span>
                <span className="text-emerald-400 font-mono">Python 3.10 sandbox</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Pillars */}
      <section className="px-6 py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Built for Python Developers & Students
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Complete Python Engineering Ecosystem
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              From beginner variable semantics to data science broadcasting, PyBot AI guides your learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                ML Question Classification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                TF-IDF n-gram vectorization with baseline comparison across Logistic Regression, Naive Bayes, and XGBoost.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Verified Knowledge Base
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                60+ curated solutions covering OOP, decorators, exception handling, NumPy, Pandas, Matplotlib, and ML.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Sub-Second Code Sandbox
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Execute code directly in an isolated Python 3 sandbox with execution timing and memory guards.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Enterprise SaaS Billing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tiered quotas (Free, Pro, Enterprise) with simulated Razorpay & UPI payment verification architecture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Everything you need to know about PyBot AI
          </h2>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 py-12 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Ready to master Python programming?</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Get instant solutions, runnable code examples, and machine learning classification today.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartChat}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md transition active:scale-95"
            >
              Start Free Today
            </button>
            <button
              onClick={onViewPricing}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            >
              View SaaS Plans
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <span className="font-mono text-amber-500 font-bold">py</span>
            <span>PyBot AI – Intelligent Python Programming Assistant</span>
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 PyBot AI SaaS Platform. Python 3.10 Runtime Environment.
          </div>
        </div>
      </footer>
    </div>
  );
}
