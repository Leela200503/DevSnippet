import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetService } from '../services/api';
import SnippetCard from '../components/SnippetCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Globe, 
  Heart, 
  Plus, 
  Search, 
  LogOut, 
  Menu,
  ChevronRight,
  Code2
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('my'); 
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippets();
  }, [currentPage, activeTab]);

  const fetchSnippets = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (activeTab === 'my') {
        if (searchTerm) {
          response = await snippetService.searchUserSnippets(searchTerm, '', currentPage, 12);
        } else {
          response = await snippetService.getUserSnippets(currentPage, 12);
        }
        setSnippets(response.data.content);
        setTotalPages(response.data.totalPages);
      } else if (activeTab === 'favorites') {
        response = await snippetService.getFavoriteSnippets();
        setSnippets(response.data);
        setTotalPages(1); // Favorites are not paginated in this simple implementation
      } else {
        response = await snippetService.getPublicSnippets(searchTerm, '', '', currentPage, 12);
        setSnippets(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      setError('Failed to load snippets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchSnippets();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this snippet?')) {
      try {
        await snippetService.deleteSnippet(id);
        setSnippets(snippets.filter((s) => s.id !== id));
      } catch (err) {
        setError('Failed to delete snippet');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Rail */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">DevSnippet</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('my')}
            className={`sidebar-link w-full ${activeTab === 'my' ? 'active' : ''}`}
          >
            <Layout className="h-5 w-5" />
            My Snippets
          </button>
          <button 
            onClick={() => setActiveTab('public')}
            className={`sidebar-link w-full ${activeTab === 'public' ? 'active' : ''}`}
          >
            <Globe className="h-5 w-5" />
            Community
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`sidebar-link w-full ${activeTab === 'favorites' ? 'active' : ''}`}
          >
            <Heart className="h-5 w-5" />
            Favorites
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
              onClick={() => navigate(`/profile/${user?.id}`)}
              title="View my profile"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-rose-500 transition-colors shrink-0">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <Menu className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-bold text-gray-900">DevSnippet</h1>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 h-10 text-sm"
            />
          </form>

          <button 
            onClick={() => navigate('/create')}
            className="btn-primary h-10 text-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>New Snippet</span>
          </button>
        </header>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'my' ? 'My Library' : 'Explore Community'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'my' ? 'Your personal collection of technical assets.' : 'High-quality snippets from the community.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl border border-rose-100 mb-8 flex items-center gap-3 text-sm font-medium">
              <span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white h-64 rounded-2xl border border-gray-100 animate-pulse"></div>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border border-gray-200 border-dashed">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Code2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No snippets found</h3>
              <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                {activeTab === 'my' ? 'Your library is empty. Create your first technical snippet now!' : 'No public snippets available right now.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-12">
              {snippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onDelete={handleDelete}
                  onEdit={(id) => navigate(`/edit/${id}`)}
                  onView={(id) => navigate(`/view/${id}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pb-12">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-30"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                    currentPage === i ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
