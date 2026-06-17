const commentModel = require('../models/commentModel');

const addComment = async (data) => {
  const { post_id, user_id, content, parent_id } = data;
  
  if (!post_id || !user_id || !content) {
    throw new Error("Post ID, User ID, dan isi komentar (content) wajib diisi");
  }
  
  const newComment = await commentModel.createComment(post_id, user_id, content, parent_id);

  // Fetch full comment with profile details
  let fullComment = newComment;
  try {
    const comments = await commentModel.getCommentsByPostId(post_id);
    fullComment = comments.find(c => c.id === newComment.id) || newComment;
  } catch (err) {
    console.warn("Gagal mengambil info detail komentar untuk broadcast:", err.message);
  }

  // Broadcast real-time comment event
  try {
    const notifUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:50056';
    await fetch(`${notifUrl}/notification/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'newComment',
        data: { post_id, comment: fullComment }
      })
    });
  } catch (broadcastErr) {
    console.warn("Gagal broadcast komentar baru:", broadcastErr.message);
  }

  // Send notifications for comments/replies
  try {
    const postAuthorId = await commentModel.getPostAuthor(post_id);
    let parentCommentUserId = null;

    if (parent_id) {
      const allComments = await commentModel.getAllComments();
      const parentComment = allComments.find(c => c.id === parent_id);
      if (parentComment) {
        parentCommentUserId = parentComment.user_id;
        // Notify parent comment author (if not self)
        if (parentCommentUserId !== user_id) {
          const notifUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:50056';
          await fetch(`${notifUrl}/notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: parentCommentUserId,
              type: 'COMMENT',
              reference_id: user_id,
              post_id: post_id
            })
          });
        }
      }
    }

    // Notify post author (if not the commenter and not already notified as parent commenter)
    if (postAuthorId && postAuthorId !== user_id && postAuthorId !== parentCommentUserId) {
      const notifUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:50056';
      await fetch(`${notifUrl}/notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: postAuthorId,
          type: 'COMMENT',
          reference_id: user_id,
          post_id: post_id
        })
      });
    }
  } catch (err) {
    console.warn("Gagal mengirim notifikasi komentar/balasan:", err.message);
  }

  return newComment;
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
    
    // Broadcast delete comment event
    try {
      const notifUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:50056';
      await fetch(`${notifUrl}/notification/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'deleteComment',
          data: { commentId, post_id: deleted.post_id }
        })
      });
    } catch (broadcastErr) {
      console.warn("Gagal broadcast hapus komentar:", broadcastErr.message);
    }
    
    return deleted;
};

const fetchAllComments = async () => {
    return await commentModel.getAllComments();
};

const toggleHide = async (commentId, userId) => {
    if (!commentId || !userId) throw new Error("Comment ID dan User ID wajib dikirim");
    
    const comment = await commentModel.toggleHideComment(commentId, userId);
    if (!comment) throw new Error("Komentar tidak ditemukan atau kamu tidak berhak menyembunyikannya (hanya pemilik postingan yang bisa)");
    
    // Broadcast update/hide comment event
    try {
      const notifUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:50056';
      await fetch(`${notifUrl}/notification/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'hideComment',
          data: { commentId, is_hidden: comment.is_hidden, post_id: comment.post_id }
        })
      });
    } catch (broadcastErr) {
      console.warn("Gagal broadcast status sembunyikan komentar:", broadcastErr.message);
    }
    
    return comment;
};

module.exports = { addComment, fetchPostComments, removeComment, fetchAllComments, toggleHide };