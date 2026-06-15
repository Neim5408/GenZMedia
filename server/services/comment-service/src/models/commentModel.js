const pool = require('../../db');

const createComment = async (postId, userId, content, parentId = null) => {
  const result = await pool.query(
    `INSERT INTO comment_db.comments (post_id, user_id, content, parent_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [postId, userId, content, parentId]
  );
  return result.rows[0];
};

const getCommentsByPostId = async (postId) => {
  const result = await pool.query(
    `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.is_hidden,
            u.username, u.full_name, u.avatar_url
     FROM comment_db.comments c
     LEFT JOIN user_db.users_profile u ON c.user_id = u.id
     WHERE c.post_id = $1 
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows;
};

const deleteComment = async (commentId, userId) => {
  const result = await pool.query(
    `DELETE FROM comment_db.comments WHERE id = $1 AND user_id = $2 RETURNING *`,
    [commentId, userId]
  );
  return result.rows[0];
};

const deleteCommentById = async (commentId) => {
  const result = await pool.query(
    `DELETE FROM comment_db.comments WHERE id = $1 RETURNING *`,
    [commentId]
  );
  return result.rows[0];
};

const getCommentById = async (commentId) => {
  const result = await pool.query(
    `SELECT * FROM comment_db.comments WHERE id = $1`,
    [commentId]
  );
  return result.rows[0];
};

const updateCommentHideStatus = async (commentId, isHidden) => {
  const result = await pool.query(
    `UPDATE comment_db.comments SET is_hidden = $2 WHERE id = $1 RETURNING *`,
    [commentId, isHidden]
  );
  return result.rows[0];
};

const getAllComments = async () => {
  const result = await pool.query(
    `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.is_hidden,
            u.username, u.full_name, u.avatar_url
     FROM comment_db.comments c
     LEFT JOIN user_db.users_profile u ON c.user_id = u.id
     ORDER BY c.created_at DESC`
  );
  return result.rows;
};

module.exports = { 
  createComment, 
  getCommentsByPostId, 
  deleteComment, 
  deleteCommentById, 
  getAllComments,
  getCommentById,
  updateCommentHideStatus
};
