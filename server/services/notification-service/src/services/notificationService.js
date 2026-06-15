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

const readAllNotifications = async (userId) => {
  if (!userId) throw new Error("User ID wajib diisi");
  return await notificationModel.markAllAsRead(userId);
};

const removeNotification = async (id) => {
  if (!id) throw new Error("Notification ID wajib diisi");
  const deleted = await notificationModel.deleteNotification(id);
  if (!deleted) throw new Error("Notifikasi tidak ditemukan");
  return deleted;
};

module.exports = { addNotification, fetchUserNotifications, readNotification, readAllNotifications, removeNotification };