const reactionService = require('../services/reactionService');

exports.create = async (req, res) => {
  try {
    const reaction = await reactionService.toggleReaction(req.body);
    res.status(201).json({ message: "Berhasil bereaksi", reaction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getForPost = async (req, res) => {
  try {
    const reactions = await reactionService.fetchPostReactions(req.params.postId);
    res.status(200).json(reactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getForComment = async (req, res) => {
  try {
    const reactions = await reactionService.fetchCommentReactions(req.params.commentId);
    res.status(200).json(reactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    await reactionService.deleteReaction(id, user_id);
    res.status(200).json({ message: "Reaksi berhasil ditarik/dihapus" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};