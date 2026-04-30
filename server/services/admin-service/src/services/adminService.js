const adminModel = require('../models/adminModel');

const submitReport = async (data) => {
  const { reporter_id, reported_item_id, report_type, reason } = data;
  if (!reporter_id || !reported_item_id || !reason) {
    throw new Error("Data laporan tidak lengkap");
  }
  return await adminModel.createReport(reporter_id, reported_item_id, report_type, reason);
};

const fetchReports = async () => {
  return await adminModel.getAllReports();
};

const resolveReport = async (id, status) => {
  const validStatus = ['PENDING', 'RESOLVED', 'REJECTED'];
  if (!validStatus.includes(status)) {
    throw new Error("Status tidak valid. Gunakan PENDING, RESOLVED, atau REJECTED");
  }
  
  const updatedReport = await adminModel.updateReportStatus(id, status);
  if (!updatedReport) throw new Error("Laporan tidak ditemukan");
  
  return updatedReport;
};

module.exports = { submitReport, fetchReports, resolveReport };