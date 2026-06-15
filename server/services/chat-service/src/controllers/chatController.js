const chatService = require('../services/chatService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat direktori uploads jika belum ada
const dir = 'public/uploads';
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

// Konfigurasi Multer untuk Upload Gambar Chat
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, 'chat-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Batas 5MB
}).single('image'); // Maps to backend upload processing ("image")

const deleteUploadedMedia = (mediaUrl) => {
  if (!mediaUrl) return;

  try {
    const filename = path.basename(new URL(mediaUrl).pathname);
    const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename);

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.warn('Gagal menghapus file media chat:', err.message);
      }
    });
  } catch (err) {
    console.warn('URL media chat tidak valid:', err.message);
  }
};

const handleMessageCreation = async (req, res) => {
  try {
    const { sender_id, receiver_id, message_text } = req.body;
    let media_url = null;

    if (req.file) {
      media_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const message = await chatService.sendMessage({
      sender_id,
      receiver_id,
      message_text,
      media_url
    });

    const io = req.app.get('io');
    if (io) {
      io.to(receiver_id).emit('receiveMessage', message);
    }

    res.status(201).json({ message: "Pesan terkirim", data: message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.send = (req, res) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      await handleMessageCreation(req, res);
    });
  } else {
    // Request is JSON or URL-encoded
    handleMessageCreation(req, res);
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

exports.getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const userId = req.query.user_id || req.body.sender_id;
    if (!userId) return res.status(400).json({ error: "User ID wajib dikirim" });
    const history = await chatService.fetchHistory(userId, receiverId);
    res.status(200).json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: "User ID wajib dikirim" });
    const conversations = await chatService.fetchConversations(userId);
    res.status(200).json(conversations);
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

exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const result = await chatService.deleteMedia(id, user_id);
    deleteUploadedMedia(result.mediaUrl);

    const io = req.app.get('io');
    if (io && result.message?.receiver_id) {
      io.to(result.message.receiver_id).emit('messageMediaDeleted', result.message);
    }

    res.status(200).json({
      message: "Media berhasil dihapus",
      data: result.message,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
