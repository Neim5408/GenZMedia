require('dotenv').config();
const express = require('express');
const pool = require('../../db');

const app = express();
app.use(express.json());

/* =========================
   ADD COMMENT
========================= */
app.post('/comment', async (req, res) => {
  const { post_id, user_id, parent_id, content } = req.body;

  const result = await pool.query(
    `INSERT INTO comment_db.comments (post_id, user_id, parent_id, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [post_id, user_id, parent_id || null, content]
  );

  res.json(result.rows[0]);
});

/* =========================
   GET COMMENTS BY POST
========================= */
app.get('/comments/:post_id', async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM comment_db.comments WHERE post_id = $1`,
    [req.params.post_id]
  );

  res.json(result.rows);
});

app.listen(50054, () => {
  console.log("Comment Service running on 50054");
});