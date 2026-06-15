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
    const user_id = req.body.user_id || req.query.user_id; // Support body or query param

    await commentService.removeComment(id, user_id);
    res.status(200).json({ message: "Komentar berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.hide = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.body.user_id || req.query.user_id;
    const is_hidden = req.body.is_hidden !== undefined ? req.body.is_hidden : true;

    if (!user_id) throw new Error("User ID wajib dikirim");

    const comment = await commentService.hideComment(id, user_id, is_hidden);
    res.status(200).json({ message: is_hidden ? "Komentar berhasil disembunyikan" : "Komentar berhasil ditampilkan kembali", data: comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const comments = await commentService.fetchAllComments();
    res.status(200).json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};