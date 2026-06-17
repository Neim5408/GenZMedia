const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/', commentController.create);                 // Buat Komentar
router.get('/all', commentController.getAll);                 // Lihat Semua Komentar (Admin)
router.get('/post/:postId', commentController.getPostComments); // Lihat Komentar di sebuah Post
router.put('/:id/toggle-hide', commentController.toggleHide);     // Sembunyikan/Tampilkan Komentar (Pemilik Post)
router.delete('/:id', commentController.destroy);           // Hapus Komentar

module.exports = router;