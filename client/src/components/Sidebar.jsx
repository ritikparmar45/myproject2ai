import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, LogOut, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const NexusLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center shrink-0">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M3 3h4v4H3V3zm6 0h4v4H9V3zM3 9h4v4H3V9zm6 2h1v1H9v-1zm2 0h1v1h-1v-1zm0-2h1v1h-1V9zm2 2h1v1h-1v-1z" fill="white"/>
      </svg>
    </div>
    <span className="text-[14px] font-semibold text-white">NexusAI</span>
  </div>
);

const Sidebar = ({ history, onNewChat, activeChatId, onSelectChat, onRefreshHistory, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await api.delete(`/chat/${id}`);
      onRefreshHistory();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{
        x: typeof window !== 'undefined' && window.innerWidth < 1024
          ? (isOpen ? 0 : -280)
          : 0
      }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed lg:relative inset-y-0 left-0 w-[260px] h-full flex flex-col border-r border-white/[0.06] z-50 lg:z-20 bg-[#0d0d10]"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
        <NexusLogo />
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-white/5 text-[#4a4a5e] hover:text-white transition-colors lg:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New chat button */}
      <div className="px-3 pt-3 pb-2">
        <button
          id="new-chat-btn"
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#8b8b9e] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.03] hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" />
          New conversation
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {history.length > 0 && (
          <div className="px-2 py-2 text-[11px] font-semibold text-[#4a4a5e] uppercase tracking-wider">
            Recent
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {history.map((chat) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              key={chat._id}
              onClick={() => {
                onSelectChat(chat._id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all group cursor-pointer relative mb-0.5 ${
                activeChatId === chat._id
                  ? 'bg-indigo-500/10 text-white'
                  : 'text-[#8b8b9e] hover:bg-white/[0.04] hover:text-[#c0c0d0]'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeChatId === chat._id ? 'text-indigo-400' : 'text-[#4a4a5e]'}`} />
              <span className="truncate text-[13px] flex-1 leading-tight">
                {chat.title || chat.messages?.[0]?.content?.substring(0, 35) || 'New conversation'}
              </span>
              <button
                onClick={(e) => handleDelete(e, chat._id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all text-[#4a4a5e] shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {history.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-[13px] text-[#4a4a5e] leading-relaxed">
              No conversations yet.<br />Start by typing a question below.
            </p>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="border-t border-white/[0.06] p-3 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-semibold shrink-0">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="text-[13px] font-medium text-[#c0c0d0] truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-[11px] text-[#4a4a5e] truncate">{user?.email}</p>
          </div>
          <button
            id="logout-btn"
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-md text-[#4a4a5e] hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
