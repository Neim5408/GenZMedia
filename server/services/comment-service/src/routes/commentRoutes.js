const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/', commentController.create);                 // Buat Komentar
<<<<<<< HEAD
router.get('/all', commentController.getAll);                 // Lihat Semua Komentar (Admin)
=======
>>>>>>> origin/Kibob_update_home
router.get('/post/:postId', commentController.getPostComments); // Lihat Komentar di sebuah Post
router.delete('/:id', commentController.destroy);           // Hapus Komentar

module.exports = router;