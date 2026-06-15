const pool = require('../../db');

const ensureMediaColumns = async () => {
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_deleted BOOLEAN DEFAULT FALSE;`);
  } catch (err) {
    console.warn("Gagal memastikan kolom media chat:", err.message);
  }
};

const saveMessage = async (senderId, receiverId, messageText, mediaUrl = null) => {
  await ensureMediaColumns();

  const result = await pool.query(
    `INSERT INTO chat_db.messages (sender_id, receiver_id, message_text, media_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [senderId, receiverId, messageText, mediaUrl]
  );
  return result.rows[0];
};

const getChatHistory = async (user1, user2) => {
  await ensureMediaColumns();

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

const getConversations = async (userId) => {
  await ensureMediaColumns();

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

const deleteMessageMedia = async (messageId, userId) => {
  await ensureMediaColumns();

  const existing = await pool.query(
    `SELECT * FROM chat_db.messages WHERE id = $1 AND sender_id = $2`,
    [messageId, userId]
  );

  const message = existing.rows[0];
  if (!message || !message.media_url) return null;

  const updated = await pool.query(
    `UPDATE chat_db.messages
     SET media_url = NULL, media_deleted = TRUE
     WHERE id = $1 AND sender_id = $2
     RETURNING *`,
    [messageId, userId]
  );

  return {
    message: updated.rows[0],
    mediaUrl: message.media_url,
  };
};

module.exports = { saveMessage, getChatHistory, markMessagesAsRead, getConversations, deleteMessageMedia };
