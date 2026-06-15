const chatModel = require('../models/chatModel');

const sendMessage = async (data) => {
<<<<<<< HEAD
  const { sender_id, receiver_id, message_text, media_url } = data;
  if (!sender_id || !receiver_id) {
    throw new Error("Sender dan Receiver wajib diisi");
  }
  if (!message_text && !media_url) {
    throw new Error("Teks pesan atau media lampiran wajib diisi");
  }
  return await chatModel.saveMessage(sender_id, receiver_id, message_text || "", media_url);
=======
  const { sender_id, receiver_id, message_text } = data;
  if (!sender_id || !receiver_id || !message_text) {
    throw new Error("Sender, Receiver, dan Teks Pesan wajib diisi");
  }
  return await chatModel.saveMessage(sender_id, receiver_id, message_text);
>>>>>>> origin/Kibob_update_home
};

const fetchHistory = async (userA, userB) => {
  if (!userA || !userB) throw new Error("ID kedua user wajib dikirim");
  return await chatModel.getChatHistory(userA, userB);
};

const readMessages = async (senderId, receiverId) => {
  await chatModel.markMessagesAsRead(senderId, receiverId);
  return { message: "Pesan telah dibaca" };
};

<<<<<<< HEAD
const fetchConversations = async (userId) => {
  if (!userId) throw new Error("User ID wajib dikirim");
  return await chatModel.getConversations(userId);
};

module.exports = { sendMessage, fetchHistory, readMessages, fetchConversations };
=======
module.exports = { sendMessage, fetchHistory, readMessages };
>>>>>>> origin/Kibob_update_home
