const pool = require('../../db');

const createUser = async (id, username, fullName, birthday, bio) => {
  const result = await pool.query(
    `INSERT INTO user_db.users_profile (id, username, full_name, birthday, bio) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, username, fullName, birthday, bio]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM user_db.users_profile WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateUserProfileData = async (id, fullName, bio, avatarUrl, coverUrl) => {
    const result = await pool.query(
        `UPDATE user_db.users_profile 
         SET full_name = $1, bio = $2, avatar_url = $3, cover_photo_url = $4
         WHERE id = $5 RETURNING *`,
        [fullName, bio, avatarUrl, coverUrl, id]
    );
    return result.rows[0];
};

// Menggunakan tabel user_db.follows
const followUser = async (followerId, followingId) => {
  const result = await pool.query(
    `INSERT INTO user_db.follows (follower_id, following_id)
     VALUES ($1, $2) RETURNING *`,
    [followerId, followingId]
  );
  return result.rows[0];
};

const unfollowUser = async (followerId, followingId) => {
  const result = await pool.query(
    `DELETE FROM user_db.follows 
     WHERE follower_id = $1 AND following_id = $2 RETURNING *`,
    [followerId, followingId]
  );
  return result.rows[0];
};

const getFollowers = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar_url FROM user_db.follows f
     JOIN user_db.users_profile u ON f.follower_id = u.id
     WHERE f.following_id = $1`, [userId]
  );
  return result.rows;
};

const getFollowing = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar_url FROM user_db.follows f
     JOIN user_db.users_profile u ON f.following_id = u.id
     WHERE f.follower_id = $1`, [userId]
  );
  return result.rows;
};

const deleteUser = async (id) => {
  const result = await pool.query(
    'DELETE FROM user_db.users_profile WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

module.exports = { 
    createUser, 
    getUserById, 
    followUser, 
    unfollowUser, 
    getFollowing, 
    getFollowers, 
    deleteUser,
    updateUserProfileData
};