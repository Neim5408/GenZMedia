const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/send', chatController.send);
<<<<<<< HEAD
router.get('/conversations', chatController.getConversations);
router.get('/messages/:receiverId', chatController.getMessages);
=======
>>>>>>> origin/Kibob_update_home
router.get('/history/:userA/:userB', chatController.getHistory);
router.put('/read', chatController.markAsRead);

module.exports = router;