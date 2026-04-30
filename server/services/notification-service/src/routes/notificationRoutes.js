const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/', notificationController.create);             // Service lain menembak ke sini
router.get('/user/:userId', notificationController.getUserNotifications); // Saat buka dropdown notif
router.put('/:id/read', notificationController.markRead);    // Klik notif agar statusnya jadi is_read = true

module.exports = router;