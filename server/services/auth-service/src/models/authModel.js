const pool = require('../../db');

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM auth_db.users_auth WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const createUserAuth = async (email, passwordHash) => {
  const result = await pool.query(
    'INSERT INTO auth_db.users_auth (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
};

const createSession = async (userId, token, expiredAt) => {
  await pool.query(
    'INSERT INTO auth_db.sessions (user_id, token, expired_at) VALUES ($1, $2, $3)',
    [userId, token, expiredAt]
  );
};

const deleteSession = async (token) => {
  return await pool.query('DELETE FROM auth_db.sessions WHERE token = $1', [token]);
};

const deleteUserAuth = async (id) => {
  await pool.query('DELETE FROM auth_db.sessions WHERE user_id = $1', [id]);
  await pool.query('DELETE FROM auth_db.users_auth WHERE id = $1', [id]);
};

module.exports = { findUserByEmail, createUserAuth, createSession, deleteSession, deleteUserAuth };