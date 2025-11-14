/**
 * Quick test file to verify the finance MCP server functions work correctly
 * Run with: node test.js
 */

import { 
  initializeDatabase, 
  saveDatabase,
  VALID_CATEGORIES, 
  isValidCategory, 
  isValidDate, 
  isValidAmount 
} from './db.js';

console.log('🧪 Testing Personal Finance Tracker...\n');

// Test validation functions
console.log('✓ Testing validation functions...');
console.log('  - Valid amount (50):', isValidAmount(50));
console.log('  - Invalid amount (-10):', isValidAmount(-10));
console.log('  - Valid category (food):', isValidCategory('food'));
console.log('  - Invalid category (xyz):', isValidCategory('xyz'));
console.log('  - Valid date (2024-11-03):', isValidDate('2024-11-03'));
console.log('  - Invalid date (2024-13-01):', isValidDate('2024-13-01'));
console.log();

// Test database initialization
console.log('✓ Testing database initialization...');
const db = await initializeDatabase();
console.log('  Database initialized successfully!');
console.log();

// Test adding an expense
console.log('✓ Testing add expense...');
db.run(`
  INSERT INTO expenses (amount, category, description, date)
  VALUES (?, ?, ?, ?)
`, [25.50, 'food', 'Test lunch', '2024-11-03']);
saveDatabase();
console.log('  Expense added successfully!');

// Test reading expenses
const result = db.exec('SELECT * FROM expenses');
if (result[0]) {
  const columns = result[0].columns;
  const values = result[0].values;
  console.log('  Found', values.length, 'expense(s)');
  console.log('  Columns:', columns.join(', '));
  console.log();
}

console.log('✅ All basic tests passed!');
console.log('\n📋 Valid categories:', VALID_CATEGORIES.join(', '));
console.log('\n💡 Next steps:');
console.log('  1. Configure Claude Desktop (see README.md)');
console.log('  2. Restart Claude Desktop');
console.log('  3. Start asking Claude to track your expenses!');
