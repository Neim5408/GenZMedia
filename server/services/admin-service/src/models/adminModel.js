const pool = require('../../db');

const createReport = async (reporterId, reportedItemId, reportType, reason) => {
  const result = await pool.query(
    `INSERT INTO admin_db.reports (reporter_id, reported_item_id, report_type, reason)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [reporterId, reportedItemId, reportType, reason]
  );
  return result.rows[0];
};

const getAllReports = async () => {
  const result = await pool.query(`SELECT * FROM admin_db.reports ORDER BY created_at DESC`);
  return result.rows;
};

const updateReportStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE admin_db.reports SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

module.exports = { createReport, getAllReports, updateReportStatus };