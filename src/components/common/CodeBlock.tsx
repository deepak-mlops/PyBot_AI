import React, { useState } from 'react';
import { Copy, Check, Play, Terminal, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { PythonExecutionResult } from '../../types/index.js';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  runnable?: boolean;
}

export function CodeBlock({ code, language = 'python', title, runnable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState<PythonExecutionResult | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowConsole(true);
    try {
      const result = await api.executePython(code);
      setExecResult(result);
    } catch (err: any) {
      setExecResult({
        stdout: '',
        stderr: err?.message || 'Execution error',
        exitCode: 1,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-lg text-slate-200">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700 inline-block" />
          <span>{title || language.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-2">
          {runnable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-amber-400 transition hover:bg-amber-500/20 active:scale-95 disabled:opacity-50 font-medium"
              title="Execute in Python 3 Sandbox"
            >
              {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              <span>{isRunning ? 'Running...' : 'Run Python 3'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 active:scale-95 font-medium"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="relative overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-300/90 dark:text-emerald-300">
        <pre className="selection:bg-amber-500/30">
          <code>{code}</code>
        </pre>
      </div>

      {/* Inline Execution Console */}
      {showConsole && (
        <div className="border-t border-slate-800 bg-slate-950 p-3 text-xs font-mono">
          <div className="mb-2 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Terminal Output (Python 3.10)</span>
            </div>
            {execResult && (
              <div className="flex items-center gap-3 text-[11px] tabular-nums">
                <span>{execResult.executionTimeMs}ms</span>
                <span className={execResult.exitCode === 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  Exit: {execResult.exitCode}
                </span>
                <button
                  onClick={() => setShowConsole(false)}
                  className="text-slate-500 hover:text-slate-300 ml-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {isRunning ? (
            <div className="flex items-center gap-2 py-2 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              <span>Executing snippet in isolated Python 3 sandbox...</span>
            </div>
          ) : execResult ? (
            <div className="rounded bg-black/60 p-2.5 space-y-1">
              {execResult.stdout && (
                <pre className="text-emerald-400 whitespace-pre-wrap">{execResult.stdout}</pre>
              )}
              {execResult.stderr && (
                <pre className="text-rose-400 whitespace-pre-wrap">{execResult.stderr}</pre>
              )}
              {!execResult.stdout && !execResult.stderr && (
                <span className="text-slate-500 italic">Program executed successfully with no standard output.</span>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
