const { queryRAG } = require('../rag/query');
const Chat = require('../models/Chat');

const handleChat = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user.id;

    // 1. Get answer from RAG pipeline
    const { answer, sources } = await queryRAG(message, userId);

    // 2. Save to history
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      chat.messages.push({ role: 'user', content: message });
      chat.messages.push({ role: 'assistant', content: answer, sources });
      await chat.save();
    } else {
      chat = await Chat.create({
        userId,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: answer, sources },
        ],
      });
    }

    res.status(200).json({
      answer,
      sources,
      chatId: chat._id,
    });
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const chat = await Chat.findOneAndDelete({ _id: id, userId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleChat, getHistory, deleteChat };
