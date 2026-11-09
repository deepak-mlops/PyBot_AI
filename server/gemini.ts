import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function askGeminiPythonAssistant(
  question: string,
  categoryContext?: string,
  kbSnippetContext?: string
): Promise<{ text: string; model: string; source: 'gemini_ai' | 'knowledge_base' }> {
  const ai = getAIClient();

  if (!ai) {
    // If no API key configured, return high quality fallback
    return {
      text: kbSnippetContext || `PyBot AI Python Assistant: Here is the recommended Python approach for "${question}". Ensure proper indentation and standard PEP 8 naming conventions.`,
      model: 'PyBot Knowledge Base',
      source: 'knowledge_base',
    };
  }

  const systemInstruction = `You are PyBot AI, an intelligent, modern, production-grade Python programming assistant designed for students, beginners, and senior software engineers.
Your expertise covers:
- Python core fundamentals (syntax, types, loops, conditionals, functions, OOP, exceptions, file handling, modules)
- Python standard library & data structures (lists, tuples, dicts, sets, collections, itertools, functools)
- Data science & ML tools (NumPy, Pandas, Matplotlib, Scikit-learn, PyTorch, TensorFlow)
- Modern Python best practices (Python 3.10-3.13, type hints, match-case, walrus operator, list/dict comprehensions, PEP 8)

Guidelines:
1. Provide clear, accurate, concise, and Pythonic solutions.
2. Include short, executable Python code snippets wrapped in standard markdown \`\`\`python ... \`\`\` blocks.
3. If the user asks a question that is NOT related to Python programming (e.g. general history, cooking recipes, sports), politely decline and state that PyBot AI is specialized exclusively for Python programming and data science.
4. If relevant, explain the time/space complexity or common pitfalls (such as mutable default arguments, off-by-one errors, or shallow vs deep copies).
5. Avoid unnecessary pleasantries; lead directly into the solution.`;

  const promptContent = `User Question: "${question}"
${categoryContext ? `Predicted Topic Category: ${categoryContext}` : ''}
${kbSnippetContext ? `Verified Knowledge Base Reference:\n${kbSnippetContext}` : ''}

Provide a comprehensive, clear Pythonic answer with an executable code block:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction,
      },
    });

    const outputText = response.text || 'Unable to generate response. Please try again.';
    return {
      text: outputText,
      model: 'gemini-3.8-flash',
      source: 'gemini_ai',
    };
  } catch (err: any) {
    console.error('Gemini API request failed, falling back:', err?.message || err);
    return {
      text: kbSnippetContext || `Python Assistant: To solve "${question}", use standard Python built-ins. Here is an example implementation:

\`\`\`python
# Python solution
def solution():
    print("PyBot AI Python Assistant")

solution()
\`\`\``,
      model: 'PyBot Knowledge Base Fallback',
      source: 'knowledge_base',
    };
  }
}
