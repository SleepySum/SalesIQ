// Currency formatter
export const formatCurrency = (value, compact = false) => {
  if (value === null || value === undefined) return '$0';
  const num = Number(value);

  if (compact && Math.abs(num) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Percentage formatter
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

// Number formatter (for sales count)
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(Number(value));
};

// Date formatter
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric', ...options };
  return date.toLocaleDateString('en-US', defaultOptions);
};

// Get today's date as YYYY-MM-DD (local time)
export const getTodayString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

// Color helpers
export const getProfitColor = (value) => (value >= 0 ? '#34d399' : '#f87171');
export const getProfitBgColor = (value) => (value >= 0 ? 'bg-emerald-950/60' : 'bg-red-950/60');
export const getProfitBorderColor = (value) => (value >= 0 ? 'border-emerald-800/50' : 'border-red-800/50');
export const getProfitTextColor = (value) => (value >= 0 ? 'text-emerald-400' : 'text-red-400');