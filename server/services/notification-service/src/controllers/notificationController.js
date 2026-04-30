const notificationService = require('../services/notificationService');

exports.create = async (req, res) => {
  try {
    // 1. Simpan ke database
    const notification = await notificationService.addNotification(req.body);
    
    // 2. Tembak notifikasi real-time (WebSockets) ke user_id tersebut
    const io = req.app.get('io');
    io.to(notification.user_id).emit('newNotification', notification);
    
    res.status(201).json({ message: "Notifikasi disimpan & dikirim", notification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.fetchUserNotifications(req.params.userId);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await notificationService.readNotification(req.params.id);
    res.status(200).json({ message: "Notifikasi telah dibaca", notification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};