const postModel = require('../models/postModel');

const publishPost = async (postData) => {
  const { user_id, content_text, media_url, is_anonymous } = postData;

  // Validasi: Postingan minimal harus ada user_id dan (teks ATAU gambar)
  if (!user_id) throw new Error("user_id tidak boleh kosong");
  if (!content_text && !media_url) {
    throw new Error("Postingan tidak boleh kosong sama sekali");
  }

  return await postModel.createPost(user_id, content_text, media_url, is_anonymous);
};

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

  const deleted = await postModel.deletePost(postId, userId);
  if (!deleted) throw new Error("Postingan tidak ditemukan atau kamu tidak berhak menghapusnya");
  
  return deleted;
};

module.exports = { publishPost, fetchAllFeeds, fetchUserFeeds, editPost, removePost };