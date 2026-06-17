const userModel = require('../models/userModel');

const registerProfile = async (userData) => {
    const { id, username, full_name, birthday, bio } = userData; 
    if (!id || !username) throw new Error("ID dan Username wajib diisi");
    return await userModel.createUser(id, username, full_name, birthday, bio); 
};

const getProfile = async (id) => {
  const user = await userModel.getUserById(id);
  if (!user) throw new Error("User tidak ditemukan");
  return user;
};

const updateUserData = async (data) => {
    const { id, full_name, bio, avatar_url, cover_photo_url } = data;
    
    if (!id) throw new Error("ID user tidak ditemukan");

    const updatedUser = await userModel.updateUserProfileData(id, full_name, bio, avatar_url, cover_photo_url);
    if (!updatedUser) throw new Error("Gagal memperbarui profil di database");

    return updatedUser;
};

const follow = async (followerId, followingId) => {
  if (followerId === followingId) throw new Error("Tidak bisa memfollow diri sendiri");
  
  const targetUser = await userModel.getUserById(followingId);
  if (!targetUser) throw new Error("User yang ingin difollow tidak ditemukan");

  try {
     return await userModel.followUser(followerId, followingId);
  } catch (err) {
     if (err.code === '23505') throw new Error("Kamu sudah follow user ini");
     throw err;
  }
};

const unfollow = async (followerId, followingId) => {
    const deleted = await userModel.unfollowUser(followerId, followingId);
    if (!deleted) throw new Error("Tidak ada data follow untuk dihapus");
    return deleted;
}

const removeProfile = async (id) => {
  if (!id) throw new Error("ID user wajib dikirim");
  
  const deleted = await userModel.deleteUser(id);
  if (!deleted) throw new Error("Profil tidak ditemukan atau sudah dihapus");
  
  return deleted;
};

module.exports = { 
    registerProfile, 
    getProfile, 
    follow, 
    unfollow, 
    removeProfile,
    updateUserData
};