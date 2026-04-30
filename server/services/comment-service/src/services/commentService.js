const commentModel = require('../models/commentModel');

const addComment = async (data) => {
  const { post_id, user_id, content, parent_id } = data;
  
  if (!post_id || !user_id || !content) {
    throw new Error("Post ID, User ID, dan isi komentar (content) wajib diisi");
  }
  
  // parent_id sifatnya opsional, kalau tidak dikirim berarti komentar biasa (bukan balasan)
  return await commentModel.createComment(post_id, user_id, content, parent_id);
};

const fetchPostComments = async (postId) => {
    if (!postId) throw new Error("Post ID wajib dikirim");
    return await commentModel.getCommentsByPostId(postId);
};

const removeComment = async (commentId, userId) => {
    if (!commentId || !userId) throw new Error("Comment ID dan User ID wajib dikirim");
    
    const deleted = await commentModel.deleteComment(commentId, userId);
    if (!deleted) throw new Error("Komentar tidak ditemukan atau kamu tidak berhak menghapusnya");
    
    return deleted;
};

module.exports = { addComment, fetchPostComments, removeComment };