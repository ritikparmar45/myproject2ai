const express = require('express');
const { handleChat, getHistory, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, handleChat);
router.get('/history', protect, getHistory);
router.delete('/:id', protect, deleteChat);

module.exports = router;
