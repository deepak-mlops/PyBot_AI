import { spawn } from 'child_process';
import { PythonExecutionResult } from '../src/types/index.js';

export async function executePythonCode(code: string, timeoutMs: number = 3000): Promise<PythonExecutionResult> {
  const startTime = Date.now();

  // Basic security sanitization checks
  const dangerousPatterns = [
    /os\.system/i,
    /subprocess\./i,
    /shutil\.rmtree/i,
    /open\(.*['"]w['"].*\)/i, // Prevent arbitrary writing outside
    /__import__\(['"]os['"]\)/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        stdout: '',
        stderr: 'Security Notice: System shell execution or destructive file operations are disabled in this Python sandbox.',
        exitCode: 1,
        executionTimeMs: 0,
        error: 'Restricted module or operation detected.',
      };
    }
  }

  return new Promise((resolve) => {
    let stdoutData = '';
    let stderrData = '';
    let isTerminated = false;

    // Spawn python3 with -u (unbuffered binary stdout/stderr)
    const proc = spawn('python3', ['-u', '-c', code], {
      timeout: timeoutMs,
      env: {
        PYTHONIOENCODING: 'utf-8',
        PYTHONDONTWRITEBYTECODE: '1',
      },
    });

    const timer = setTimeout(() => {
      isTerminated = true;
      proc.kill('SIGKILL');
      resolve({
        stdout: stdoutData,
        stderr: `Execution timed out after ${timeoutMs}ms (infinite loop or high compute guard triggered).`,
        exitCode: 124,
        executionTimeMs: Date.now() - startTime,
        error: 'Timeout exceeded',
      });
    }, timeoutMs);

    proc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString('utf-8');
      if (stdoutData.length > 20000) {
        stdoutData = stdoutData.substring(0, 20000) + '\n... [Output truncated after 20KB]';
        proc.kill('SIGKILL');
      }
    });

    proc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString('utf-8');
      if (stderrData.length > 10000) {
        stderrData = stderrData.substring(0, 10000) + '\n... [Errors truncated]';
      }
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (isTerminated) return;
      resolve({
        stdout: stdoutData.trim(),
        stderr: stderrData.trim(),
        exitCode: code ?? 0,
        executionTimeMs: Date.now() - startTime,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (isTerminated) return;
      resolve({
        stdout: stdoutData,
        stderr: err.message,
        exitCode: 1,
        executionTimeMs: Date.now() - startTime,
        error: err.message,
      });
    });
  });
}
