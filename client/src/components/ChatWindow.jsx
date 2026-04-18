import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2, FileText, Paperclip, Database } from 'lucide-react';

const ChatWindow = ({ activeChatId, activeChat, onMessageSent }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages, loading, uploading]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Optionally notify user or refresh something
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: userMessage,
        chatId: activeChatId
      });
      
      // Simulate real-time thinking feel
      setTimeout(() => {
        onMessageSent(res.data);
      }, 500);
    } catch (err) {
      console.error('Chat Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {activeChat?.messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            key={idx}
            className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl relative group ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-primary to-purple-600' 
                : 'bg-white/5 border border-white/10'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-6 h-6 text-white" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Bot className="w-6 h-6 text-primary relative z-10" />
                </>
              )}
            </div>
            <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'items-end text-right' : ''}`}>
              <div className={`p-5 rounded-3xl backdrop-blur-md ${
                msg.role === 'user' 
                  ? 'bg-primary/20 border border-primary/20 text-white rounded-tr-none' 
                  : 'bg-white/[0.03] border border-white/10 text-slate-200 rounded-tl-none shadow-xl'
              }`}>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed selection:bg-primary/30">{msg.content}</p>
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className={`flex flex-wrap gap-2 pt-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 w-full mb-1 tracking-widest">Knowledge Context</span>
                  {msg.sources.map((source, sIdx) => (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      key={sIdx} 
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[11px] text-slate-400 hover:border-primary/30 hover:text-primary transition-all cursor-default"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{typeof source === 'object' ? source.filename : source}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none flex items-center gap-4">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              </div>
              <span className="text-sm font-medium text-slate-400">Processing with Llama 3.3...</span>
            </div>
          </motion.div>
        )}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none flex flex-col gap-3 min-w-[300px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-slate-200 uppercase tracking-widest italic">Ingesting Document...</span>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-full bg-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-8 bg-dark/30 backdrop-blur-sm border-t border-white/5 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="relative group max-w-5xl mx-auto flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query your personal knowledge graph..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-20 py-5 outline-none focus:border-primary/50 focus:ring-[12px] focus:ring-primary/5 transition-all group-hover:border-white/20 text-lg placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 hover:bg-white/5 rounded-xl flex items-center justify-center transition-all text-slate-500 hover:text-primary active:scale-95"
            >
              <Paperclip className="w-6 h-6" />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || uploading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </form>
        <p className="text-center mt-5 text-[11px] text-slate-500 font-bold tracking-[0.2em] uppercase opacity-50">
          Galactic Neural Engine • Powered by Groq Llama 3 & MongoDB Atlas
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
