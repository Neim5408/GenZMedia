const commentService = require('../services/commentService');

exports.create = async (req, res) => {
  try {
    const comment = await commentService.addComment(req.body);
    res.status(201).json({ message: "Komentar berhasil ditambahkan", comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await commentService.fetchPostComments(postId);
    res.status(200).json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body; // Ambil ID user untuk validasi kepemilikan

    await commentService.removeComment(id, user_id);
    res.status(200).json({ message: "Komentar berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};