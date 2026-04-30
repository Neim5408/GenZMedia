const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/send', chatController.send);
router.get('/history/:userA/:userB', chatController.getHistory);
router.put('/read', chatController.markAsRead);

module.exports = router;