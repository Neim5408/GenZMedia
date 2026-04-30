const postService = require('../services/postService');

exports.create = async (req, res) => {
  try {
    const post = await postService.publishPost(req.body);
    res.status(201).json({ message: "Berhasil membuat postingan", post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFeeds = async (req, res) => {
  try {
    const posts = await postService.fetchAllFeeds();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil feed" });
  }
};

exports.getUserFeeds = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await postService.fetchUserFeeds(userId);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil postingan user" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params; // Ambil Post ID dari URL
    const { user_id, content_text, media_url } = req.body;
    
    const post = await postService.editPost(id, user_id, content_text, media_url);
    res.status(200).json({ message: "Postingan berhasil diupdate", post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { id } = req.params; // Ambil Post ID dari URL
    const { user_id } = req.body; // Ambil User ID untuk verifikasi kepemilikan

    await postService.removePost(id, user_id);
    res.status(200).json({ message: "Postingan berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};