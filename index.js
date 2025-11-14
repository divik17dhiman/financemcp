#!/usr/bin/env node

/**
 * Personal Finance Tracker MCP Server
 * 
 * This MCP server provides tools for tracking personal expenses using SQLite.
 * It demonstrates CRUD operations, database queries, aggregations, and data export.
 * 
 * Features:
 * - Add, update, and delete expenses
 * - Query expenses with filters (date range, category)
 * - Get spending breakdowns by category
 * - Generate monthly summaries
 * - Export data to CSV format
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { 
  initializeDatabase, 
  getDatabase,
  saveDatabase,
  VALID_CATEGORIES, 
  isValidCategory, 
  isValidDate, 
  isValidAmount 
} from './db.js';

import { 
  convertToCSV, 
  formatCurrency, 
  getMonthName, 
  parseDateRange 
} from './utils.js';

// Initialize database
let db = null;
await initializeDatabase().then(database => {
  db = database;
});

// Create MCP server instance
const server = new Server(
  {
    name: 'finance-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Helper function to convert sql.js result to object array
 */
function rowToObject(result) {
  if (!result || !result.columns || !result.values || result.values.length === 0) {
    return null;
  }
  
  const columns = result.columns;
  const rows = result.values;
  
  if (rows.length === 1) {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = rows[0][i];
    });
    return obj;
  }
  
  return rows.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

/**
 * Tool 1: Add a new expense
 * Creates a new expense entry in the database with validation
 */
function addExpense(amount, category, description, date) {
  // Input validation
  if (!isValidAmount(amount)) {
    throw new Error('Amount must be a positive number');
  }
  
  if (!isValidCategory(category)) {
    throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  if (!isValidDate(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  
  if (!description || description.trim().length === 0) {
    throw new Error('Description cannot be empty');
  }
  
  // Insert expense using parameterized query to prevent SQL injection
  db.run(`
    INSERT INTO expenses (amount, category, description, date)
    VALUES (?, ?, ?, ?)
  `, [amount, category.toLowerCase(), description.trim(), date]);
  
  // Save database to file
  saveDatabase();
  
  // Retrieve the newly created expense
  const result = db.exec('SELECT * FROM expenses ORDER BY id DESC LIMIT 1');
  const newExpense = result[0] ? rowToObject(result[0]) : null;
  
  return {
    success: true,
    message: 'Expense added successfully',
    expense: newExpense
  };
}

/**
 * Tool 2: Get expenses with optional filtering
 * Supports filtering by date range and category
 */
function getExpenses(startDate = null, endDate = null, category = null, limit = 100) {
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  
  // Add date range filter
  if (startDate) {
    if (!isValidDate(startDate)) {
      throw new Error('Invalid start date format. Use YYYY-MM-DD');
    }
    query += ' AND date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    if (!isValidDate(endDate)) {
      throw new Error('Invalid end date format. Use YYYY-MM-DD');
    }
    query += ' AND date <= ?';
    params.push(endDate);
  }
  
  // Add category filter
  if (category) {
    if (!isValidCategory(category)) {
      throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    query += ' AND category = ?';
    params.push(category.toLowerCase());
  }
  
  // Order by date descending (most recent first)
  query += ' ORDER BY date DESC, id DESC LIMIT ?';
  params.push(limit);
  
  const result = db.exec(query, params);
  const expenses = result[0] ? rowToObject(result[0]) : [];
  
  return {
    success: true,
    count: Array.isArray(expenses) ? expenses.length : (expenses ? 1 : 0),
    expenses: Array.isArray(expenses) ? expenses : (expenses ? [expenses] : [])
  };
}

/**
 * Tool 3: Get spending breakdown by category
 * Aggregates total spending for each category
 */
function getSpendingByCategory(startDate = null, endDate = null) {
  let query = `
    SELECT 
      category,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      AVG(amount) as average_amount,
      MIN(amount) as min_amount,
      MAX(amount) as max_amount
    FROM expenses
    WHERE 1=1
  `;
  const params = [];
  
  // Add date range filter
  if (startDate) {
    if (!isValidDate(startDate)) {
      throw new Error('Invalid start date format. Use YYYY-MM-DD');
    }
    query += ' AND date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    if (!isValidDate(endDate)) {
      throw new Error('Invalid end date format. Use YYYY-MM-DD');
    }
    query += ' AND date <= ?';
    params.push(endDate);
  }
  
  query += ' GROUP BY category ORDER BY total_amount DESC';
  
  const result = db.exec(query, params);
  const breakdown = result[0] ? rowToObject(result[0]) : [];
  const breakdownArray = Array.isArray(breakdown) ? breakdown : (breakdown ? [breakdown] : []);
  
  // Calculate total spending
  const totalSpending = breakdownArray.reduce((sum, cat) => sum + (cat.total_amount || 0), 0);
  
  // Add percentage to each category
  const breakdownWithPercentage = breakdownArray.map(cat => ({
    ...cat,
    percentage: totalSpending > 0 ? ((cat.total_amount / totalSpending) * 100).toFixed(2) : 0
  }));
  
  return {
    success: true,
    total_spending: totalSpending,
    categories: breakdownWithPercentage
  };
}

/**
 * Tool 4: Get monthly spending summary
 * Shows total spending and breakdown for a specific month
 */
function getMonthlySummary(year, month) {
  // Validate year and month
  if (!year || year < 2000 || year > 2100) {
    throw new Error('Invalid year. Must be between 2000 and 2100');
  }
  
  if (!month || month < 1 || month > 12) {
    throw new Error('Invalid month. Must be between 1 and 12');
  }
  
  // Calculate date range for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  // Get total expenses for the month
  const totalResult = db.exec(`
    SELECT 
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      AVG(amount) as average_amount
    FROM expenses
    WHERE date >= ? AND date <= ?
  `, [startDate, endDate]);
  
  const totals = totalResult[0] ? rowToObject(totalResult[0]) : { 
    transaction_count: 0, 
    total_amount: 0, 
    average_amount: 0 
  };
  
  // Get breakdown by category
  const categoryResult = db.exec(`
    SELECT 
      category,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount
    FROM expenses
    WHERE date >= ? AND date <= ?
    GROUP BY category
    ORDER BY total_amount DESC
  `, [startDate, endDate]);
  
  const categoryBreakdown = categoryResult[0] ? rowToObject(categoryResult[0]) : [];
  const categoryArray = Array.isArray(categoryBreakdown) ? categoryBreakdown : (categoryBreakdown ? [categoryBreakdown] : []);
  
  // Get daily spending trend
  const dailyResult = db.exec(`
    SELECT 
      date,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount
    FROM expenses
    WHERE date >= ? AND date <= ?
    GROUP BY date
    ORDER BY date ASC
  `, [startDate, endDate]);
  
  const dailySpending = dailyResult[0] ? rowToObject(dailyResult[0]) : [];
  const dailyArray = Array.isArray(dailySpending) ? dailySpending : (dailySpending ? [dailySpending] : []);
  
  return {
    success: true,
    month: getMonthName(month),
    year: year,
    period: `${startDate} to ${endDate}`,
    summary: {
      total_transactions: totals.transaction_count || 0,
      total_spending: totals.total_amount || 0,
      average_transaction: totals.average_amount || 0
    },
    category_breakdown: categoryArray,
    daily_spending: dailyArray
  };
}

/**
 * Tool 5: Update an existing expense
 * Allows modification of any expense field
 */
function updateExpense(id, amount = null, category = null, description = null, date = null) {
  // Check if expense exists
  const existingResult = db.exec('SELECT * FROM expenses WHERE id = ?', [id]);
  const existing = existingResult[0] ? rowToObject(existingResult[0]) : null;
  
  if (!existing) {
    throw new Error(`Expense with ID ${id} not found`);
  }
  
  // Build update query dynamically based on provided fields
  const updates = [];
  const params = [];
  
  if (amount !== null) {
    if (!isValidAmount(amount)) {
      throw new Error('Amount must be a positive number');
    }
    updates.push('amount = ?');
    params.push(amount);
  }
  
  if (category !== null) {
    if (!isValidCategory(category)) {
      throw new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    updates.push('category = ?');
    params.push(category.toLowerCase());
  }
  
  if (description !== null) {
    if (description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }
    updates.push('description = ?');
    params.push(description.trim());
  }
  
  if (date !== null) {
    if (!isValidDate(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    updates.push('date = ?');
    params.push(date);
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update. Provide at least one field: amount, category, description, or date');
  }
  
  // Execute update
  params.push(id);
  db.run(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`, params);
  
  // Save database to file
  saveDatabase();
  
  // Get updated expense
  const updatedResult = db.exec('SELECT * FROM expenses WHERE id = ?', [id]);
  const updated = updatedResult[0] ? rowToObject(updatedResult[0]) : null;
  
  return {
    success: true,
    message: 'Expense updated successfully',
    expense: updated
  };
}

/**
 * Tool 6: Delete an expense
 * Removes an expense from the database
 */
function deleteExpense(id) {
  // Check if expense exists
  const existingResult = db.exec('SELECT * FROM expenses WHERE id = ?', [id]);
  const existing = existingResult[0] ? rowToObject(existingResult[0]) : null;
  
  if (!existing) {
    throw new Error(`Expense with ID ${id} not found`);
  }
  
  // Delete the expense
  db.run('DELETE FROM expenses WHERE id = ?', [id]);
  
  // Save database to file
  saveDatabase();
  
  return {
    success: true,
    message: 'Expense deleted successfully',
    deleted_expense: existing
  };
}

/**
 * Tool 7: Export expenses to CSV
 * Generates a CSV file with all or filtered expenses
 */
function exportToCSV(startDate = null, endDate = null, category = null) {
  // Get expenses with filters
  const result = getExpenses(startDate, endDate, category, 10000);
  
  // Convert to CSV
  const csv = convertToCSV(result.expenses);
  
  return {
    success: true,
    count: result.count,
    csv: csv,
    message: `Exported ${result.count} expenses to CSV format`
  };
}

/**
 * Register MCP tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_expense',
        description: 'Add a new expense entry to the database. Requires amount (positive number), category, description, and date (YYYY-MM-DD format).',
        inputSchema: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Expense amount (must be positive)',
              minimum: 0.01
            },
            category: {
              type: 'string',
              description: `Expense category. Valid options: ${VALID_CATEGORIES.join(', ')}`,
              enum: VALID_CATEGORIES
            },
            description: {
              type: 'string',
              description: 'Brief description of the expense'
            },
            date: {
              type: 'string',
              description: 'Date of the expense in YYYY-MM-DD format',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            }
          },
          required: ['amount', 'category', 'description', 'date']
        }
      },
      {
        name: 'get_expenses',
        description: 'Retrieve expenses with optional filtering by date range and/or category. Returns up to the specified limit (default 100).',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start date for filtering (YYYY-MM-DD format, inclusive)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            endDate: {
              type: 'string',
              description: 'End date for filtering (YYYY-MM-DD format, inclusive)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            category: {
              type: 'string',
              description: 'Filter by specific category',
              enum: VALID_CATEGORIES
            },
            limit: {
              type: 'number',
              description: 'Maximum number of expenses to return (default 100)',
              default: 100,
              minimum: 1,
              maximum: 1000
            }
          }
        }
      },
      {
        name: 'get_spending_by_category',
        description: 'Get aggregated spending breakdown by category. Shows total amount, transaction count, average, min, max, and percentage for each category. Optionally filter by date range.',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start date for filtering (YYYY-MM-DD format, inclusive)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            endDate: {
              type: 'string',
              description: 'End date for filtering (YYYY-MM-DD format, inclusive)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            }
          }
        }
      },
      {
        name: 'get_monthly_summary',
        description: 'Generate a comprehensive monthly spending summary including total spending, category breakdown, and daily spending trends for a specific month.',
        inputSchema: {
          type: 'object',
          properties: {
            year: {
              type: 'number',
              description: 'Year (e.g., 2024)',
              minimum: 2000,
              maximum: 2100
            },
            month: {
              type: 'number',
              description: 'Month number (1-12)',
              minimum: 1,
              maximum: 12
            }
          },
          required: ['year', 'month']
        }
      },
      {
        name: 'update_expense',
        description: 'Update an existing expense. Provide the expense ID and any fields you want to update (amount, category, description, date). Only provided fields will be updated.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID of the expense to update'
            },
            amount: {
              type: 'number',
              description: 'New amount (optional)',
              minimum: 0.01
            },
            category: {
              type: 'string',
              description: 'New category (optional)',
              enum: VALID_CATEGORIES
            },
            description: {
              type: 'string',
              description: 'New description (optional)'
            },
            date: {
              type: 'string',
              description: 'New date in YYYY-MM-DD format (optional)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'delete_expense',
        description: 'Delete an expense from the database by its ID. This action cannot be undone.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID of the expense to delete'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'export_to_csv',
        description: 'Export expenses to CSV format. Optionally filter by date range and/or category. Returns CSV data as a string.',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start date for filtering (YYYY-MM-DD format, inclusive)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            endDate: {
              type: 'string',
              description: 'End date for filtering (YYYY-MM-DD format, inclusive)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            category: {
              type: 'string',
              description: 'Filter by specific category',
              enum: VALID_CATEGORIES
            }
          }
        }
      }
    ]
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    
    switch (name) {
      case 'add_expense':
        result = addExpense(args.amount, args.category, args.description, args.date);
        break;
        
      case 'get_expenses':
        result = getExpenses(args.startDate, args.endDate, args.category, args.limit);
        break;
        
      case 'get_spending_by_category':
        result = getSpendingByCategory(args.startDate, args.endDate);
        break;
        
      case 'get_monthly_summary':
        result = getMonthlySummary(args.year, args.month);
        break;
        
      case 'update_expense':
        result = updateExpense(args.id, args.amount, args.category, args.description, args.date);
        break;
        
      case 'delete_expense':
        result = deleteExpense(args.id);
        break;
        
      case 'export_to_csv':
        result = exportToCSV(args.startDate, args.endDate, args.category);
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
    
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Personal Finance Tracker MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
