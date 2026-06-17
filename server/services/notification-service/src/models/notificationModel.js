const pool = require('../../db');

const createNotification = async (userId, type, referenceId, postId) => {
  const result = await pool.query(
    `INSERT INTO notification_db.notifications (user_id, type, reference_id, post_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, type, referenceId, postId || null]
  );
  return result.rows[0];
};

const getUserNotifications = async (userId) => {
  const result = await pool.query(
    `SELECT n.*, p.user_id AS post_author_id
     FROM notification_db.notifications n
     LEFT JOIN post_db.posts p ON (CASE WHEN n.post_id IS NOT NULL AND n.post_id <> '' THEN n.post_id::uuid ELSE NULL END) = p.id
     WHERE n.user_id = $1 
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const markAsRead = async (id) => {
  const result = await pool.query(
    `UPDATE notification_db.notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const markAllAsRead = async (userId) => {
  const result = await pool.query(
    `UPDATE notification_db.notifications SET is_read = TRUE WHERE user_id = $1 RETURNING *`,
    [userId]
  );
  return result.rows;
};

const deleteNotification = async (id) => {
  const result = await pool.query(
    `DELETE FROM notification_db.notifications WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const markPostCommentsAsRead = async (userId, postId) => {
  const result = await pool.query(
    `UPDATE notification_db.notifications 
     SET is_read = TRUE 
     WHERE user_id = $1 AND post_id = $2 AND type = 'COMMENT' AND is_read = FALSE
     RETURNING *`,
    [userId, postId]
  );
  return result.rows;
};

module.exports = { createNotification, getUserNotifications, markAsRead, markAllAsRead, deleteNotification, markPostCommentsAsRead };