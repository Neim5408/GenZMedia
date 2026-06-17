const chatModel = require('../models/chatModel');

const sendMessage = async (data) => {
  const { sender_id, receiver_id, message_text, media_url } = data;
  if (!sender_id || !receiver_id) {
    throw new Error("Sender dan Receiver wajib diisi");
  }
  if (!message_text && !media_url) {
    throw new Error("Teks pesan atau media lampiran wajib diisi");
  }
  return await chatModel.saveMessage(sender_id, receiver_id, message_text || "", media_url);
};

const fetchHistory = async (userA, userB) => {
  if (!userA || !userB) throw new Error("ID kedua user wajib dikirim");
  return await chatModel.getChatHistory(userA, userB);
};

const readMessages = async (senderId, receiverId) => {
  await chatModel.markMessagesAsRead(senderId, receiverId);
  return { message: "Pesan telah dibaca" };
};

const fetchConversations = async (userId) => {
  if (!userId) throw new Error("User ID wajib dikirim");
  return await chatModel.getConversations(userId);
};

const deleteMedia = async (messageId, userId) => {
  if (!messageId || !userId) throw new Error("Message ID dan User ID wajib dikirim");

  const result = await chatModel.deleteMessageMedia(messageId, userId);
  if (!result) throw new Error("Media tidak ditemukan atau kamu tidak berhak menghapusnya");

  return result;
};

const deleteMessage = async (messageId, userId) => {
  if (!messageId || !userId) throw new Error("Message ID dan User ID wajib dikirim");
  return await chatModel.deleteMessage(messageId, userId);
};

module.exports = { sendMessage, fetchHistory, readMessages, fetchConversations, deleteMedia, deleteMessage };
