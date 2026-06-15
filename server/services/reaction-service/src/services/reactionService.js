const reactionModel = require('../models/reactionModel');

const toggleReaction = async (data) => {
  const { user_id, post_id, comment_id, reaction_type } = data;

  if (!user_id || !reaction_type) {
    throw new Error("User ID dan Tipe Reaksi (cth: 'LIKE') wajib diisi");
  }

  // Validasi logika (sama dengan aturan CHECK di database)
  if (post_id && comment_id) {
    throw new Error("Reaksi hanya boleh untuk Post ATAU Comment, tidak boleh keduanya");
  }
  if (!post_id && !comment_id) {
    throw new Error("Pilih target reaksi: kirim post_id ATAU comment_id");
  }

  // Karena kalau post_id / comment_id tidak dikirim bentuknya 'undefined', kita ubah jadi 'null' untuk database
  const targetPost = post_id || null;
  const targetComment = comment_id || null;

  return await reactionModel.addReaction(user_id, targetPost, targetComment, reaction_type);
};

const fetchPostReactions = async (postId) => {
  return await reactionModel.getReactionsByPost(postId);
};

const fetchCommentReactions = async (commentId) => {
  return await reactionModel.getReactionsByComment(commentId);
};

const deleteReaction = async (reactionId, userId) => {
  const deleted = await reactionModel.removeReaction(reactionId, userId);
  if (!deleted) throw new Error("Reaksi tidak ditemukan atau kamu tidak berhak menghapusnya");
  return deleted;
};

module.exports = { toggleReaction, fetchPostReactions, fetchCommentReactions, deleteReaction };