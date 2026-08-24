require('dotenv').config();
const { queryRAG } = require('./rag/query');

async function testEnv() {
  console.log('=== Environment Check ===');
  console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ MISSING');
  console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ MISSING');
  console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ MISSING');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING');
  console.log('DB_NAME:', process.env.DB_NAME || 'rag_app (default)');
  console.log('PORT:', process.env.PORT || '5000 (default)');
}

testEnv();
