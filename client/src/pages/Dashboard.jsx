import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import FileUpload from '../components/FileUpload';
import KnowledgeVault from '../components/KnowledgeVault';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Menu } from 'lucide-react';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [showVault, setShowVault] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingAttachedFiles, setPendingAttachedFiles] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      const chat = history.find(c => c._id === activeChatId);
      setActiveChat(chat);
      setIsSidebarOpen(false);
      setPendingAttachedFiles([]);
    } else {
      setActiveChat(null);
    }
  }, [activeChatId, history]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      setHistory(res.data);
      if (res.data.length > 0 && !activeChatId) {
        setActiveChatId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Fetch History Error:', err);
    }
  };

  const handleMessageSent = (data) => {
    fetchHistory();
    if (!activeChatId) {
      setActiveChatId(data.chatId);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setActiveChat(null);
    setIsSidebarOpen(false);
    setShowVault(false);
    setPendingAttachedFiles([]);
  };

  const handleDocumentSelect = (doc) => {
    setShowVault(false);
    handleNewChat();
    setPendingAttachedFiles([doc.filename]);
  };

  return (
    <div className="flex h-screen app-bg overflow-hidden text-[#f0f0f5] relative">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar
        history={history}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => setActiveChatId(id)}
        onRefreshHistory={fetchHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        {/* Header */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-6 bg-[#0d0d10]/80 backdrop-blur-xl relative z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden text-[#8b8b9e] hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo — visible on mobile when sidebar is hidden */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h4v4H3V3zm6 0h4v4H9V3zM3 9h4v4H3V9zm6 2h1v1H9v-1zm2 0h1v1h-1v-1zm0-2h1v1h-1V9zm2 2h1v1h-1v-1z" fill="white"/>
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-white">NexusAI</span>
            </div>

            {/* Active chat title */}
            {activeChat && (
              <div className="hidden lg:flex items-center gap-2 text-sm text-[#8b8b9e]">
                <span className="text-white/20">/</span>
                <span className="truncate max-w-[200px] text-[#c0c0d0] font-medium">
                  {activeChat.title || activeChat.messages?.[0]?.content?.substring(0, 40) || 'New conversation'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="knowledge-vault-btn"
              onClick={() => {
                setShowVault(!showVault);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-2 text-[13px] font-medium px-3.5 py-2 rounded-lg border transition-all ${
                showVault
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                  : 'bg-transparent text-[#8b8b9e] border-white/[0.07] hover:border-white/[0.12] hover:text-[#f0f0f5]'
              }`}
            >
              {showVault ? <X className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span className="hidden sm:inline">{showVault ? 'Close' : 'Documents'}</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence>
            {showVault && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-[#0d0d10]/98 backdrop-blur-xl z-50 overflow-y-auto"
              >
                <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-10">
                  {/* Page header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Document Library</h2>
                      <p className="text-sm text-[#8b8b9e] mt-0.5">Upload and manage your indexed documents</p>
                    </div>
                    <button
                      onClick={() => setShowVault(false)}
                      className="p-2 rounded-lg hover:bg-white/5 text-[#8b8b9e] hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-4">
                      <h3 className="text-sm font-semibold text-[#c0c0d0] uppercase tracking-wider">Upload Document</h3>
                      <FileUpload onUploadSuccess={fetchHistory} />
                    </div>
                    <div className="lg:col-span-7 space-y-4">
                      <h3 className="text-sm font-semibold text-[#c0c0d0] uppercase tracking-wider">Indexed Files</h3>
                      <KnowledgeVault
                        key={history.length}
                        onDocumentSelect={handleDocumentSelect}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-hidden">
            <ChatWindow
              activeChatId={activeChatId}
              activeChat={activeChat}
              onMessageSent={handleMessageSent}
              pendingAttachedFiles={pendingAttachedFiles}
              setPendingAttachedFiles={setPendingAttachedFiles}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
