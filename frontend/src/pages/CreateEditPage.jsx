import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { snippetService } from '../services/api';
import { motion } from 'framer-motion';

export default function CreateEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchSnippet();
    }
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const response = await snippetService.getSnippetById(id);
      const snippet = response.data;
      setTitle(snippet.title);
      setCode(snippet.code);
      setLanguage(snippet.language);
      setTags(snippet.tags || '');
      setDescription(snippet.description || '');
      setVisibility(snippet.visibility);
    } catch (err) {
      setError('Failed to load snippet');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        title,
        code,
        language,
        tags,
        description,
        visibility,
      };

      if (isEditing) {
        await snippetService.updateSnippet(id, data);
      } else {
        await snippetService.createSnippet(data);
      }

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).join(', ');
        setError(`Validation Error: ${validationErrors}`);
      } else {
        setError(err.response?.data?.message || 'Failed to save snippet');
      }
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS', 'TypeScript',
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {isEditing ? 'Edit Snippet' : 'New Contribution'}
                </h1>
                <p className="text-slate-500 font-medium">Share your technical excellence with the world.</p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-4 py-3 rounded-r-xl mb-8 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Snippet Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="enterprise-input"
                    placeholder="E.g. Optimized Binary Search Tree"
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="enterprise-input"
                    required
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="enterprise-input"
                    required
                  >
                    <option value="PRIVATE">Private Library</option>
                    <option value="PUBLIC">Community Public</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Source Code</label>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="relative w-full px-6 py-6 bg-slate-900 text-indigo-300 font-mono text-sm border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all h-[400px] shadow-2xl"
                    placeholder="// Paste your masterpiece here..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="enterprise-input"
                    placeholder="api, rest, performance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="enterprise-input"
                    placeholder="Short summary of what this code does"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="enterprise-btn-secondary"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="enterprise-btn-primary min-w-[160px]"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>{isEditing ? 'Sync Changes' : 'Publish Snippet'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
