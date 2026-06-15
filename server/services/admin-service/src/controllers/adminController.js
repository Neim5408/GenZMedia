const adminService = require('../services/adminService');

exports.createReport = async (req, res) => {
  try {
    const report = await adminService.submitReport(req.body);
    res.status(201).json({ message: "Laporan berhasil dikirim", report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await adminService.fetchReports();
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const report = await adminService.resolveReport(id, status);
    res.status(200).json({ message: "Status laporan diperbarui", report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};