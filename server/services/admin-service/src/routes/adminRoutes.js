const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/report', adminController.createReport);    // User lapor konten
router.get('/reports', adminController.getReports);      // Admin lihat semua laporan
router.put('/report/:id', adminController.updateStatus); // Admin ubah status laporan

module.exports = router;