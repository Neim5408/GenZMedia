const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

<<<<<<< HEAD
router.post('/', postController.createPost);
router.get('/feeds', postController.getFeeds);
router.get('/user/:userId', postController.getUserFeeds);
router.get('/:id', postController.getPost);
=======
router.post('/', postController.create);
router.get('/feeds', postController.getFeeds);
router.get('/user/:userId', postController.getUserFeeds);
>>>>>>> origin/Kibob_update_home
router.put('/:id', postController.update);
router.delete('/:id', postController.destroy);

module.exports = router;