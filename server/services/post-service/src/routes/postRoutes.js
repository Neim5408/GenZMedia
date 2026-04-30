const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.create);
router.get('/feeds', postController.getFeeds);
router.get('/user/:userId', postController.getUserFeeds);
router.put('/:id', postController.update);
router.delete('/:id', postController.destroy);

module.exports = router;