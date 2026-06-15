-- Run this SQL against the database (schema: post_db)
CREATE SCHEMA IF NOT EXISTS post_db;

CREATE TABLE IF NOT EXISTS post_db.stories (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  content_text TEXT,
  media_url TEXT,
  media_type VARCHAR(20) DEFAULT 'text',
  background_color VARCHAR(20),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Index to quickly fetch recent stories
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON post_db.stories (created_at DESC);
