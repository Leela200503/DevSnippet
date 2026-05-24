import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetService, socialService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Heart, MessageSquare, ArrowLeft, Send, Shield, Globe } from 'lucide-react';

export default function ViewSnippetPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [snippet, setSnippet] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchSnippetData();
  }, [id]);

  const fetchSnippetData = async () => {
    try {
      setLoading(true);
      const [snippetRes, commentsRes] = await Promise.all([
        snippetService.getSnippetById(id),
        socialService.getComments(id)
      ]);
      
      setSnippet(snippetRes.data);
      setComments(commentsRes.data);
      setLiked(snippetRes.data.liked);
      setLikeCount(snippetRes.data.likeCount);
    } catch (err) {
      setError('Snippet not found or access restricted.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await socialService.unlikeSnippet(id);
        setLikeCount(prev => prev - 1);
      } else {
        await socialService.likeSnippet(id);
        setLikeCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error("Interaction failed");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const res = await socialService.addComment(id, newComment);
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to add comment");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (error || !snippet) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-50 mb-6">
        <Shield className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-500 mb-8 max-w-xs">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary">
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-semibold mb-8 transition-colors group text-sm"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to library
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg border border-indigo-100">
                        {snippet.language}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        {snippet.visibility === 'PUBLIC' ? <Globe className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        {snippet.visibility}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {snippet.title}
                    </h1>
                  </div>
                  
                  <button 
                    onClick={handleCopy}
                    className={`btn-secondary !p-3 transition-all ${
                      copied ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : ''
                    }`}
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between py-6 border-y border-gray-50">
                  <Link to={`/profile/${snippet.user.id}`} className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 shadow-sm">
                      {snippet.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {snippet.user.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Posted on {new Date(snippet.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>

                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                      liked ? 'bg-rose-50 text-rose-500 border-rose-100' : 'text-gray-400 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </button>
                </div>

                <div className="mt-8">
                  {snippet.description && (
                    <p className="text-gray-600 leading-relaxed mb-8 border-l-2 border-indigo-100 pl-6 italic">
                      {snippet.description}
                    </p>
                  )}

                  <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <SyntaxHighlighter 
                      language={snippet.language.toLowerCase()} 
                      style={oneLight}
                      customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.9rem',
                        background: '#fcfcfc'
                      }}
                    >
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>

                  {snippet.tags && (
                    <div className="flex flex-wrap gap-2 mt-8">
                      {snippet.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-xs font-semibold border border-gray-100">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Comments */}
          <div className="space-y-6">
            <CommentSection 
              comments={comments} 
              newComment={newComment} 
              setNewComment={setNewComment} 
              onSubmit={handleAddComment} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentSection({ comments, newComment, setNewComment, onSubmit }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col max-h-[800px]">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-indigo-600" />
        Discussion
      </h3>

      <form onSubmit={onSubmit} className="mb-6 relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="form-input text-sm min-h-[100px] pr-12 resize-none"
        />
        <button 
          type="submit"
          className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">
            No comments yet.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100">
                {comment.user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-900 truncate">{comment.user.name}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
