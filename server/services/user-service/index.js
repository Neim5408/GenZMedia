require('dotenv').config();
const express = require('express');
const pool = require('../../db');

const app = express();
app.use(express.json());

// ==========================================
// USER PROFILE ROUTES
// ==========================================

// CREATE USER
app.post('/user', async (req, res) => {
  try {
    const { id, username, bio } = req.body;

    // VALIDASI INPUT
    if (!id || !username) {
      return res.status(400).json({ error: "ID dan Username wajib diisi" });
    }

    const result = await pool.query(
      `INSERT INTO user_db.users_profile (id, username, bio)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, username, bio]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error Create User:", err);
    if (err.code === '23505') { 
      return res.status(409).json({ error: "User ID atau Username sudah terdaftar!" });
    }
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// GET USER
app.get('/user/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM user_db.users_profile WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error Get User:", err);
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// UPDATE USER (Dengan fitur Partial Update COALESCE)
app.put('/user/:id', async (req, res) => {
  try {
    const { username, bio, avatar_url } = req.body;
    const userId = req.params.id;

    // 1. VALIDASI INPUT (Minimal 1 field harus diisi)
    if (!username && !bio && !avatar_url) {
      return res.status(400).json({ error: "Minimal satu field harus diisi untuk update" });
    }

    // 2. CEK DATA SEBELUM UPDATE
    const checkUser = await pool.query(`SELECT id FROM user_db.users_profile WHERE id = $1`, [userId]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: "Update gagal: User tidak ditemukan di database" });
    }

    // 3. UPDATE MENGGUNAKAN COALESCE
    const result = await pool.query(
      `UPDATE user_db.users_profile
       SET username = COALESCE($1, username),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING *`,
      [username, bio, avatar_url, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error Update User:", err);
    if (err.code === '23505') {
      return res.status(409).json({ error: "Update gagal: Username sudah dipakai oleh orang lain" });
    }
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// DELETE USER (Dengan Pembersihan Relasi / Cascade)
app.delete('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. CEK DATA SEBELUM DELETE
    const checkUser = await pool.query(`SELECT id FROM user_db.users_profile WHERE id = $1`, [userId]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: "Delete gagal: User tidak ditemukan" });
    }

    // 2. BERSIHKAN RELASI DULU (Hapus jejak follow)
    await pool.query(
      `DELETE FROM user_db.follows WHERE follower_id = $1 OR following_id = $1`,
      [userId]
    );

    // 3. BARU HAPUS PROFILNYA
    await pool.query(`DELETE FROM user_db.users_profile WHERE id = $1`, [userId]);
    
    res.json({ message: "User beserta seluruh relasi follow berhasil dihapus" });

  } catch (err) {
    console.error("Error Delete User:", err);
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// ==========================================
// FOLLOW SYSTEM ROUTES
// ==========================================

// FOLLOW USER (Dengan Validasi Akun Asli)
app.post('/follow', async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;

    if (!follower_id || !following_id) {
      return res.status(400).json({ error: "Data follower_id dan following_id wajib dikirim" });
    }

    if (follower_id === following_id) {
      return res.status(400).json({ error: "Anda tidak dapat mem-follow diri sendiri" });
    }

    // CEK DATA: Pastikan follower_id (yang mau follow) itu akun valid
    const checkFollower = await pool.query(
      `SELECT id FROM user_db.users_profile WHERE id = $1`,
      [follower_id]
    );
    if (checkFollower.rows.length === 0) {
      return res.status(404).json({ error: "Gagal: Akun Anda (Follower) tidak ditemukan" });
    }

    // CEK DATA: Pastikan following_id (yang mau diikuti) itu beneran ada
    const checkTarget = await pool.query(
      `SELECT id FROM user_db.users_profile WHERE id = $1`,
      [following_id]
    );
    if (checkTarget.rows.length === 0) {
       return res.status(404).json({ error: "Gagal: User yang ingin diikuti tidak ditemukan" });
    }

    // PREVENT DUPLICATE FOLLOW
    const checkFollow = await pool.query(
      `SELECT id FROM user_db.follows WHERE follower_id = $1 AND following_id = $2`,
      [follower_id, following_id]
    );
    if (checkFollow.rows.length > 0) {
      return res.status(400).json({ error: "Anda sudah mem-follow user ini" });
    }

    const result = await pool.query(
      `INSERT INTO user_db.follows (follower_id, following_id)
       VALUES ($1, $2)
       RETURNING *`,
      [follower_id, following_id]
    );

    res.status(201).json({ message: "Berhasil follow user!", data: result.rows[0] });
  } catch (err) {
    console.error("Error Follow User:", err);
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// UNFOLLOW USER
app.delete('/unfollow', async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;

    if (!follower_id || !following_id) {
      return res.status(400).json({ error: "Data follower_id dan following_id wajib dikirim" });
    }

    // BUSINESS LOGIC: Cek relasi (Tidak bisa unfollow kalau dari awal belum follow)
    const checkFollow = await pool.query(
      `SELECT id FROM user_db.follows WHERE follower_id = $1 AND following_id = $2`,
      [follower_id, following_id]
    );
    if (checkFollow.rows.length === 0) {
      return res.status(400).json({ error: "Gagal unfollow: Anda belum mengikuti user ini" });
    }

    await pool.query(
      `DELETE FROM user_db.follows
       WHERE follower_id = $1 AND following_id = $2`,
      [follower_id, following_id]
    );

    res.json({ message: "Berhasil unfollow user" });
  } catch (err) {
    console.error("Error Unfollow User:", err);
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// GET FOLLOWERS
app.get('/followers/:user_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM user_db.follows f
       JOIN user_db.users_profile u
       ON f.follower_id = u.id
       WHERE f.following_id = $1`,
      [req.params.user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error Get Followers:", err);
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

// GET FOLLOWING
app.get('/following/:user_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM user_db.follows f
       JOIN user_db.users_profile u
       ON f.following_id = u.id
       WHERE f.follower_id = $1`,
      [req.params.user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error Get Following:", err);
    res.status(500).json({ error: "Terjadi kesalahan internal server" });
  }
});

app.listen(50052, () => {
  console.log("User Service running on port 50052");
});