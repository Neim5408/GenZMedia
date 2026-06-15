const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/', commentController.create);                 // Buat Komentar
router.get('/all', commentController.getAll);                 // Lihat Semua Komentar (Admin)
router.get('/post/:postId', commentController.getPostComments); // Lihat Komentar di sebuah Post
router.delete('/:id', commentController.destroy);           // Hapus Komentar
router.put('/:id/hide', commentController.hide);             // Sembunyikan Komentar

module.exports = router;