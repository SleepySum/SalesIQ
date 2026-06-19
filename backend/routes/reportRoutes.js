const express = require('express');
const router = express.Router();
const { 
  upsertDailyReport, 
  getLatestReports, 
  getReportByDate, 
  getYearlyAnalytics 
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All sales metrics and analysis routes require valid user authorization sessions
router.use(protect);

// ── Daily Metric Entries ──────────────────────────────────────────────────────

// POST /api/reports/daily
// @desc    Submit or update a daily sales report (Upsert operation)
// @access  Private
router.post('/daily', upsertDailyReport);

// GET /api/reports/date/:date
// @desc    Retrieve a single detailed report document by a specific date profile
// @access  Private
router.get('/date/:date', getReportByDate);


// ── Real-time Dashboard & Macro Aggregations ───────────────────────────

// GET /api/reports/latest
// @desc    Get recent transaction listings alongside today's running summary snapshot
// @access  Private
router.get('/latest', getLatestReports);

// GET /api/reports/yearly/:year
// @desc    Process complex pipeline aggregations to compile high-contrast trend metrics
// @access  Private
router.get('/yearly/:year', getYearlyAnalytics);

module.exports = router;
