import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, Loader2, FileText, Paperclip, X } from 'lucide-react';

const ChatWindow = ({ activeChatId, activeChat, onMessageSent, pendingAttachedFiles = [], setPendingAttachedFiles }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const handleDetachFile = (filename) => {
    if (setPendingAttachedFiles) {
      setPendingAttachedFiles(prev => prev.filter(f => f !== filename));
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages, loading, uploading]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (setPendingAttachedFiles) {
        setPendingAttachedFiles((prev) => {
          if (!prev.includes(file.name)) return [...prev, file.name];
          return prev;
        });
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Upload failed.');
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
        chatId: activeChatId,
        attachedFiles: pendingAttachedFiles
      });
      if (setPendingAttachedFiles) setPendingAttachedFiles([]);
      setTimeout(() => { onMessageSent(res.data); }, 300);
    } catch (err) {
      console.error('Chat Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {!activeChatId ? (
          // Empty state
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-sm"
            >
              <div className="w-12 h-12 bg-indigo-500/15 border border-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Ask anything about your documents</h2>
              <p className="text-sm text-[#8b8b9e] leading-relaxed mb-8">
                Upload a PDF in the Documents panel, then start a conversation. NexusAI will find relevant answers from your files.
              </p>
              <div className="grid grid-cols-1 gap-2 text-left">
                {[
                  'Summarize the main points of this document',
                  'What are the key findings?',
                  'Explain section 3 in simple terms',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                    className="px-4 py-3 text-left text-sm text-[#8b8b9e] border border-white/[0.06] rounded-lg hover:border-white/[0.12] hover:text-[#c0c0d0] hover:bg-white/[0.02] transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Thread attached files */}
            {activeChat?.attachedFiles && activeChat.attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-3xl mx-auto w-full p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-lg">
                <span className="w-full text-[11px] font-semibold uppercase tracking-wider text-[#4a4a5e] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-indigo-400" />
                  Files used in this conversation
                </span>
                {activeChat.attachedFiles.map((filename, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-md text-xs text-[#8b8b9e]">
                    <FileText className="w-3 h-3 text-indigo-400" />
                    {filename}
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            {activeChat?.messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                key={idx}
                className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-indigo-500/20 border border-indigo-500/30'
                    : 'bg-white/5 border border-white/[0.08]'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-indigo-400" />
                    : <Sparkles className="w-3.5 h-3.5 text-[#8b8b9e]" />
                  }
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-2 min-w-0">
                  <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/15 border border-indigo-500/20 text-[#e0e0f0] rounded-tr-sm'
                      : 'bg-[#131318] border border-white/[0.07] text-[#d0d0e0] rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1">
                      <span className="w-full text-[10px] uppercase font-semibold tracking-wider text-[#4a4a5e]">Sources</span>
                      {msg.sources.map((source, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-md text-[11px] text-[#8b8b9e] hover:border-indigo-500/20 hover:text-indigo-400 transition-colors cursor-default"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[160px]">{typeof source === 'object' ? source.filename : source}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Loading state */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-3xl">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8b8b9e]" />
                </div>
                <div className="px-4 py-3.5 bg-[#131318] border border-white/[0.07] rounded-xl rounded-tl-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#8b8b9e] rounded-full typing-dot" />
                    <span className="w-1.5 h-1.5 bg-[#8b8b9e] rounded-full typing-dot" />
                    <span className="w-1.5 h-1.5 bg-[#8b8b9e] rounded-full typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Uploading state */}
            {uploading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-3xl">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                </div>
                <div className="px-4 py-3.5 bg-[#131318] border border-white/[0.07] rounded-xl rounded-tl-sm">
                  <p className="text-sm text-[#8b8b9e]">Indexing document...</p>
                  <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden w-32">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Pending file chips */}
          <AnimatePresence>
            {pendingAttachedFiles && pendingAttachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex flex-wrap gap-1.5 mb-2"
              >
                {pendingAttachedFiles.map((filename) => (
                  <div
                    key={filename}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-xs text-indigo-300"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[140px] font-medium">{filename}</span>
                    <button
                      type="button"
                      onClick={() => handleDetachFile(filename)}
                      className="ml-0.5 text-indigo-400/60 hover:text-indigo-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative bg-[#131318] border border-white/[0.08] rounded-xl focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              {/* Attach file button */}
              <button
                type="button"
                id="attach-file-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="absolute left-3 bottom-3 p-1 text-[#4a4a5e] hover:text-[#8b8b9e] transition-colors disabled:opacity-50"
                title="Attach PDF"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-[#f0f0f5] placeholder:text-[#4a4a5e] outline-none resize-none"
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf"
              />
            </div>

            <button
              type="submit"
              id="send-message-btn"
              disabled={!input.trim() || loading || uploading}
              className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shrink-0 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center mt-2.5 text-[11px] text-[#4a4a5e]">
            NexusAI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
