const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MongoClient } = require('mongodb');

/**
 * Embeds documents and stores them in MongoDB.
 */
const indexDocuments = async (docs, fileName, userId) => {
  const client = new MongoClient(process.env.MONGO_URI);
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  try {
    await client.connect();
    const collection = client.db(process.env.DB_NAME || 'rag_app').collection('emeddings');
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" }, { apiVersion: 'v1beta' });

    console.log(`Starting indexing for ${docs.length} chunks (3072D)...`);

    const documentsToInsert = await Promise.all(docs.map(async (doc, index) => {
      const result = await model.embedContent(doc.pageContent);
      return {
        text: doc.pageContent,
        embedding: result.embedding.values,
        metadata: {
          ...doc.metadata,
          fileName,
          userId: userId.toString(),
          chunkIndex: index
        }
      };
    }));

    await collection.insertMany(documentsToInsert);
    console.log(`Successfully indexed ${docs.length} chunks (3072D) for file: ${fileName}`);
  } catch (error) {
    console.error('Error indexing documents:', error);
    throw new Error('Failed to index documents: ' + error.message);
  } finally {
    await client.close();
  }
};

module.exports = { indexDocuments };

module.exports = { indexDocuments };
