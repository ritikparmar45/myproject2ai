const multer = require('multer');
const { processPDF } = require('../rag/chunk');
const { indexDocuments } = require('../rag/embed');
const Document = require('../models/Document');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const fileName = req.file.originalname;

    // 1. Process PDF and split into chunks
    const chunks = await processPDF(req.file.buffer);

    // 2. Index in Vector DB
    await indexDocuments(chunks, fileName, userId);

    // 3. Save metadata to MongoDB
    const doc = await Document.create({
      userId,
      filename: fileName,
      isIndexed: true,
    });

    res.status(200).json({
      message: 'File processed and indexed successfully',
      document: doc,
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: err.message });
  }
};

const { MongoClient } = require('mongodb');

const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const docs = await Document.find({ userId }).sort({ uploadDate: -1 });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Find document metadata
    const doc = await Document.findOne({ _id: id, userId });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // 2. Delete embeddings from vector store
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const collection = client.db(process.env.DB_NAME || 'rag_app').collection('emeddings');
    await collection.deleteMany({ "metadata.userId": userId.toString(), "metadata.fileName": doc.filename });
    await client.close();

    // 3. Delete metadata
    await Document.findByIdAndDelete(id);

    res.status(200).json({ message: 'Document and associated vectors purged' });
  } catch (err) {
    console.error('Delete Document Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadFile, upload, getDocuments, deleteDocument };
