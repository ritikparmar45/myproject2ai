const express = require('express');
const { uploadFile, upload, getDocuments, deleteDocument } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);
router.get('/', protect, getDocuments);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
