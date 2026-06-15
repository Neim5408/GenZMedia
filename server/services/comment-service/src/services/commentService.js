const commentModel = require('../models/commentModel');
const axios = require('axios');

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
    
    const isAdmin = userId === 'admin-1' || userId === 'admin-2';
    const deleted = isAdmin
        ? await commentModel.deleteCommentById(commentId)
        : await commentModel.deleteComment(commentId, userId);
        
    if (!deleted) throw new Error("Komentar tidak ditemukan atau kamu tidak berhak menghapusnya");
    
    return deleted;
};

const hideComment = async (commentId, userId, isHidden = true) => {
    if (!commentId || !userId) throw new Error("Comment ID dan User ID wajib dikirim");
    
    const comment = await commentModel.getCommentById(commentId);
    if (!comment) throw new Error("Komentar tidak ditemukan");
    
    const isAdmin = userId === 'admin-1' || userId === 'admin-2';
    const isCommentOwner = comment.user_id === userId;
    
    if (isAdmin || isCommentOwner) {
        return await commentModel.updateCommentHideStatus(commentId, isHidden);
    }
    
    try {
        const postRes = await axios.get(`http://localhost:50053/post/${comment.post_id}`);
        const post = postRes.data;
        const postOwnerId = post?.user_id || post?.userId;
        
        if (postOwnerId === userId) {
            return await commentModel.updateCommentHideStatus(commentId, isHidden);
        }
    } catch (err) {
        console.error("Gagal verifikasi pemilik postingan via Post Service:", err.message);
    }
    
    throw new Error("Anda tidak memiliki akses untuk menyembunyikan komentar ini");
};

const fetchAllComments = async () => {
    return await commentModel.getAllComments();
};

module.exports = { addComment, fetchPostComments, removeComment, hideComment, fetchAllComments };
