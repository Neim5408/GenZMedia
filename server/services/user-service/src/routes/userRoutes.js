const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

<<<<<<< HEAD
// Rute Postingan Dasar
router.post('/', userController.createUser);

// SANGAT PENTING: Rute spesifik seperti /search/all harus berada 
// DI ATAS rute dinamis seperti /:id agar terbaca dengan benar
router.get('/search/all', userController.searchUsers);
router.get('/followers', userController.getFollowersList);
router.get('/following', userController.getFollowingList);

// Rute Pengambilan & Update Profil
router.get('/:id', userController.getUser);
router.put('/update/:id', userController.updateProfile);

// Rute Jaringan Pertemanan
router.post('/follow', userController.followUser);
router.delete('/unfollow', userController.unfollowUser);
router.post('/unfollow', userController.unfollowUser); // Support POST method as well
router.get('/:id/network', userController.getFollowData);

// Rute Hapus Akun
router.delete('/:id', userController.deleteUser);

=======
router.post('/', userController.createUser);
router.get('/:id', userController.getUser);

// Tambahkan rute ini untuk Edit Profil:
router.put('/update/:id', userController.updateProfile);

router.post('/follow', userController.followUser);
router.delete('/unfollow', userController.unfollowUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id/network', userController.getFollowData);

>>>>>>> origin/Kibob_update_home
module.exports = router;