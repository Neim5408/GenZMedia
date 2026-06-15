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

exports.getAll = async (req, res) => {
  try {
    const userId = req.query.user_id || req.body.user_id;
    if (!userId) return res.status(400).json({ error: "User ID wajib dikirim" });
    const notifications = await notificationService.fetchUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.markReadAll = async (req, res) => {
  try {
    const userId = req.body.user_id || req.query.user_id;
    if (!userId) return res.status(400).json({ error: "User ID wajib dikirim" });
    await notificationService.readAllNotifications(userId);
    res.status(200).json({ message: "Semua notifikasi ditandai telah dibaca" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationService.removeNotification(id);
    res.status(200).json({ message: "Notifikasi berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};