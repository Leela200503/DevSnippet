import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, socialService, snippetService } from '../services/api';
import SnippetCard from '../components/SnippetCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Code, 
  Heart, 
  Edit3, 
  X, 
  Check,
  Settings,
  Mail,
  Calendar
} from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [saveLoading, setSaveLoading] = useState(false);

  const isOwnProfile = currentUser?.id?.toString() === id;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserProfile(id);
      setProfile(response.data);
      setEditForm({ name: response.data.name, bio: response.data.bio || '' });
    } catch (err) {
      setError("Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleFollow = async () => {
    try {
      if (profile.following) {
        await socialService.unfollowUser(id);
        setProfile(prev => ({ 
          ...prev, 
          following: false, 
          followersCount: prev.followersCount - 1 
        }));
      } else {
        await socialService.followUser(id);
        setProfile(prev => ({ 
          ...prev, 
          following: true, 
          followersCount: prev.followersCount + 1 
        }));
      }
    } catch (err) {
      console.error("Follow action failed");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await userService.updateProfile(editForm);
      setProfile(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 max-w-md">
        <h2 className="text-xl font-black mb-2">Oops!</h2>
        <p className="font-medium">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 btn-primary w-full">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-100/50 border border-slate-100 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-6xl font-black text-white shadow-2xl transform group-hover:rotate-3 transition-transform duration-500">
                {profile.name?.charAt(0)}
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute -bottom-2 -right-2 p-3 bg-white text-indigo-600 rounded-2xl shadow-xl border border-slate-100 hover:scale-110 transition-transform"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                  {isOwnProfile ? (
                    <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 w-fit self-center">Owner</span>
                  ) : (
                    <button 
                      onClick={handleFollow}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all self-center ${
                        profile.following 
                        ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                      }`}
                    >
                      {profile.following ? (
                        <><UserMinus className="h-4 w-4" /> Unfollow</>
                      ) : (
                        <><UserPlus className="h-4 w-4" /> Follow</>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 font-bold text-sm">
                  <div className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined May 2026</div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-2xl font-black text-indigo-600">{profile.snippetsCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1 justify-center md:justify-start">
                    <Code className="h-3 w-3" /> Snippets
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-2xl font-black text-purple-600">{profile.totalLikesReceived}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1 justify-center md:justify-start">
                    <Heart className="h-3 w-3" /> Likes
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-2xl font-black text-slate-900">{profile.followersCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1 justify-center md:justify-start">
                    <Users className="h-3 w-3" /> Followers
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-2xl font-black text-slate-900">{profile.followingCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1 justify-center md:justify-start">
                    <Users className="h-3 w-3" /> Following
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs / Recent Snippets */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recent Contributions</h2>
            <div className="h-px flex-1 bg-slate-200 mx-8 hidden sm:block"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profile.recentSnippets && profile.recentSnippets.length > 0 ? (
              profile.recentSnippets.map(snippet => (
                <SnippetCard 
                  key={snippet.id} 
                  snippet={snippet} 
                  onView={(id) => navigate(`/view/${id}`)}
                  onEdit={(id) => navigate(`/edit/${id}`)}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                <Code className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No snippets to show yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h3>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="enterprise-input"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">About You (Bio)</label>
                    <textarea 
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="enterprise-input h-32 py-4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 enterprise-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={saveLoading}
                      className="flex-1 enterprise-btn-primary"
                    >
                      {saveLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <><Check className="h-5 w-5" /> Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
