import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Play,
  Terminal,
  ChevronRight,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';
import { KnowledgeBaseItem, User } from '../../types/index.js';
import { api } from '../../services/api.js';
import { CodeBlock } from '../common/CodeBlock.js';

interface KnowledgeBaseExplorerProps {
  user: User | null;
  onAskQuestionInChat: (question: string) => void;
}

const CATEGORIES = [
  'All',
  'Python Introduction',
  'Variables and Data Types',
  'Operators',
  'Conditional Statements',
  'Loops',
  'Functions',
  'Lists',
  'Tuples',
  'Dictionaries',
  'Sets',
  'Strings',
  'Object-Oriented Programming',
  'Inheritance',
  'Exception Handling',
  'File Handling',
  'Modules and Packages',
  'NumPy',
  'Pandas',
  'Matplotlib',
  'Machine Learning',
  'Python Projects',
];

export function KnowledgeBaseExplorer({ user, onAskQuestionInChat }: KnowledgeBaseExplorerProps) {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<KnowledgeBaseItem | null>(null);

  // Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Functions',
    question: '',
    answer: '',
    codeSnippet: '# Python code snippet\n',
    tags: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
  });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getKnowledgeBase({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
        search: searchQuery || undefined,
      });
      setItems(data.items);
      if (data.items.length > 0 && !activeItem) {
        setActiveItem(data.items[0]);
      }
    } catch (err) {
      console.error('Failed to load KB items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, difficultyFilter, searchQuery]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Functions',
      question: '',
      answer: '',
      codeSnippet: 'def example():\n    print("Hello from Python KB!")\n\nexample()\n',
      tags: 'python, example',
      difficulty: 'Beginner',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KnowledgeBaseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      question: item.question,
      answer: item.answer,
      codeSnippet: item.codeSnippet,
      tags: item.tags.join(', '),
      difficulty: item.difficulty,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this knowledge base entry?')) return;
    try {
      await api.deleteKbItem(id);
      if (activeItem?.id === id) setActiveItem(null);
      await fetchItems();
    } catch (err: any) {
      alert(err.message || 'Error deleting item');
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'create') {
        const res = await api.createKbItem({
          title: formData.title,
          category: formData.category,
          question: formData.question,
          answer: formData.answer,
          codeSnippet: formData.codeSnippet,
          tags: formData.tags.split(',').map((t) => t.trim()),
          difficulty: formData.difficulty,
        });
        setActiveItem(res.item);
      } else if (editingId) {
        const res = await api.updateKbItem(editingId, {
          title: formData.title,
          category: formData.category,
          question: formData.question,
          answer: formData.answer,
          codeSnippet: formData.codeSnippet,
          tags: formData.tags.split(',').map((t) => t.trim()),
          difficulty: formData.difficulty,
        });
        setActiveItem(res.item);
      }
      setIsModalOpen(false);
      await fetchItems();
    } catch (err: any) {
      alert(err.message || 'Error saving item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 space-y-6 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            Verified Python Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Curated standard library, data structures, OOP patterns, and data science modules indexed for ML retrieval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg shadow-xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add KB Article</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Python topics, questions, code keywords..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                difficultyFilter === diff
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main split: Left list & Right article details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Article Card List (5 columns) */}
        <div className="lg:col-span-5 flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Articles ({items.length})</span>
            <span>Sorted by relevance</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                <span>Indexing Python knowledge base...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No articles found matching filters.
              </div>
            ) : (
              items.map((item) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`group relative p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 truncate max-w-[200px]">
                        {item.category}
                      </span>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        {item.difficulty}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.question}
                    </p>

                    {/* Tags row */}
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                      <span>{item.tags.slice(0, 3).join(' · ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.usageCount} queries</span>
                    </div>

                    {user?.role === 'admin' && (
                      <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 rounded p-1 shadow-xs">
                        <button
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1 text-slate-500 hover:text-amber-500"
                          title="Edit article"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-500"
                          title="Delete article"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Article Details View (7 columns) */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {activeItem ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Top metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {activeItem.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium">{activeItem.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Updated {new Date(activeItem.updatedAt).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => onAskQuestionInChat(activeItem.question)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ask in Chatbot</span>
                </button>
              </div>

              {/* Title & Question */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {activeItem.title}
                </h2>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-900 dark:text-white mr-1.5">Query:</span>
                  {activeItem.question}
                </div>
              </div>

              {/* Detailed Explanation */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Conceptual Explanation
                </h3>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeItem.answer}
                </p>
              </div>

              {/* Code Snippet with Run in Python 3 button */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Executable Python Implementation
                </h3>
                <CodeBlock
                  code={activeItem.codeSnippet}
                  language="python"
                  title={`${activeItem.category} Example`}
                />
              </div>

              {/* Tags */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 mr-2">Keywords:</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {activeItem.tags.join(', ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
              <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p>Select an article from the list to view explanation and runnable code.</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {modalMode === 'create' ? 'Create Knowledge Base Entry' : 'Edit Knowledge Base Entry'}
            </h3>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. NumPy Arrays and Broadcasting"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sample User Question
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What is broadcasting in NumPy?"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Answer Explanation
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Write comprehensive, clear Python conceptual explanation..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Executable Python Snippet
                </label>
                <textarea
                  rows={6}
                  value={formData.codeSnippet}
                  onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-950 p-2.5 font-mono text-emerald-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="numpy, arrays, broadcasting, vectorization"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Article & Retrain ML'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
