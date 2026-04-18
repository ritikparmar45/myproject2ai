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

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account with Vector Search enabled.
- API Keys for **Groq** and **Google Generative AI**.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd project2
   ```

2. **Setup Server**:
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Setup Client**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

### 🗝️ Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
DB_NAME=rag_app
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_key
```

## 📂 Project Structure
```
├── client/           # React frontend (Vite)
├── server/           # Express backend
│   ├── controllers/  # Logic handlers
│   ├── models/       # Mongoose schemas
│   ├── rag/          # RAG pipeline (embed + query)
│   └── routes/       # API endpoints
└── README.md
```

## 🛡️ Security
- **JWT Authentication**: Secure user sessions.
- **Protected Routes**: Only authorized users can access the dashboard and knowledge vault.
- **Bcrypt**: Industrial-strength password hashing.

## 📄 License
This project is licensed under the MIT License.

---
*Created by the Antigravity Team*
