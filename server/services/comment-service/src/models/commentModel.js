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
    `SELECT c.*, u.username, u.full_name, u.avatar_url
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

const toggleHideComment = async (commentId, userId) => {
  const result = await pool.query(
    `UPDATE comment_db.comments c
     SET is_hidden = NOT c.is_hidden
     FROM post_db.posts p
     WHERE c.id = $1 AND c.post_id = p.id AND p.user_id = $2
     RETURNING c.*`,
    [commentId, userId]
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

const getPostAuthor = async (postId) => {
  const result = await pool.query(
    `SELECT user_id FROM post_db.posts WHERE id = $1`,
    [postId]
  );
  return result.rows[0] ? result.rows[0].user_id : null;
};

module.exports = { createComment, getCommentsByPostId, deleteComment, deleteCommentById, toggleHideComment, getAllComments, getPostAuthor };