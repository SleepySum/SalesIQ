const SalesReport = require('../models/SalesReport');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Submit or update a daily sales report (Upsert by date)
// @route   POST /api/reports/daily
// @access  Private
const upsertDailyReport = asyncHandler(async (req, res) => {
  const { date, totalSales, revenue, expenses, notes } = req.body;

  if (!date || totalSales === undefined || revenue === undefined || expenses === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide date, totalSales, revenue, and expenses.',
    });
  }

  if (revenue < 0 || expenses < 0 || totalSales < 0) {
    return res.status(400).json({ success: false, message: 'Values cannot be negative.' });
  }

  // Normalize date to midnight UTC to avoid timezone issues with uniqueness
  const reportDate = new Date(date);
  reportDate.setUTCHours(0, 0, 0, 0);

  const netProfitLoss = revenue - expenses;
  const profitMargin = revenue > 0 ? parseFloat(((netProfitLoss / revenue) * 100).toFixed(2)) : 0;

  const report = await SalesReport.findOneAndUpdate(
    { date: reportDate },
    {
      date: reportDate,
      totalSales,
      revenue,
      expenses,
      netProfitLoss,
      profitMargin,
      employee: req.user._id,
      notes: notes || '',
    },
    {
      new: true,          // Return the updated document
      upsert: true,       // Create if not found
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).populate('employee', 'name email');

  const wasCreated = !report.createdAt || report.createdAt.getTime() === report.updatedAt.getTime();

  res.status(wasCreated ? 201 : 200).json({
    success: true,
    message: wasCreated ? 'Daily report created successfully.' : 'Daily report updated successfully.',
    data: report,
  });
});

// @desc    Get yearly analytics — monthly aggregated data
// @route   GET /api/reports/yearly/:year
// @access  Private
const getYearlyAnalytics = asyncHandler(async (req, res) => {
  const year = parseInt(req.params.year, 10);

  if (isNaN(year) || year < 2000 || year > 2100) {
    return res.status(400).json({ success: false, message: 'Please provide a valid year.' });
  }

  const startDate = new Date(Date.UTC(year, 0, 1));
  const endDate = new Date(Date.UTC(year + 1, 0, 1));

  const monthlyData = await SalesReport.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' } },
        totalRevenue: { $sum: '$revenue' },
        totalExpenses: { $sum: '$expenses' },
        totalNetProfit: { $sum: '$netProfitLoss' },
        totalSales: { $sum: '$totalSales' },
        reportCount: { $sum: 1 },
        avgProfitMargin: { $avg: '$profitMargin' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  // Build a full 12-month array, filling zeros for months with no data
  const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const filledData = MONTH_NAMES.map((name, idx) => {
    const found = monthlyData.find((m) => m._id.month === idx + 1);
    return {
      month: name,
      monthNumber: idx + 1,
      totalRevenue: found ? found.totalRevenue : 0,
      totalExpenses: found ? found.totalExpenses : 0,
      totalNetProfit: found ? found.totalNetProfit : 0,
      totalSales: found ? found.totalSales : 0,
      reportCount: found ? found.reportCount : 0,
      avgProfitMargin: found ? parseFloat(found.avgProfitMargin.toFixed(2)) : 0,
    };
  });

  // Compute summary statistics
  const totals = filledData.reduce(
    (acc, m) => ({
      totalAnnualRevenue: acc.totalAnnualRevenue + m.totalRevenue,
      totalAnnualExpenses: acc.totalAnnualExpenses + m.totalExpenses,
      totalAnnualProfit: acc.totalAnnualProfit + m.totalNetProfit,
      totalAnnualSales: acc.totalAnnualSales + m.totalSales,
    }),
    { totalAnnualRevenue: 0, totalAnnualExpenses: 0, totalAnnualProfit: 0, totalAnnualSales: 0 }
  );

  const bestMonth = filledData.reduce(
    (best, m) => (m.totalNetProfit > (best?.totalNetProfit ?? -Infinity) ? m : best),
    null
  );

  res.status(200).json({
    success: true,
    data: {
      year,
      monthly: filledData,
      summary: {
        ...totals,
        overallProfitMargin:
          totals.totalAnnualRevenue > 0
            ? parseFloat(((totals.totalAnnualProfit / totals.totalAnnualRevenue) * 100).toFixed(2))
            : 0,
        bestPerformingMonth: bestMonth?.totalRevenue > 0 ? bestMonth.month : 'N/A',
      },
    },
  });
});

// @desc    Get last 7 days of reports
// @route   GET /api/reports/latest
// @access  Private
const getLatestReports = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const reports = await SalesReport.find({
    date: { $gte: sevenDaysAgo },
  })
    .sort({ date: -1 })
    .limit(7)
    .populate('employee', 'name');

  // Today's report for dashboard summary cards
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayReport = await SalesReport.findOne({
    date: { $gte: today, $lt: tomorrow },
  });

  res.status(200).json({
    success: true,
    data: {
      reports,
      today: todayReport || null,
    },
  });
});

// @desc    Get a single report by date
// @route   GET /api/reports/date/:date
// @access  Private
const getReportByDate = asyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  date.setUTCHours(0, 0, 0, 0);

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const report = await SalesReport.findOne({
    date: { $gte: date, $lt: nextDay },
  }).populate('employee', 'name email');

  if (!report) {
    return res.status(404).json({ success: false, message: 'No report found for this date.' });
  }

  res.status(200).json({ success: true, data: report });
});

module.exports = { upsertDailyReport, getYearlyAnalytics, getLatestReports, getReportByDate };
