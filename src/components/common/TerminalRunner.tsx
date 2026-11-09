import React, { useState } from 'react';
import { Play, RotateCcw, Terminal, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { PythonExecutionResult } from '../../types/index.js';

const CODE_TEMPLATES = [
  {
    name: 'Vector Dot Product (NumPy simulation)',
    code: `# Vector Dot Product and Euclidean Norm Simulation
import math

def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

def l2_norm(v):
    return math.sqrt(sum(x**2 for x in v))

vec_a = [3.0, 4.0, 1.0, 5.0]
vec_b = [1.0, 2.0, 0.5, 2.0]

dot = dot_product(vec_a, vec_b)
norm_a = l2_norm(vec_a)
norm_b = l2_norm(vec_b)
cosine_sim = dot / (norm_a * norm_b)

print(f"Vector A: {vec_a}")
print(f"Vector B: {vec_b}")
print(f"Dot Product: {dot:.4f}")
print(f"Cosine Similarity: {cosine_sim:.4f}")
`,
  },
  {
    name: 'List Comprehension & Filtering',
    code: `# List Comprehensions vs Filter
words = ["python", "ai", "machine", "learning", "data", "science", "saas"]

# Filter uppercase words longer than 4 chars
long_caps = [w.upper() for w in words if len(w) > 4]

# Character frequencies dictionary comprehension
char_counts = {w: len(w) for w in words}

print("Original words:", words)
print("Filtered long words (caps):", long_caps)
print("Length mappings:", char_counts)
`,
  },
  {
    name: 'Binary Search Algorithm',
    code: `# Binary Search Algorithm Implementation
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    steps = 0
    
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid, steps
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1, steps

dataset = sorted([12, 45, 2, 88, 19, 74, 33, 56, 91, 104, 3, 27])
target = 74

idx, steps = binary_search(dataset, target)
print(f"Sorted Array: {dataset}")
print(f"Found target {target} at index {idx} in {steps} steps (O(log n)).")
`,
  },
  {
    name: 'Custom Exception & OOP Bank Account',
    code: `# Custom Exception & OOP Class
class OverdraftLimitExceeded(Exception):
    """Raised when withdrawal exceeds balance + overdraft allowance."""
    pass

class CheckingAccount:
    def __init__(self, account_holder: str, initial_balance: float = 0.0, overdraft_limit: float = 50.0):
        self.account_holder = account_holder
        self.balance = initial_balance
        self.overdraft_limit = overdraft_limit

    def withdraw(self, amount: float):
        if amount > (self.balance + self.overdraft_limit):
            raise OverdraftLimitExceeded(f"Withdrawal of \${amount} exceeds limit (\${self.balance + self.overdraft_limit})")
        self.balance -= amount
        return self.balance

account = CheckingAccount("Guido van Rossum", initial_balance=100.0)
print(f"Account holder: {account.account_holder}, Balance: \${account.balance}")

try:
    account.withdraw(120.0)
    print(f"Successful withdrawal. New balance: \${account.balance}")
    account.withdraw(80.0)  # Should trigger exception
except OverdraftLimitExceeded as err:
    print(f"Transaction Rejected: {err}")
`,
  },
];

export function TerminalRunner() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [code, setCode] = useState(CODE_TEMPLATES[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PythonExecutionResult | null>(null);

  const handleTemplateChange = (idx: number) => {
    setSelectedTemplate(idx);
    setCode(CODE_TEMPLATES[idx].code);
    setResult(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await api.executePython(code);
      setResult(res);
    } catch (err: any) {
      setResult({
        stdout: '',
        stderr: err?.message || 'Error communicating with Python sandbox',
        exitCode: 1,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(CODE_TEMPLATES[selectedTemplate].code);
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-amber-500" />
            Interactive Python 3 Sandbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time Python 3.10 sandbox with sub-second execution, standard library, and instant stderr/stdout capture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {CODE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={tmpl.name}
                onClick={() => handleTemplateChange(idx)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  selectedTemplate === idx
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tmpl.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{isRunning ? 'Running...' : 'Run Code (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Output Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[460px]">
        {/* Editor Box */}
        <div className="flex flex-col rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/60 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500/80 inline-block" />
              <span>main.py</span>
            </div>
            <span>Python 3.10 UTF-8</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRun();
              }
            }}
            placeholder="# Write Python code here..."
            className="flex-1 w-full bg-transparent p-4 font-mono text-xs leading-relaxed text-emerald-300/90 outline-none resize-none selection:bg-amber-500/30"
            spellCheck={false}
          />
        </div>

        {/* Terminal Output Box */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-black overflow-hidden shadow-md font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-950 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Console Output</span>
            </div>

            {result && (
              <div className="flex items-center gap-3 text-[11px] tabular-nums">
                <span className="text-slate-400">{result.executionTimeMs} ms</span>
                <span
                  className={
                    result.exitCode === 0
                      ? 'text-emerald-400 font-semibold'
                      : 'text-rose-400 font-semibold'
                  }
                >
                  Exit {result.exitCode}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {isRunning ? (
              <div className="flex items-center gap-2 py-4 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                <span>Executing in sandbox...</span>
              </div>
            ) : result ? (
              <>
                {result.stdout && (
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">{result.stdout}</pre>
                )}
                {result.stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed bg-rose-950/20 p-2 rounded border border-rose-900/40">
                    {result.stderr}
                  </pre>
                )}
                {!result.stdout && !result.stderr && (
                  <p className="text-slate-500 italic">No output produced by script.</p>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
                <Sparkles className="h-8 w-8 text-slate-600 mb-2 opacity-50" />
                <p>Click "Run Code" to compile and execute Python in sandbox.</p>
                <p className="text-[11px] text-slate-600 mt-1">Press Ctrl+Enter to run instantly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
