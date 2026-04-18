# 🌌 Antigravity RAG Assistant v2.0

Antigravity RAG is a premium, full-stack **Retrieval-Augmented Generation** platform built with the MERN stack. It allows users to upload PDF documents, index them into a vector database, and perform high-speed neural queries using state-of-the-art LLMs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-purple)
![LLM](https://img.shields.io/badge/Engine-Llama%203.3-orange)

## ✨ Features
- **Galactic Design**: A premium dark-mode interface with glassmorphism and animated backgrounds.
- **Speed-First Generation**: Powered by **Groq Llama 3.3 (70B)** for near-instant responses.
- **Vector Search**: Integrated with **MongoDB Atlas Vector Search** and **Google Embeddings (3072D)**.
- **Knowledge Vault**: Advanced document management system to track and purge indexed data.
- **Chat Management**: Persistent timelines with the ability to delete past simulations.
- **Direct Context Ingestion**: Upload PDFs directly within the chat interface for zero-friction knowledge expansion.

## 🚀 Tech Stack
- **Frontend**: Vite, React 19, Tailwind CSS 4, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express 5, Mongoose 9.
- **Database**: MongoDB Atlas (Vector Search).
- **AI Engine**: Groq API (Llama 3.3), Google Generative AI (Embeddings).

## 🚀 Deployment Guide

### Phase 1: Backend (Render.com)
1.  **New Web Service**: Connect your GitHub repo.
2.  **Settings**:
    *   **Root Directory**: `server`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
3.  **Environment Variables**: Add all keys from `server/.env`.
4.  **Copy URL**: Once deployed, copy your Render URL (e.g., `https://api.your app.com`).

### Phase 2: Frontend (Vercel.com)
1.  **New Project**: Import your GitHub repo.
2.  **Settings**:
    *   **Root Directory**: `client`
    *   **Framework Preset**: Vite
3.  **Environment Variables**:
    *   Add `VITE_API_URL`: `https://your-render-url/api` (Important: add `/api` at the end).
4.  **Deploy**: Click deploy and wait for the magic.

---
*Created by the Antigravity Team*
