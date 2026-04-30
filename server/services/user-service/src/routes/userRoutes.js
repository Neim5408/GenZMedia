const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/:id', userController.getUser);

// Tambahkan rute ini untuk Edit Profil:
router.put('/update/:id', userController.updateProfile);

router.post('/follow', userController.followUser);
router.delete('/unfollow', userController.unfollowUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/network', userController.getFollowData);

module.exports = router;