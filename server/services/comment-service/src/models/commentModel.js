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
    `SELECT * FROM comment_db.comments WHERE post_id = $1 ORDER BY created_at ASC`,
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

module.exports = { createComment, getCommentsByPostId, deleteComment };