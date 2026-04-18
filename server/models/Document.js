const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  fileUrl: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  // We'll use this to keep track of the indexed document in the vector store if needed
  isIndexed: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('Document', documentSchema);
