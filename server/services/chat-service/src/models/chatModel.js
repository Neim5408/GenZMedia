const pool = require('../../db');

const ensureMediaColumns = async () => {
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_deleted BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;`);
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
     WHERE (sender_id = $1 AND receiver_id = $2 AND deleted_by_sender = FALSE) 
        OR (sender_id = $2 AND receiver_id = $1 AND deleted_by_receiver = FALSE)
     ORDER BY created_at ASC`,
    [user1, user2] 
  );
  return result.rows;
};

const markMessagesAsRead = async (senderId, receiverId) => {
  // Mark messages as read
  await pool.query(
    `UPDATE chat_db.messages SET is_read = TRUE 
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
    [senderId, receiverId]
  );

  // Mark corresponding chat notifications as read
  try {
    await pool.query(
      `UPDATE notification_db.notifications SET is_read = TRUE 
       WHERE user_id = $2 AND type = 'CHAT' AND reference_id = $1 AND is_read = FALSE`,
      [senderId, receiverId]
    );
  } catch (err) {
    console.warn("Gagal menandai notifikasi chat telah dibaca di database:", err.message);
  }
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
       WHERE (sender_id = $1 AND deleted_by_sender = FALSE) 
          OR (receiver_id = $1 AND deleted_by_receiver = FALSE)
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

const deleteMessage = async (messageId, userId) => {
  await ensureMediaColumns();

  const existing = await pool.query(
    `SELECT * FROM chat_db.messages WHERE id = $1`,
    [messageId]
  );
  const message = existing.rows[0];
  if (!message) return null;

  let query = "";
  let params = [];

  if (message.sender_id === userId) {
    query = `UPDATE chat_db.messages 
             SET deleted_by_sender = TRUE, deleted_by_receiver = TRUE 
             WHERE id = $1 RETURNING *`;
    params = [messageId];
  } else if (message.receiver_id === userId) {
    query = `UPDATE chat_db.messages 
             SET deleted_by_receiver = TRUE 
             WHERE id = $1 RETURNING *`;
    params = [messageId];
  } else {
    throw new Error("Kamu tidak berhak menghapus pesan ini");
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

module.exports = { saveMessage, getChatHistory, markMessagesAsRead, getConversations, deleteMessageMedia, deleteMessage };
