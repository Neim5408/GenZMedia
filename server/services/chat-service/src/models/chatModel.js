const pool = require('../../db');

const saveMessage = async (senderId, receiverId, messageText, mediaUrl = null) => {
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;`);
  } catch (err) {
    console.warn("Gagal alter table chat_db.messages:", err.message);
  }

  const result = await pool.query(
    `INSERT INTO chat_db.messages (sender_id, receiver_id, message_text, media_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [senderId, receiverId, messageText, mediaUrl]
  );
  return result.rows[0];
};

const getChatHistory = async (user1, user2) => {
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;`);
  } catch (err) {
    console.warn("Gagal alter table chat_db.messages:", err.message);
  }

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
  await pool.query(
    `UPDATE chat_db.messages SET is_read = TRUE 
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
    [senderId, receiverId]
  );
};

const getConversations = async (userId) => {
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS media_url TEXT;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;`);
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
              CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as partner_id,
              deleted_by_sender, deleted_by_receiver
       FROM chat_db.messages
       WHERE sender_id = $1 OR receiver_id = $1
     ) m
     JOIN user_db.users_profile u ON m.partner_id = u.id
     WHERE (m.sender_id = $1 AND m.deleted_by_sender = FALSE)
        OR (m.receiver_id = $1 AND m.deleted_by_receiver = FALSE)
     ORDER BY partner_id, m.created_at DESC`,
    [userId]
  );
  
  return result.rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const deleteMessage = async (messageId, userId) => {
  try {
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE chat_db.messages ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;`);
  } catch (err) {
    console.warn("Gagal alter table chat_db.messages:", err.message);
  }

  const messageResult = await pool.query(
    `SELECT * FROM chat_db.messages WHERE id = $1`,
    [messageId]
  );
  
  if (messageResult.rows.length === 0) {
    throw new Error("Pesan tidak ditemukan");
  }
  
  const message = messageResult.rows[0];
  let result;
  
  if (message.sender_id === userId) {
    result = await pool.query(
      `UPDATE chat_db.messages SET deleted_by_sender = TRUE, deleted_by_receiver = TRUE WHERE id = $1 RETURNING *`,
      [messageId]
    );
  } else if (message.receiver_id === userId) {
    result = await pool.query(
      `UPDATE chat_db.messages SET deleted_by_receiver = TRUE WHERE id = $1 RETURNING *`,
      [messageId]
    );
  } else {
    throw new Error("Anda tidak memiliki akses untuk menghapus pesan ini");
  }
  
  return result.rows[0];
};

module.exports = { saveMessage, getChatHistory, markMessagesAsRead, getConversations, deleteMessage };
