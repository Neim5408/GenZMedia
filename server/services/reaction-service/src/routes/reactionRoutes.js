const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactionController');

router.post('/', reactionController.create);                      // Kasih Like/Reaction
router.get('/post/:postId', reactionController.getForPost);       // Lihat semua like di Postingan
router.get('/comment/:commentId', reactionController.getForComment); // Lihat semua like di Komentar
router.delete('/:id', reactionController.destroy);                // Batal Like (Hapus reaksi)

module.exports = router;