require('dotenv').config();
const express = require('express');
const pool = require('../../db');

const app = express();
app.use(express.json());

/* =========================
   CREATE POST
========================= */
app.post('/post', async (req, res) => {
  const { id, user_id, content, image_url } = req.body;

  const result = await pool.query(
    `INSERT INTO post_db.posts (id, user_id, content_text, media_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, user_id, content, image_url]
  );

  res.json(result.rows[0]);
});

/* =========================
   GET ALL POSTS
========================= */
app.get('/posts', async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM post_db.posts ORDER BY created_at DESC`
  );

  res.json(result.rows);
});

/* =========================
   GET POST BY ID
========================= */
app.get('/post/:id', async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM post_db.posts WHERE id = $1`,
    [req.params.id]
  );

  res.json(result.rows[0]);
});

app.listen(50053, () => {
  console.log("Post Service running on 50053");
});