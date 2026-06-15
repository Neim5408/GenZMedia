const pool = require('../../db');

<<<<<<< HEAD
const createNotification = async (userId, type, referenceId, postId) => {
  const result = await pool.query(
    `INSERT INTO notification_db.notifications (user_id, type, reference_id, post_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, type, referenceId, postId]
=======
const createNotification = async (userId, type, referenceId) => {
  const result = await pool.query(
    `INSERT INTO notification_db.notifications (user_id, type, reference_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, type, referenceId]
>>>>>>> origin/Kibob_update_home
  );
  return result.rows[0];
};

const getUserNotifications = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM notification_db.notifications 
     WHERE user_id = $1 ORDER BY created_at DESC`,
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

<<<<<<< HEAD
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

module.exports = { createNotification, getUserNotifications, markAsRead, markAllAsRead, deleteNotification };
=======
module.exports = { createNotification, getUserNotifications, markAsRead };
>>>>>>> origin/Kibob_update_home
