import React, { useState, useRef } from 'react';
import api from '../api/axios';
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
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
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
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const clearFile = () => {
    setFile(null);
    setSuccess(false);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setSuccess(false);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        if (onUploadSuccess) onUploadSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check your server configuration.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center gap-4 transition-all ${
              dragActive
                ? 'border-indigo-500/60 bg-indigo-500/5'
                : 'border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.02]'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
            />
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
              dragActive ? 'bg-indigo-500/20' : 'bg-white/[0.04]'
            }`}>
              <Upload className={`w-5 h-5 ${dragActive ? 'text-indigo-400' : 'text-[#8b8b9e]'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#c0c0d0]">
                {dragActive ? 'Drop file here' : 'Drop PDF here or click to browse'}
              </p>
              <p className="text-xs text-[#4a4a5e] mt-1">Supports PDF files up to 10 MB</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-4 relative"
          >
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 p-1 rounded-md text-[#4a4a5e] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate pr-6">{file.name}</p>
                <p className="text-xs text-[#4a4a5e] mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              {!success ? (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary text-sm"
                  id="upload-document-btn"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Indexing...
                    </>
                  ) : 'Index Document'}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 text-emerald-400 text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Indexed successfully
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
