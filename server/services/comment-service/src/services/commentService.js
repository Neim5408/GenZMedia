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
    
<<<<<<< HEAD
    const isAdmin = userId === 'admin-1' || userId === 'admin-2';
    const deleted = isAdmin
        ? await commentModel.deleteCommentById(commentId)
        : await commentModel.deleteComment(commentId, userId);
        
=======
    const deleted = await commentModel.deleteComment(commentId, userId);
>>>>>>> origin/Kibob_update_home
    if (!deleted) throw new Error("Komentar tidak ditemukan atau kamu tidak berhak menghapusnya");
    
    return deleted;
};

<<<<<<< HEAD
const fetchAllComments = async () => {
    return await commentModel.getAllComments();
};

module.exports = { addComment, fetchPostComments, removeComment, fetchAllComments };
=======
module.exports = { addComment, fetchPostComments, removeComment };
>>>>>>> origin/Kibob_update_home
