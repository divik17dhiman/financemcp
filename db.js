/**
 * Database module for Personal Finance Tracker
 * Handles SQLite database initialization, schema creation, and connection management
 */

import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const DB_PATH = join(__dirname, 'finance.db');

let db = null;

/**
 * Initialize the SQLite database and create tables if they don't exist
 * @returns {Promise<Object>} SQLite database instance
 */
export async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.error('Loaded existing database from:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.error('Created new database at:', DB_PATH);
  }
  
  // Create expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  // Create index on date for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)
  `);
  
  // Create index on category for faster aggregations
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)
  `);
  
  // Save database to file
  saveDatabase();
  
  console.error('Database initialized successfully');
  return db;
}

/**
 * Save database to file
 */
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Get the database instance
 * @returns {Object} Database instance
 */
export function getDatabase() {
  return db;
}

/**
 * Valid expense categories
 */
export const VALID_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'bills',
  'shopping',
  'health',
  'education',
  'travel',
  'savings',
  'other'
];

/**
 * Validate if a category is valid
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid
 */
export function isValidCategory(category) {
  return VALID_CATEGORIES.includes(category.toLowerCase());
}

/**
 * Validate if a date string is valid (YYYY-MM-DD format)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
export function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
}

/**
 * Validate if an amount is valid (positive number)
 * @param {number} amount - Amount to validate
 * @returns {boolean} True if valid
 */
export function isValidAmount(amount) {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
}
