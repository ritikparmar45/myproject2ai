import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const FileUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }
    setFile(selectedFile);
    setError("");
  };

  const clearFile = () => {
    setFile(null);
    setSuccess(false);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setSuccess(false);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        if (onUploadSuccess) onUploadSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Ensure Gemini SDK & MongoDB are configured.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {!file ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`cursor-pointer transition-all border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center gap-6 group relative overflow-hidden ${
              dragActive ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
            }`}
            onClick={() => inputRef.current.click()}
          >
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
            />
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div className="relative z-10">
              <p className="text-xl font-bold text-white tracking-tight">Ingest Neural Data</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">Drag-and-drop or select PDF segments for indexing</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-subtle rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl"></div>
            <button
              onClick={clearFile}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-white truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB Segment</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="text-[11px] font-black uppercase text-primary tracking-widest italic">Awaiting Indexing</span>
                </div>
              </div>
              {!success && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary disabled:opacity-50 min-w-[160px] h-12 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Sythnesizing...</span>
                    </>
                  ) : 'Commit to Vault'}
                </button>
              )}
              {success && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 text-emerald-400 font-bold bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-sm uppercase tracking-widest">Indexed</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
