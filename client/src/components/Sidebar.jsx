import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, LogOut, Trash2, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Sidebar = ({ history, onNewChat, activeChatId, onSelectChat, onRefreshHistory }) => {
  const { user, logout } = useAuth();

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Erase this knowledge timeline?')) return;
    try {
      await api.delete(`/chat/${id}`);
      onRefreshHistory();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  return (
    <div className="w-80 h-full bg-[#020617]/80 backdrop-blur-2xl flex flex-col border-r border-white/5 relative z-20">
      <div className="p-6">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl py-4 border border-primary/20 transition-all font-bold tracking-wide group"
        >
          <div className="p-1 bg-primary rounded-lg text-white group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          New Simulation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
        <div className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary" />
          Recent Timelines
        </div>
        <AnimatePresence mode="popLayout">
          {history.map((chat) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              key={chat._id}
              onClick={() => onSelectChat(chat._id)}
              className={`w-full text-left px-4 py-4 rounded-2xl flex items-center gap-4 transition-all group cursor-pointer relative overflow-hidden ${
                activeChatId === chat._id 
                  ? 'bg-primary/10 text-white border border-primary/20 shadow-lg shadow-primary/5' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className={`shrink-0 w-2 h-2 rounded-full ${activeChatId === chat._id ? 'bg-primary animate-pulse' : 'bg-slate-700'}`} />
              <span className="truncate text-[13px] font-semibold flex-1 tracking-tight">
                {chat.title || chat.messages?.[0]?.content?.substring(0, 30) || 'New Simulation'}
              </span>
              
              <button
                onClick={(e) => handleDelete(e, chat._id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all absolute right-2 bg-dark/80 backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {history.length === 0 && (
          <div className="px-4 py-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-slate-700" />
            </div>
            <p className="text-slate-600 text-[13px] font-medium leading-relaxed max-w-[140px]">No active timelines detected in current sector</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-4 mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-2xl shadow-primary/20 ring-1 ring-white/20">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
                <Shield className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Admin Operator</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-red-400 transition-all hover:bg-red-500/5 rounded-2xl font-bold text-[13px] tracking-wide"
        >
          <div className="p-2 bg-white/[0.02] rounded-xl border border-white/5 group-hover:border-red-500/20">
            <LogOut className="w-4 h-4" />
          </div>
          System Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
