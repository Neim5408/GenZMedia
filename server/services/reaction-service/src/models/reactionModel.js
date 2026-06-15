const pool = require('../../db');

const addReaction = async (userId, postId, commentId, reactionType) => {
  const result = await pool.query(
    `INSERT INTO reaction_db.reactions (user_id, post_id, comment_id, reaction_type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, postId, commentId, reactionType]
  );
  return result.rows[0];
};

const getReactionsByPost = async (postId) => {
  const result = await pool.query(
    `SELECT * FROM reaction_db.reactions WHERE post_id = $1`,
    [postId]
  );
  return result.rows;
};

const getReactionsByComment = async (commentId) => {
  const result = await pool.query(
    `SELECT * FROM reaction_db.reactions WHERE comment_id = $1`,
    [commentId]
  );
  return result.rows;
};

const removeReaction = async (reactionId, userId) => {
  const result = await pool.query(
    `DELETE FROM reaction_db.reactions WHERE id = $1 AND user_id = $2 RETURNING *`,
    [reactionId, userId]
  );
  return result.rows[0];
};

module.exports = { addReaction, getReactionsByPost, getReactionsByComment, removeReaction };