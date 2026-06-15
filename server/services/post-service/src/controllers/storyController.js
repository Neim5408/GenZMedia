const storyService = require('../services/storyService');
const multer = require('multer');
const path = require('path');

// Multer storage untuk story
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/stories');
  },
  filename: (req, file, cb) => {
    cb(null, 'story-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage }).single('media');

exports.createStory = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const user_id = req.body.user_id;
      const content_text = req.body.content_text || req.body.content || null;
      let media_url = req.body.media_url || null;
      let media_type = req.body.media_type || 'text';
      const background_color = req.body.background_color || null;

      // Safe normalization for empty string values
      if (media_url === '') media_url = null;

      if (req.file) {
        media_url = `${req.protocol}://${req.get('host')}/uploads/stories/${req.file.filename}`;
        media_type = req.file.mimetype.startsWith('image') ? 'image' : 'video';
      }

      if (!user_id) {
        return res.status(400).json({ error: 'User ID wajib dikirim' });
      }

      const newStory = await storyService.createStory(user_id, content_text, media_url, media_type, background_color);
      res.status(201).json({ message: 'Story berhasil dibuat', story: newStory });
    } catch (error) {
      console.error('Gagal buat story:', error);
      res.status(500).json({ error: 'Terjadi kesalahan di server' });
    }
  });
};

exports.getFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const feed = await storyService.fetchFeedForUser(userId);
    res.status(200).json(feed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil feed story' });
  }
};

exports.getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;
    const stories = await storyService.fetchUserStories(userId);
    res.status(200).json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil story user' });
  }
};

exports.getAllStories = async (req, res) => {
  try {
    const stories = await storyService.fetchAllStories();
    res.status(200).json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil semua story' });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    await storyService.removeStory(id);
    res.status(200).json({ message: 'Story berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus story' });
  }
};
