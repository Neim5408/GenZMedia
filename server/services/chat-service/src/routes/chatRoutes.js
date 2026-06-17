const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/send', chatController.send);
router.get('/conversations', chatController.getConversations);
router.get('/messages/:receiverId', chatController.getMessages);
router.get('/history/:userA/:userB', chatController.getHistory);
router.put('/read', chatController.markAsRead);
router.delete('/messages/:id/media', chatController.deleteMedia);
router.delete('/messages/:id', chatController.destroy);

module.exports = router;
