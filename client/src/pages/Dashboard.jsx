import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import FileUpload from '../components/FileUpload';
import KnowledgeVault from '../components/KnowledgeVault';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquareCode, Database, X, Menu } from 'lucide-react';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [showVault, setShowVault] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      const chat = history.find(c => c._id === activeChatId);
      setActiveChat(chat);
      setIsSidebarOpen(false);
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
  };

  return (
    <div className="flex h-screen bg-dark-darker galactic-mesh overflow-hidden text-slate-200 relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#020617]/40 backdrop-blur-3xl relative z-30 shadow-2xl gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl lg:hidden hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 shrink-0">
              <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-lg lg:text-xl tracking-tighter text-white uppercase italic">Antigravity <span className="text-primary not-italic tracking-[0.2em] ml-1 opacity-80">RAG</span></span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden lg:inline-block">Neural Link Active • v2.0</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            <button 
              onClick={() => {
                setShowVault(!showVault);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-2 lg:gap-3 text-xs lg:text-[13px] font-bold transition-all px-4 lg:px-6 py-2.5 rounded-2xl border ${
                showVault 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {showVault ? <X className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              <span className="hidden xs:inline">{showVault ? 'Simulation' : 'Knowledge Vault'}</span>
              <span className="xs:hidden">{showVault ? 'Exit' : 'Vault'}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence>
            {showVault && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 bg-dark-darker/95 backdrop-blur-2xl z-50 overflow-y-auto p-6 lg:p-12"
              >
                <div className="max-w-6xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 space-y-8">
                      <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase italic">Ingest Data</h2>
                        <p className="text-slate-500 font-medium leading-relaxed text-sm">Expand your assistant's neural boundaries by committing new documentation to the vault.</p>
                      </div>
                      <FileUpload onUploadSuccess={fetchHistory} /> 
                    </div>
                    <div className="lg:col-span-7">
                      <KnowledgeVault key={history.length} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-hidden">
            {activeChatId ? (
              <ChatWindow 
                activeChatId={activeChatId} 
                activeChat={activeChat}
                onMessageSent={handleMessageSent}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-dark-darker/50">
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse"></div>
                  <MessageSquareCode className="w-8 h-8 lg:w-12 lg:h-12 text-primary relative z-10" />
                </div>
                <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tight uppercase italic mb-4">Neural Interface Ready</h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed font-medium text-sm lg:text-base">
                  Initialize a new simulation or access your existing knowledge timelines to begin data synthesis.
                </p>
                <button
                  onClick={handleNewChat}
                  className="mt-10 btn-primary"
                >
                  Start New Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
