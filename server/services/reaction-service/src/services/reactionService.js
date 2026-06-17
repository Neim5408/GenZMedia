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

  const existing = await reactionModel.getReactionByUserAndTarget(user_id, targetPost, targetComment);
  let finalResult;
  if (existing) {
    if (existing.reaction_type === reaction_type) {
      await reactionModel.removeReaction(existing.id, user_id);
      finalResult = { status: "removed", reaction: existing };
    } else {
      await reactionModel.removeReaction(existing.id, user_id);
      const newReaction = await reactionModel.addReaction(user_id, targetPost, targetComment, reaction_type);
      finalResult = { status: "updated", reaction: newReaction };
    }
  } else {
    const newReaction = await reactionModel.addReaction(user_id, targetPost, targetComment, reaction_type);
    finalResult = { status: "added", reaction: newReaction };
  }

  // Broadcast real-time like update for posts
  if (targetPost) {
    try {
      const reactions = await reactionModel.getReactionsByPost(targetPost);
      const likesList = reactions
        .filter(r => r.reaction_type === 'LIKE')
        .map(r => r.user_id);

      const notifUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:50056';
      await fetch(`${notifUrl}/notification/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'newLike',
          data: { post_id: targetPost, likes: likesList }
        })
      });
    } catch (broadcastErr) {
      console.warn("Gagal broadcast reaksi baru:", broadcastErr.message);
    }

    // Send notification to post author when someone likes the post
    if (reaction_type === 'LIKE' && (finalResult.status === 'added' || finalResult.status === 'updated')) {
      try {
        const postAuthorId = await reactionModel.getPostAuthor(targetPost);
        // Only notify if post author exists and is not the person who liked (no self-notifications)
        if (postAuthorId && postAuthorId !== user_id) {
          const notifUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:50056';
          await fetch(`${notifUrl}/notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: postAuthorId,
              type: 'LIKE',
              reference_id: user_id,
              post_id: targetPost
            })
          });
        }
      } catch (notifErr) {
        console.warn("Gagal mengirim notifikasi like postingan:", notifErr.message);
      }
    }
  }

  return finalResult;
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