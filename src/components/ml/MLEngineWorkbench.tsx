import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Layers,
  Sparkles,
  Zap,
  Loader2,
  Activity,
} from 'lucide-react';
import { ModelComparisonData, ClassificationResult } from '../../types/index.js';
import { api } from '../../services/api.js';

export function MLEngineWorkbench() {
  const [modelData, setModelData] = useState<ModelComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [testQuery, setTestQuery] = useState('How do I handle exceptions and divide by zero in a function?');
  const [testResult, setTestResult] = useState<ClassificationResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedBenchmarkModel, setSelectedBenchmarkModel] = useState('XGBoost Baseline');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getModelMetrics();
      setModelData(data);
    } catch (err) {
      console.error('Failed to fetch ML metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    handlePredict();
  }, []);

  const handlePredict = async () => {
    if (!testQuery.trim()) return;
    setIsPredicting(true);
    try {
      const res = await api.predictQuestion(testQuery, selectedBenchmarkModel);
      setTestResult(res);
    } catch (err) {
      console.error('Failed to run ML prediction:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await api.retrainModels();
      setModelData(res.metrics);
      await handlePredict();
    } catch (err: any) {
      alert(err?.message || 'Retraining failed');
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-amber-500" />
            Machine Learning Engine & Model Benchmarks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            NLP pipeline featuring TF-IDF vectorization, Cosine Similarity matching, and Multi-Class Question Classification.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          {isRetraining ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Retraining Models on Knowledge Base...</span>
            </>
          ) : (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retrain All Models</span>
            </>
          )}
        </button>
      </div>

      {/* Model Comparison Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Model Performance Comparison Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated across accuracy, precision, recall, and F1-score with 5-fold cross validation.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span>Vocabulary: <strong className="text-slate-800 dark:text-slate-200">{modelData?.featureCount || 184}</strong> terms</span>
            <span>Classes: <strong className="text-slate-800 dark:text-slate-200">{modelData?.categories.length || 20}</strong> categories</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3">Architecture</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
                <th className="px-4 py-3 text-right">Precision</th>
                <th className="px-4 py-3 text-right">Recall</th>
                <th className="px-4 py-3 text-right">F1-Score</th>
                <th className="px-4 py-3 text-right">Inference</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {modelData?.models.map((m) => {
                const isActive = m.name === selectedBenchmarkModel;
                return (
                  <tr
                    key={m.name}
                    onClick={() => setSelectedBenchmarkModel(m.name)}
                    className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isActive ? 'bg-amber-500/5 dark:bg-amber-500/10 font-semibold' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5 font-sans font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      <span>{m.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-800 dark:text-slate-200">
                      {(m.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-800 dark:text-slate-200">
                      {(m.precision * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-800 dark:text-slate-200">
                      {(m.recall * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-amber-600 dark:text-amber-400 font-bold">
                      {(m.f1Score * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-500">
                      {m.inferenceTimeMs} ms
                    </td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          m.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : m.status === 'evaluating'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Question Classification Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input & Prediction Details (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Live Question Classification Playground
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type any Python query to inspect real-time feature extraction and classification probabilities.
              </p>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Enter a Python query..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Model:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedBenchmarkModel}
                </span>
              </div>

              <button
                onClick={handlePredict}
                disabled={isPredicting || !testQuery.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isPredicting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                <span>Classify Query</span>
              </button>
            </div>
          </div>

          {/* Results summary box */}
          {testResult && (
            <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Predicted Category:</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {testResult.predictedCategory}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Model Confidence:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {(testResult.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Inference Latency:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                  {testResult.processingTimeMs} ms
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">KB Cosine Similarity:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  {testResult.similarityScore}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Category Probability Distribution (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <BarChart2 className="h-4 w-4 text-amber-500" />
              Category Probability Distribution (Softmax)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Normalized probability distribution across top candidate categories.
            </p>

            {testResult?.allProbabilities ? (
              <div className="space-y-3 font-mono text-xs">
                {testResult.allProbabilities.map((prob, idx) => {
                  const pct = Math.round(prob.probability * 100);
                  const isTop = idx === 0;
                  return (
                    <div key={prob.category} className="space-y-1">
                      <div className="flex justify-between font-sans text-xs">
                        <span className={isTop ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}>
                          {prob.category}
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTop ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Click "Classify Query" to calculate softmax probabilities.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sublinear TF scaling: 1 + log(tf)</span>
            <span>L2 Normalized vectors</span>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Heatmap */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Confusion Matrix ({selectedBenchmarkModel})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates prediction distribution across True vs Predicted Python categories.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Diagonal = True Positives (TP)</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[650px] space-y-1 font-mono text-[11px]">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-1 pb-1 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px]">
              <div className="col-span-3 font-sans truncate font-semibold">True \ Predicted</div>
              {modelData?.categories.slice(0, 9).map((cat) => (
                <div key={cat} className="text-center truncate" title={cat}>
                  {cat.split(' ')[0]}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {modelData?.categories.slice(0, 9).map((rowCat, rIdx) => (
              <div key={rowCat} className="grid grid-cols-12 gap-1 items-center py-0.5">
                <div className="col-span-3 font-sans text-xs text-slate-700 dark:text-slate-300 truncate" title={rowCat}>
                  {rowCat}
                </div>
                {modelData?.categories.slice(0, 9).map((colCat, cIdx) => {
                  const val = modelData.confusionMatrix[rIdx]?.[cIdx] ?? 0;
                  const isDiag = rIdx === cIdx;
                  return (
                    <div
                      key={colCat}
                      className={`text-center py-1.5 rounded transition tabular-nums font-semibold ${
                        isDiag
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : val > 0
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
