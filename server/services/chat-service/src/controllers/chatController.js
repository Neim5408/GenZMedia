const chatService = require('../services/chatService');

exports.send = async (req, res) => {
  try {
    const message = await chatService.sendMessage(req.body);
    const io = req.app.get('io');
    io.to(message.receiver_id).emit('receiveMessage', message);
    res.status(201).json({ message: "Pesan terkirim", data: message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { userA, userB } = req.params;
    const history = await chatService.fetchHistory(userA, userB);
    res.status(200).json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const result = await chatService.readMessages(senderId, receiverId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};