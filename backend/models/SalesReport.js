const mongoose = require('mongoose');

const salesReportSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      unique: true,
    },
    totalSales: {
      type: Number,
      required: [true, 'Total sales count is required'],
      min: [0, 'Sales count cannot be negative'],
    },
    revenue: {
      type: Number,
      required: [true, 'Revenue is required'],
      min: [0, 'Revenue cannot be negative'],
    },
    expenses: {
      type: Number,
      required: [true, 'Expenses are required'],
      min: [0, 'Expenses cannot be negative'],
    },
    netProfitLoss: {
      type: Number,
      required: [true, 'Net profit/loss is required'],
    },
    profitMargin: {
      type: Number,
      default: 0,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save: auto-calculate derived fields
salesReportSchema.pre('save', function (next) {
  this.netProfitLoss = this.revenue - this.expenses;
  this.profitMargin =
    this.revenue > 0 ? parseFloat(((this.netProfitLoss / this.revenue) * 100).toFixed(2)) : 0;
  next();
});

// Indexes for faster queries
salesReportSchema.index({ date: 1 });
salesReportSchema.index({ employee: 1, date: -1 });
salesReportSchema.index({ date: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('SalesReport', salesReportSchema);
