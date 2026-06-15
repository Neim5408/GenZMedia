const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/', notificationController.create);             // Service lain menembak ke sini
<<<<<<< HEAD
router.get('/', notificationController.getAll);                 // GET /notification
router.get('/user/:userId', notificationController.getUserNotifications); // Saat buka dropdown notif
router.put('/read-all', notificationController.markReadAll);    // PUT /notification/read-all
router.put('/read/:id', notificationController.markRead);       // PUT /notification/read/:id
router.put('/:id/read', notificationController.markRead);       // PUT /notification/:id/read (original)
router.delete('/:id', notificationController.destroy);         // DELETE /notification/:id
=======
router.get('/user/:userId', notificationController.getUserNotifications); // Saat buka dropdown notif
router.put('/:id/read', notificationController.markRead);    // Klik notif agar statusnya jadi is_read = true
>>>>>>> origin/Kibob_update_home

module.exports = router;