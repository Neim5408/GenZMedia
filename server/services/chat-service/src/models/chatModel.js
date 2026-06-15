const pool = require('../../db');

<<<<<<< HEAD
const saveMessage = async (senderId, receiverId, messageText, mediaUrl = null) => {
  // Pastikan kolom media_url ada di database
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
  } catch (err) {
    console.warn("Gagal alter table chat_db.messages:", err.message);
  }

  const result = await pool.query(
    `INSERT INTO chat_db.messages (sender_id, receiver_id, message_text, media_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [senderId, receiverId, messageText, mediaUrl]
=======
const saveMessage = async (senderId, receiverId, messageText) => {
  const result = await pool.query(
    `INSERT INTO chat_db.messages (sender_id, receiver_id, message_text)
     VALUES ($1, $2, $3) RETURNING *`,
    [senderId, receiverId, messageText]
>>>>>>> origin/Kibob_update_home
  );
  return result.rows[0];
};

const getChatHistory = async (user1, user2) => {
<<<<<<< HEAD
  // Pastikan kolom media_url ada di database saat fetch history
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
  } catch (err) {
    console.warn("Gagal alter table chat_db.messages:", err.message);
  }

=======
>>>>>>> origin/Kibob_update_home
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

<<<<<<< HEAD
const getConversations = async (userId) => {
  // Pastikan kolom media_url ada
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
  } catch (err) {
    console.warn("Gagal alter table chat_db.messages:", err.message);
  }

  const result = await pool.query(
    `SELECT DISTINCT ON (partner_id) 
            partner_id, 
            u.username, 
            u.full_name, 
            u.avatar_url,
            m.message_text,
            m.media_url,
            m.created_at
     FROM (
       SELECT id, sender_id, receiver_id, message_text, media_url, created_at,
              CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as partner_id
       FROM chat_db.messages
       WHERE sender_id = $1 OR receiver_id = $1
     ) m
     JOIN user_db.users_profile u ON m.partner_id = u.id
     ORDER BY partner_id, m.created_at DESC`,
    [userId]
  );
  
  return result.rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

module.exports = { saveMessage, getChatHistory, markMessagesAsRead, getConversations };
=======
module.exports = { saveMessage, getChatHistory, markMessagesAsRead };
>>>>>>> origin/Kibob_update_home
