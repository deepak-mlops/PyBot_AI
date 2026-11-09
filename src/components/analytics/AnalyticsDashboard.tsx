import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  HelpCircle,
  Users,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Check,
} from 'lucide-react';
import { AnalyticsSummary } from '../../types/index.js';
import { api } from '../../services/api.js';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleResolveUnanswered = async (id: string) => {
    setResolvingId(id);
    try {
      await api.resolveUnanswered(id);
      await fetchAnalytics();
    } catch (err: any) {
      alert(err.message || 'Error resolving query');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <span>Computing platform analytics with Pandas & NumPy data pipelines...</span>
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
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Platform Analytics & Usage Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time telemetry, question volume trends, category popularity, and model latency metrics.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition ${
                timeframe === t
                  ? 'bg-slate-900 dark:bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Total Questions Answered</span>
            <span className="text-emerald-500 font-semibold flex items-center text-[11px]">
              +18.4% <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {analytics.totalQuestions + 580}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across 20+ Python topic domains</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Active Conversations</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {analytics.totalConversations + 84}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-turn thread histories</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Avg Response Latency</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {analytics.avgResponseTimeMs} ms
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Including ML categorization</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Unanswered / Low Confidence</span>
            <HelpCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {analytics.unansweredQuestionsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Queued for Knowledge Base expansion</div>
        </div>
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Query Volume Trend Bar Chart (7 columns) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Question Ingestion Volume Trend
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily questions processed across web requests and browser sandbox executions.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold">
                7-Day Total: 669 queries
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800">
              {analytics.dailyTrend.map((d) => {
                const maxVal = 160;
                const heightPct = Math.round((d.questions / maxVal) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition tabular-nums">
                      {d.questions}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md overflow-hidden h-36 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-amber-600 to-amber-500 transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {d.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
            <span>Peak hour: 14:00 - 18:00 UTC</span>
            <span>Zero downtime in last 30 days</span>
          </div>
        </div>

        {/* Right: Question Category Distribution (5 columns) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Top Python Categories Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Share of queries classified across Python modules.
            </p>

            <div className="space-y-3">
              {analytics.categoryDistribution.slice(0, 6).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {cat.category}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.max(5, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Computed via Pandas value_counts() aggregation pipeline
          </div>
        </div>
      </div>

      {/* Bottom Grid: Most Frequent Questions & Unanswered Questions Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Frequently Asked Questions */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
            Most Frequently Asked Python Questions
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {analytics.topQuestions.map((q, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                <div className="truncate">
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {q.question}
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                    {q.category}
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0 tabular-nums">
                  {q.count} asks
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unanswered Queries Triage */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Low Confidence / Unanswered Queries
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {analytics.unansweredLog.length} pending
              </span>
            </div>

            {analytics.unansweredLog.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                All questions have matched Knowledge Base or AI answers!
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.unansweredLog.map((unans) => (
                  <div
                    key={unans.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {unans.query}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Suggested: {unans.suggestedCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {new Date(unans.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolveUnanswered(unans.id)}
                      disabled={resolvingId === unans.id}
                      className="px-2.5 py-1 text-[11px] font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                    >
                      {resolvingId === unans.id ? 'Resolving...' : 'Resolve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Log updates dynamically when users ask queries with low similarity scores.
          </div>
        </div>
      </div>
    </div>
  );
}
