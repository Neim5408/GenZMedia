const postModel = require('../models/postModel');

const fetchAllFeeds = async () => {
  return await postModel.getAllPosts();
};

const fetchUserFeeds = async (userId) => {
  return await postModel.getPostsByUser(userId);
};

const editPost = async (postId, userId, contentText, mediaUrl) => {
  if (!postId || !userId) throw new Error("Post ID dan User ID wajib dikirim");
  
  const updated = await postModel.updatePost(postId, userId, contentText, mediaUrl);
  if (!updated) throw new Error("Postingan tidak ditemukan atau kamu tidak berhak mengeditnya");
  
  return updated;
};

const removePost = async (postId, userId) => {
  if (!postId || !userId) throw new Error("Post ID dan User ID wajib dikirim");

  const isAdmin = userId === 'admin-1' || userId === 'admin-2';
  const deleted = isAdmin
    ? await postModel.deletePostById(postId)
    : await postModel.deletePost(postId, userId);

  if (!deleted) throw new Error("Postingan tidak ditemukan atau kamu tidak berhak menghapusnya");
  
  return deleted;
};

// Ekspor semua fungsi
module.exports = { fetchAllFeeds, fetchUserFeeds, editPost, removePost };