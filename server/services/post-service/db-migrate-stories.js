const pool = require('./db');
const sql = `CREATE SCHEMA IF NOT EXISTS post_db;

CREATE TABLE IF NOT EXISTS post_db.stories (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content_text TEXT,
  media_url TEXT,
  media_type VARCHAR(20) DEFAULT 'text',
  background_color VARCHAR(20),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_created_at ON post_db.stories (created_at DESC);
`;

pool.query(sql)
  .then(() => {
    console.log('Migration complete');
    pool.end();
  })
  .catch(err => {
    console.error('Migration error', err);
    pool.end();
    process.exit(1);
  });
