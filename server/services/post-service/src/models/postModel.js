const pool = require('../../db');

const createPost = async (userId, contentText, mediaUrl, isAnonymous) => {
  const result = await pool.query(
    `INSERT INTO post_db.posts (user_id, content_text, media_url, is_anonymous)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, contentText, mediaUrl, isAnonymous || false]
  );
  return result.rows[0];
};

const getAllPosts = async () => {
  const result = await pool.query(
    `SELECT * FROM post_db.posts ORDER BY created_at DESC`
  );
  return result.rows;
};

const getPostsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM post_db.posts WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const updatePost = async (postId, userId, contentText, mediaUrl) => {
  const result = await pool.query(
    `UPDATE post_db.posts 
     SET content_text = COALESCE($1, content_text), 
         media_url = COALESCE($2, media_url), 
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = $3 AND user_id = $4 RETURNING *`,
    [contentText, mediaUrl, postId, userId]
  );
  return result.rows[0];
};

const deletePost = async (postId, userId) => {
  const result = await pool.query(
    `DELETE FROM post_db.posts WHERE id = $1 AND user_id = $2 RETURNING *`,
    [postId, userId]
  );
  return result.rows[0];
};

module.exports = { createPost, getAllPosts, getPostsByUser, updatePost, deletePost };