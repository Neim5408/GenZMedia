const chatModel = require('../models/chatModel');

const sendMessage = async (data) => {
  const { sender_id, receiver_id, message_text } = data;
  if (!sender_id || !receiver_id || !message_text) {
    throw new Error("Sender, Receiver, dan Teks Pesan wajib diisi");
  }
  return await chatModel.saveMessage(sender_id, receiver_id, message_text);
};

const fetchHistory = async (userA, userB) => {
  if (!userA || !userB) throw new Error("ID kedua user wajib dikirim");
  return await chatModel.getChatHistory(userA, userB);
};

const readMessages = async (senderId, receiverId) => {
  await chatModel.markMessagesAsRead(senderId, receiverId);
  return { message: "Pesan telah dibaca" };
};

module.exports = { sendMessage, fetchHistory, readMessages };