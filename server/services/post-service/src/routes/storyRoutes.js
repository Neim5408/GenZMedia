const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.post('/', storyController.createStory);
router.get('/all', storyController.getAllStories);
router.get('/feed/:userId', storyController.getFeed);
router.get('/user/:userId', storyController.getUserStories);
router.delete('/:id', storyController.deleteStory);

module.exports = router;
