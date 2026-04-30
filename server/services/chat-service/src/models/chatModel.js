const pool = require('../../db');

const saveMessage = async (senderId, receiverId, messageText) => {
  const result = await pool.query(
    `INSERT INTO chat_db.messages (sender_id, receiver_id, message_text)
     VALUES ($1, $2, $3) RETURNING *`,
    [senderId, receiverId, messageText]
  );
  return result.rows[0];
};

const getChatHistory = async (user1, user2) => {
  const result = await pool.query(
    `SELECT * FROM chat_db.messages 
     WHERE (sender_id = $1 AND receiver_id = $2) 
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at ASC`,
    [user1, user2] // Mengambil pesan dari A ke B, dan B ke A
  );
  return result.rows;
};

const markMessagesAsRead = async (senderId, receiverId) => {
  await pool.query(
    `UPDATE chat_db.messages SET is_read = TRUE 
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
    [senderId, receiverId]
  );
};

module.exports = { saveMessage, getChatHistory, markMessagesAsRead };