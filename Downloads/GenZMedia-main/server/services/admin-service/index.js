require('dotenv').config();
const express = require('express');
const pool = require('../../db');

const app = express();
app.use(express.json());

// ==========================================
// ADMIN: MODERASI USER
// ==========================================
app.delete('/admin/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. CEK DATA SEBELUM DELETE
    const checkUser = await pool.query(
      `SELECT id FROM user_db.users_profile WHERE id = $1`, 
      [userId]
    );
    
    // Validasi & Status Code (404)
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: "Gagal: User tidak ditemukan di database" });
    }

    // 2. CLEANUP RELASI LINTAS TABEL (Mencegah Data Kotor)
    // A. Hapus semua jejak relasi follow (sebagai follower atau following)
    await pool.query(
      `DELETE FROM user_db.follows WHERE follower_id = $1 OR following_id = $1`,
      [userId]
    );

    // B. Hapus semua postingan milik user ini (karena Admin punya akses ke schema post_db)
    await pool.query(
      `DELETE FROM post_db.posts WHERE user_id = $1`,
      [userId]
    );

    // C. (Opsional) Jika nanti ada tabel comment_db, tambahkan query hapusnya di sini

    // 3. EKSEKUSI HAPUS DATA UTAMA
    await pool.query(
      `DELETE FROM user_db.users_profile WHERE id = $1`,
      [userId]
    );

    // Status Code (200 OK)
    res.status(200).json({ message: "Berhasil: User beserta seluruh relasi dan postingannya telah dihapus" });

  } catch (err) {
    // Error Handling (500)
    console.error("Error Delete User (Admin):", err);
    res.status(500).json({ error: "Terjadi kesalahan internal pada Admin Service" });
  }
});

// ==========================================
// ADMIN: MODERASI POST
// ==========================================
app.delete('/admin/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // 1. CEK DATA SEBELUM DELETE
    const checkPost = await pool.query(
      `SELECT id FROM post_db.posts WHERE id = $1`,
      [postId]
    );

    if (checkPost.rows.length === 0) {
      return res.status(404).json({ error: "Gagal: Post tidak ditemukan" });
    }

    // 2. CLEANUP RELASI POST
    // Hapus semua tag yang menempel pada post ini
    await pool.query(
      `DELETE FROM post_db.post_tags WHERE post_id = $1`,
      [postId]
    );

    // 3. EKSEKUSI HAPUS POST UTAMA
    await pool.query(
      `DELETE FROM post_db.posts WHERE id = $1`,
      [postId]
    );

    res.status(200).json({ message: "Berhasil: Post dan tag terkait telah dihapus oleh Admin" });

  } catch (err) {
    console.error("Error Delete Post (Admin):", err);
    res.status(500).json({ error: "Terjadi kesalahan internal pada Admin Service" });
  }
});

app.listen(50060, () => {
  console.log("Admin Service running on port 50060");
});