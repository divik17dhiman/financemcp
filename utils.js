/**
 * Utility functions for the Finance MCP server
 */

/**
 * Convert expenses array to CSV format
 * @param {Array} expenses - Array of expense objects
 * @returns {string} CSV formatted string
 */
export function convertToCSV(expenses) {
  if (!expenses || expenses.length === 0) {
    return 'id,amount,category,description,date,created_at\n';
  }
  
  // CSV header
  const header = 'id,amount,category,description,date,created_at\n';
  
  // CSV rows
  const rows = expenses.map(expense => {
    return [
      expense.id,
      expense.amount,
      expense.category,
      `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes in description
      expense.date,
      expense.created_at
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

/**
 * Format amount as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}

/**
 * Parse date range from string (e.g., "2024-01" for a month)
 * @param {string} dateStr - Date string
 * @returns {Object} Object with startDate and endDate
 */
export function parseDateRange(dateStr) {
  if (!dateStr) return null;
  
  // Check if it's a year-month format (YYYY-MM)
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split('-').map(Number);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }
  
  return null;
}
