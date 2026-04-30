const notificationModel = require('../models/notificationModel');

const addNotification = async (data) => {
  const { user_id, type, reference_id } = data;
  if (!user_id || !type) throw new Error("User ID dan Tipe notifikasi wajib diisi");
  
  return await notificationModel.createNotification(user_id, type, reference_id);
};

const fetchUserNotifications = async (userId) => {
  return await notificationModel.getUserNotifications(userId);
};

const readNotification = async (id) => {
  const updated = await notificationModel.markAsRead(id);
  if (!updated) throw new Error("Notifikasi tidak ditemukan");
  return updated;
};

module.exports = { addNotification, fetchUserNotifications, readNotification };