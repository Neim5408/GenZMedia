const pool = require('../../db');

const createPost = async (userId, content, mediaUrl) => {
    const result = await pool.query(
        // PERBAIKAN: Ubah 'content' menjadi 'content_text'
        `INSERT INTO post_db.posts (user_id, content_text, media_url, created_at) 
         VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [userId, content, mediaUrl]
    );
    return result.rows[0];
};

const getAllPosts = async () => {
  const result = await pool.query(
    `SELECT p.*, u.username, u.full_name, u.avatar_url,
            COALESCE(
              (SELECT json_agg(r.user_id) 
               FROM reaction_db.reactions r 
               WHERE r.post_id = p.id AND r.reaction_type = 'LIKE'
              ), '[]'::json
            ) AS likes_count
     FROM post_db.posts p
     LEFT JOIN user_db.users_profile u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

const getPostsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT p.*, u.username, u.full_name, u.avatar_url,
            COALESCE(
              (SELECT json_agg(r.user_id) 
               FROM reaction_db.reactions r 
               WHERE r.post_id = p.id AND r.reaction_type = 'LIKE'
              ), '[]'::json
            ) AS likes_count
     FROM post_db.posts p
     LEFT JOIN user_db.users_profile u ON p.user_id = u.id
     WHERE p.user_id = $1 
     ORDER BY p.created_at DESC`,
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
  // Hapus data terkait terlebih dahulu untuk menghindari pelanggaran constraint foreign key
  await pool.query(`DELETE FROM post_db.post_tags WHERE post_id = $1`, [postId]);
  await pool.query(`DELETE FROM comment_db.comments WHERE post_id = $1`, [postId]);
  await pool.query(`DELETE FROM reaction_db.reactions WHERE post_id = $1`, [postId]);
  await pool.query(`DELETE FROM admin_db.reports WHERE reported_item_id = $1`, [postId]);

  const result = await pool.query(
    `DELETE FROM post_db.posts WHERE id = $1 AND user_id = $2 RETURNING *`,
    [postId, userId]
  );
  return result.rows[0];
};

const deletePostById = async (postId) => {
  // Hapus data terkait terlebih dahulu untuk menghindari pelanggaran constraint foreign key
  await pool.query(`DELETE FROM post_db.post_tags WHERE post_id = $1`, [postId]);
  await pool.query(`DELETE FROM comment_db.comments WHERE post_id = $1`, [postId]);
  await pool.query(`DELETE FROM reaction_db.reactions WHERE post_id = $1`, [postId]);
  await pool.query(`DELETE FROM admin_db.reports WHERE reported_item_id = $1`, [postId]);

  const result = await pool.query(
    `DELETE FROM post_db.posts WHERE id = $1 RETURNING *`,
    [postId]
  );
  return result.rows[0];
};

module.exports = { createPost, getAllPosts, getPostsByUser, updatePost, deletePost, deletePostById };