const postService = require('../services/postService');
const postModel = require('../models/postModel');
const multer = require('multer');
const path = require('path');

// --- Konfigurasi Multer untuk Upload Foto Postingan ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); 
    },
    filename: (req, file, cb) => {
        cb(null, 'post-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas 5MB
}).single('media'); // Menerima 1 file dengan nama field 'media'


// --- Fungsi 1: Membuat Postingan Baru (dengan foto) ---
exports.createPost = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        const { user_id, content } = req.body;
        let mediaUrl = null;

        if (!user_id) return res.status(400).json({ error: "User ID diperlukan" });

        try {
            // Jika ada file gambar yang diunggah, buat URL yang bisa diakses publik
            if (req.file) {
                mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            }

            // Simpan data post ke database melalui Model
            const newPost = await postModel.createPost(user_id, content, mediaUrl);
            
            res.status(201).json({ message: "Postingan berhasil dibuat", post: newPost });
        } catch (error) {
            console.error("Gagal buat post:", error);
            res.status(500).json({ error: "Terjadi kesalahan di server" });
        }
    });
};

// --- Fungsi 2: Mengambil Semua Feed Beranda ---
exports.getFeeds = async (req, res) => {
  try {
    const posts = await postService.fetchAllFeeds();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil feed" });
  }
};

// --- Fungsi 3: Mengambil Postingan Spesifik dari Profil User ---
exports.getUserFeeds = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await postService.fetchUserFeeds(userId);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil postingan user" });
  }
};

// --- Fungsi 4: Mengupdate Postingan ---
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, content, media_url } = req.body; // disesuaikan dengan DB
    
    const post = await postService.editPost(id, user_id, content, media_url);
    res.status(200).json({ message: "Postingan berhasil diupdate", post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Fungsi 5: Menghapus Postingan ---
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params; 
    const { user_id } = req.body; 

    await postService.removePost(id, user_id);
    res.status(200).json({ message: "Postingan berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};