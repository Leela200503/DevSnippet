import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { socialService } from '../services/api';
import { 
  Heart, 
  MessageSquare, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  Lock,
  Globe,
  Star,
  Edit2
} from 'lucide-react';

export default function SnippetCard({ snippet, onDelete, onEdit, onView }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.email === snippet.user?.email;
  const [liked, setLiked] = useState(snippet.liked);
  const [likeCount, setLikeCount] = useState(snippet.likeCount);
  const [favorited, setFavorited] = useState(snippet.favorited);
  const [isCopying, setIsCopying] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      if (liked) {
        await socialService.unlikeSnippet(snippet.id);
        setLikeCount(prev => prev - 1);
      } else {
        await socialService.likeSnippet(snippet.id);
        setLikeCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error("Interaction failed");
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (favorited) {
        await socialService.unfavoriteSnippet(snippet.id);
      } else {
        await socialService.favoriteSnippet(snippet.id);
      }
      setFavorited(!favorited);
    } catch (err) {
      console.error("Favorite failed");
    }
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    setIsCopying(true);
    await navigator.clipboard.writeText(snippet.code);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="app-card flex flex-col h-full overflow-hidden">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white text-indigo-600 border border-indigo-100 shadow-sm">
                {snippet.language}
              </span>
              {snippet.visibility === 'PUBLIC' ? (
                <Globe className="h-3 w-3 text-emerald-600" />
              ) : (
                <Lock className="h-3 w-3 text-gray-400" />
              )}
            </div>
            <h3 className="text-base font-extrabold text-gray-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">
              {snippet.title}
            </h3>
          </div>
          
          <button 
            onClick={handleCopy}
            className={`p-1.5 rounded-lg transition-all shadow-sm ${
              isCopying ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
            }`}
          >
            {isCopying ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {snippet.description && (
          <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed font-medium italic">
            "{snippet.description}"
          </p>
        )}

        <div className="mt-auto">
          {/* Interaction Bar */}
          <div className="flex items-center gap-4 py-3 border border-blue-200/50 mb-4 bg-white rounded-xl px-4 shadow-sm">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 text-xs font-bold transition-all ${
                liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
              <MessageSquare className="h-4 w-4" />
              {snippet.commentCount}
            </div>
            <button 
              onClick={handleFavorite}
              className={`flex items-center gap-2 text-xs font-bold transition-all ml-auto ${
                favorited ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
              }`}
            >
              <Star className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-blue-100/30">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${snippet.user?.id}`); }}
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                {snippet.user?.name?.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-gray-900 leading-none">{snippet.user?.name}</p>
                <p className="text-[9px] text-gray-500 mt-1 font-medium">
                  {new Date(snippet.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isOwner && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(snippet.id); }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Edit Snippet"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(snippet.id); }}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Snippet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button 
                onClick={() => onView(snippet.id)}
                className="btn-primary !px-4 !py-2 !text-xs shadow-md"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
