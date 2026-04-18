const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

/**
 * Queries the RAG pipeline for an answer.
 */
const queryRAG = async (query, userId) => {
  const client = new MongoClient(process.env.MONGO_URI);
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  try {
    await client.connect();
    const collection = client.db(process.env.DB_NAME || 'rag_app').collection('emeddings');

    // 1. Generate Query Vector using Direct Google SDK (3072D verified for gemini-embedding-001)
    const modelEmbed = genAI.getGenerativeModel({ model: "gemini-embedding-001" }, { apiVersion: 'v1beta' });
    const resultEmbed = await modelEmbed.embedContent(query);
    const vector = resultEmbed.embedding.values;

    // 2. Perform Vector Search via MongoDB Aggregation
    const results = await collection.aggregate([
      {
        "$vectorSearch": {
          "index": "vector_index",
          "path": "embedding",
          "queryVector": vector,
          "numCandidates": 100,
          "limit": 15,
          "filter": { "metadata.userId": userId.toString() }
        }
      }
    ]).toArray();

    const context = results.map(r => `[From file: ${r.metadata.fileName}]\n${r.text}`).join('\n\n---\n\n');
    const sources = results.map(r => r.metadata.fileName);

    // 3. Generate Answer with Groq API (Llama 3) for speed and to avoid Gemini rate limits
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const promptText = `
    You are a helpful AI Assistant analyzing uploaded documents. 
    Use the following context to answer the user's question. The context may contain information from multiple different documents.
    IMPORTANT: If the user asks a general question like "what is this", "summarize", or "tell me about my recent pdf", summarize the topics found in the context and specify which document they belong to.
    If the context doesn't contain the answer to a specific question, say "I don't have enough information in the uploaded documents to answer this."
    
    Context:
    ${context}
    
    Question: ${query}
    
    Helpful Answer:`;

    const chatResponse = await groq.chat.completions.create({
      messages: [{ role: "user", content: promptText }],
      model: "llama-3.3-70b-versatile", // Updated to current active model
      temperature: 0.2,
    });

    const uniqueSources = [...new Set(sources)].map(filename => ({ filename }));

    return {
      answer: chatResponse.choices[0].message.content,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error('Error in queryRAG:', error);
    throw new Error('Failed to generate response: ' + error.message);
  } finally {
    await client.close();
  }
};

module.exports = { queryRAG };
