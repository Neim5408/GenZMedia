const pool = require('../../db');

const createStory = async (userId, contentText, mediaUrl, mediaType, backgroundColor) => {
  const result = await pool.query(
    `INSERT INTO post_db.stories (user_id, content_text, media_url, media_type, background_color, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [userId, contentText, mediaUrl, mediaType, backgroundColor]
  );
  const row = result.rows[0];
  return {
    ...row,
    createdAt: row.created_at,
    content: row.content_text,
  };
};

const getStoriesForFollowers = async (userId) => {
  // Include user's own stories and stories from users they follow.
  // Only return stories created within the last 24 hours (Instagram-like behavior).
  const result = await pool.query(
    `SELECT s.id, s.user_id, s.content_text AS content, s.media_url, s.media_type, s.background_color, s.created_at,
            u.username, u.full_name, u.avatar_url AS profile_picture
     FROM post_db.stories s
     JOIN user_db.users_profile u ON s.user_id = u.id
     WHERE (s.user_id = $1 OR s.user_id IN (SELECT following_id FROM user_db.follows WHERE follower_id = $1))
       AND s.created_at >= NOW() - INTERVAL '24 hours'
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows.map((row) => ({
    ...row,
    createdAt: row.created_at,
    user: {
      username: row.username,
      profile_picture: row.profile_picture,
      full_name: row.full_name,
    },
  }));
};

const getStoriesByUser = async (userId) => {
  // Return user's stories created within the last 24 hours
  const result = await pool.query(
    `SELECT s.id, s.user_id, s.content_text AS content, s.media_url, s.media_type, s.background_color, s.created_at,
            u.username, u.full_name, u.avatar_url AS profile_picture
     FROM post_db.stories s
     JOIN user_db.users_profile u ON s.user_id = u.id
     WHERE s.user_id = $1 AND s.created_at >= NOW() - INTERVAL '24 hours'
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows.map((row) => ({
    ...row,
    createdAt: row.created_at,
    user: {
      username: row.username,
      profile_picture: row.profile_picture,
      full_name: row.full_name,
    },
  }));
};

const deleteExpiredStories = async () => {
  await pool.query(
    `DELETE FROM post_db.stories WHERE created_at < NOW() - INTERVAL '24 hours'`
  );
};

const getAllStories = async () => {
  const result = await pool.query(
    `SELECT s.id, s.user_id, s.content_text AS content, s.media_url, s.media_type, s.background_color, s.created_at,
            u.username, u.full_name, u.avatar_url AS profile_picture
     FROM post_db.stories s
     LEFT JOIN user_db.users_profile u ON s.user_id = u.id
     ORDER BY s.created_at DESC`
  );
  return result.rows.map((row) => ({
    ...row,
    createdAt: row.created_at,
    user: {
      username: row.username,
      profile_picture: row.profile_picture,
      full_name: row.full_name,
    },
  }));
};

const deleteStoryById = async (storyId) => {
  const result = await pool.query(
    `DELETE FROM post_db.stories WHERE id = $1 RETURNING *`,
    [storyId]
  );
  return result.rows[0];
};

module.exports = { createStory, getStoriesForFollowers, getStoriesByUser, deleteExpiredStories, getAllStories, deleteStoryById };
