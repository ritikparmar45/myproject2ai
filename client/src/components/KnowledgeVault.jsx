import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Clock, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';

const KnowledgeVault = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/upload');
      setDocuments(res.data);
    } catch (err) {
      setError('Failed to fetch neural storage records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Purge this data segment from neural storage? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/upload/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Knowledge Vault</h2>
            <p className="text-slate-400 text-sm font-medium">Manage your indexed data segments</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full text-[12px] font-bold text-slate-500 uppercase tracking-widest">
          {documents.length} Entities Indexed
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary/40 animate-spin" />
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Vault...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500/50" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="py-20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-slate-700" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold">Vault Empty</p>
            <p className="text-slate-500 text-sm">No data segments detected in this sector.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {documents.map((doc) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={doc._id}
                className="glass-subtle rounded-3xl p-6 flex items-center gap-5 group hover:border-primary/20 transition-all"
              >
                <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center relative shadow-inner">
                  <FileText className="w-6 h-6 text-primary" />
                  <div className="absolute -top-1 -right-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-dark-darker" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">{doc.filename}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-md">Indexed</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-3 bg-red-500/0 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-2xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default KnowledgeVault;
