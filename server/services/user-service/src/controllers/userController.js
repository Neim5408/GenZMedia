const userService = require('../services/userService');
const userModel = require('../models/userModel');
const multer = require('multer');
const path = require('path');

// ==========================================
// KONFIGURASI MULTER (UPLOAD FILE)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Foto akan disimpan ke folder ini
    cb(null, 'public/uploads'); 
  },
  filename: (req, file, cb) => {
    // Agar nama file tidak bertabrakan, kita tambahkan waktu (Date.now())
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // Batas maksimal ukuran foto 2MB
}).fields([
  { name: 'avatar', maxCount: 1 }, // Menerima 1 file untuk 'avatar'
  { name: 'cover', maxCount: 1 }   // Menerima 1 file untuk 'cover'
]);


// ==========================================
// CONTROLLERS
// ==========================================

// --- 1. Edit Profil (Teks & Gambar) ---
exports.updateProfile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { id } = req.params;
    const { full_name, bio } = req.body;

    try {
      // Ambil data profil lama
      const currentUser = await userService.getProfile(id);
      let avatarUrl = currentUser.avatar_url;
      let coverUrl = currentUser.cover_photo_url;

      // Jika user mengunggah foto profil baru, ubah URL-nya
      if (req.files && req.files.avatar) {
        avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.avatar[0].filename}`;
      }
      
      // Jika user mengunggah foto cover baru, ubah URL-nya
      if (req.files && req.files.cover) {
        coverUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.cover[0].filename}`;
      }

      // Update data di Database
      const updatedUser = await userService.updateUserData({
        id,
        full_name,
        bio,
        avatar_url: avatarUrl,
        cover_photo_url: coverUrl
      });

      res.status(200).json({ message: "Profil berhasil diperbarui", updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// --- 2. Buat Profil Baru (Dari Auth Service) ---
exports.createUser = async (req, res) => {
  try {
    const user = await userService.registerProfile(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- 3. Ambil Data Profil ---
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getProfile(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// --- 4. Follow User ---
exports.followUser = async (req, res) => {
   try {
      const { follower_id, following_id } = req.body;
      await userService.follow(follower_id, following_id);
      res.status(200).json({ message: "Berhasil follow pengguna" });
   } catch(err) {
      res.status(400).json({ error: err.message });
   }
};

// --- 5. Unfollow User ---
exports.unfollowUser = async (req, res) => {
    try {
      const { follower_id, following_id } = req.body;
      await userService.unfollow(follower_id, following_id);
      res.status(200).json({ message: "Berhasil unfollow pengguna" });
   } catch(err) {
      res.status(400).json({ error: err.message });
   }
};

// --- 6. Ambil Data Followers & Following (Network) ---
exports.getFollowData = async (req, res) => {
  try {
    const { id } = req.params;
    const followers = await userModel.getFollowers(id);
    const following = await userModel.getFollowing(id);
    res.status(200).json({ followers, following });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 7. Hapus Akun ---
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.removeProfile(id); 
    res.status(200).json({ message: "Profil berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};