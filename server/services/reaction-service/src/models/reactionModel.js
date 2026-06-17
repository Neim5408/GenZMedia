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
    `SELECT r.*, u.username, u.full_name, u.avatar_url 
     FROM reaction_db.reactions r
     LEFT JOIN user_db.users_profile u ON r.user_id = u.id
     WHERE r.post_id = $1`,
    [postId]
  );
  return result.rows;
};

const getReactionsByComment = async (commentId) => {
  const result = await pool.query(
    `SELECT r.*, u.username, u.full_name, u.avatar_url 
     FROM reaction_db.reactions r
     LEFT JOIN user_db.users_profile u ON r.user_id = u.id
     WHERE r.comment_id = $1`,
    [commentId]
  );
  return result.rows;
};

const getReactionByUserAndTarget = async (userId, postId, commentId) => {
  if (postId) {
    const result = await pool.query(
      `SELECT * FROM reaction_db.reactions 
       WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );
    return result.rows[0];
  } else if (commentId) {
    const result = await pool.query(
      `SELECT * FROM reaction_db.reactions 
       WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );
    return result.rows[0];
  }
  return null;
};

const removeReaction = async (reactionId, userId) => {
  const result = await pool.query(
    `DELETE FROM reaction_db.reactions WHERE id = $1 AND user_id = $2 RETURNING *`,
    [reactionId, userId]
  );
  return result.rows[0];
};

const getPostAuthor = async (postId) => {
  const result = await pool.query(
    `SELECT user_id FROM post_db.posts WHERE id = $1`,
    [postId]
  );
  return result.rows[0] ? result.rows[0].user_id : null;
};

module.exports = { addReaction, getReactionsByPost, getReactionsByComment, getReactionByUserAndTarget, removeReaction, getPostAuthor };