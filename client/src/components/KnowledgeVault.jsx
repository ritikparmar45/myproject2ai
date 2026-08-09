import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const KnowledgeVault = ({ onDocumentSelect }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/upload');
      setDocuments(res.data);
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Remove this document from the index? This cannot be undone.')) return;
    try {
      await api.delete(`/upload/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 className="w-6 h-6 text-[#4a4a5e] animate-spin" />
        <p className="text-sm text-[#4a4a5e]">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertCircle className="w-8 h-8 text-red-500/50" />
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={fetchDocuments} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="border border-dashed border-white/[0.07] rounded-xl flex flex-col items-center gap-3 py-14 text-center">
        <div className="w-10 h-10 bg-white/[0.03] rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#4a4a5e]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#8b8b9e]">No documents indexed yet</p>
          <p className="text-xs text-[#4a4a5e] mt-1">Upload a PDF to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#4a4a5e]">{documents.length} document{documents.length !== 1 ? 's' : ''} indexed</span>
        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-medium border border-emerald-500/15">
          Vector DB
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {documents.map((doc) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            key={doc._id}
            onClick={() => onDocumentSelect?.(doc)}
            className="group flex items-center gap-3 p-3.5 card rounded-xl cursor-pointer hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-all"
          >
            <div className="w-9 h-9 bg-white/[0.03] border border-white/[0.07] rounded-lg flex items-center justify-center shrink-0 relative">
              <FileText className="w-4 h-4 text-indigo-400" />
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#c0c0d0] truncate group-hover:text-white transition-colors">{doc.filename}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-[#4a4a5e]" />
                <span className="text-xs text-[#4a4a5e]">{new Date(doc.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={(e) => handleDelete(e, doc._id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-[#4a4a5e] hover:text-red-400 hover:bg-red-500/5 transition-all"
              title="Remove document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeVault;
