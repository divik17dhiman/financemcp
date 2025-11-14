# Learning Guide: Database & CRUD Operations

This guide explains the key database concepts and patterns used in the Personal Finance Tracker MCP server.

## 🗄️ Database Fundamentals

### SQLite Basics

**What is SQLite?**
- Serverless, file-based SQL database
- Perfect for local applications
- ACID compliant (Atomicity, Consistency, Isolation, Durability)
- No configuration required

**Why SQLite for this project?**
- ✅ Simple single-file database (`finance.db`)
- ✅ No server setup needed
- ✅ Portable - just copy the file
- ✅ Fast for small to medium datasets
- ✅ Full SQL support

### Database Schema Design

**Our Expenses Table:**
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-incrementing unique identifier
  amount REAL NOT NULL CHECK(amount > 0), -- Positive decimal number
  category TEXT NOT NULL,                 -- Expense category
  description TEXT NOT NULL,              -- What was purchased
  date TEXT NOT NULL,                     -- When (YYYY-MM-DD format)
  created_at TEXT NOT NULL DEFAULT (datetime('now')) -- Timestamp
)
```

**Design Decisions:**

1. **Primary Key (id)**
   - Automatically increments (1, 2, 3, ...)
   - Unique identifier for each expense
   - Used for updates and deletes

2. **Constraints**
   - `NOT NULL`: Field cannot be empty
   - `CHECK(amount > 0)`: Ensures positive amounts
   - `DEFAULT`: Auto-set timestamp when created

3. **Data Types**
   - `INTEGER`: Whole numbers (id)
   - `REAL`: Decimal numbers (amount)
   - `TEXT`: Strings (category, description, date)

4. **Indexes for Performance**
   ```sql
   CREATE INDEX idx_expenses_date ON expenses(date);
   CREATE INDEX idx_expenses_category ON expenses(category);
   ```
   - Makes queries on date/category much faster
   - Essential for filtering and aggregation

## 🔧 CRUD Operations

CRUD = Create, Read, Update, Delete - the four basic database operations.

### CREATE: Adding Data

**Code Example:**
```javascript
function addExpense(amount, category, description, date) {
  // Parameterized query - prevents SQL injection!
  db.run(`
    INSERT INTO expenses (amount, category, description, date)
    VALUES (?, ?, ?, ?)
  `, [amount, category, description, date]);
  
  // Save to disk
  saveDatabase();
  
  // Retrieve what was just inserted
  const result = db.exec('SELECT * FROM expenses ORDER BY id DESC LIMIT 1');
  return rowToObject(result[0]);
}
```

**Key Concepts:**
- **Parameterized Queries**: `?` placeholders prevent SQL injection
  - ❌ NEVER: `INSERT INTO expenses VALUES ('${userInput}')`  - Dangerous!
  - ✅ ALWAYS: `INSERT INTO expenses VALUES (?)` with `[userInput]` - Safe!
- **Transaction**: Changes are persisted when saved to disk

### READ: Querying Data

**Simple Query:**
```javascript
// Get all expenses
const result = db.exec('SELECT * FROM expenses');
```

**Filtered Query:**
```javascript
function getExpenses(startDate, endDate, category, limit) {
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];
  
  // Build query dynamically based on filters
  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY date DESC LIMIT ?';
  params.push(limit);
  
  return db.exec(query, params);
}
```

**Key Concepts:**
- **WHERE Clause**: Filter results (`WHERE date >= '2024-10-01'`)
- **AND/OR**: Combine conditions
- **ORDER BY**: Sort results (DESC = newest first)
- **LIMIT**: Restrict number of results
- **Dynamic Queries**: Build SQL based on user input

### UPDATE: Modifying Data

**Code Example:**
```javascript
function updateExpense(id, amount, category, description, date) {
  // Check if exists
  const existing = db.exec('SELECT * FROM expenses WHERE id = ?', [id]);
  if (!existing[0]) {
    throw new Error('Expense not found');
  }
  
  // Build update statement dynamically
  const updates = [];
  const params = [];
  
  if (amount !== null) {
    updates.push('amount = ?');
    params.push(amount);
  }
  
  if (category !== null) {
    updates.push('category = ?');
    params.push(category);
  }
  
  // Execute update
  params.push(id); // WHERE id = ?
  db.run(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`, params);
  
  saveDatabase();
}
```

**Key Concepts:**
- **SET Clause**: Specify what to update (`SET amount = 50`)
- **WHERE Clause**: Which row(s) to update (`WHERE id = 5`)
- **Partial Updates**: Only update provided fields
- **Validation**: Check existence before updating

### DELETE: Removing Data

**Code Example:**
```javascript
function deleteExpense(id) {
  // Check if exists
  const existing = db.exec('SELECT * FROM expenses WHERE id = ?', [id]);
  if (!existing[0]) {
    throw new Error('Expense not found');
  }
  
  // Delete the row
  db.run('DELETE FROM expenses WHERE id = ?', [id]);
  
  saveDatabase();
  
  return existing; // Return what was deleted
}
```

**Key Concepts:**
- **DELETE Statement**: Remove rows from table
- **WHERE Clause**: ALWAYS use WHERE or you'll delete everything!
- **Verification**: Check before deleting
- **Return Value**: Return deleted data for confirmation

## 📊 SQL Aggregation Functions

Aggregations combine multiple rows into summary statistics.

### COUNT: Number of Records

```javascript
// How many food expenses?
SELECT COUNT(*) as transaction_count
FROM expenses
WHERE category = 'food'
```

### SUM: Total Amount

```javascript
// Total spending in October
SELECT SUM(amount) as total_amount
FROM expenses
WHERE date >= '2024-10-01' AND date <= '2024-10-31'
```

### AVG: Average Value

```javascript
// Average expense amount
SELECT AVG(amount) as average_amount
FROM expenses
```

### MIN/MAX: Smallest/Largest Values

```javascript
// Cheapest and most expensive purchase
SELECT MIN(amount) as min, MAX(amount) as max
FROM expenses
```

### GROUP BY: Category Breakdown

**Most Important Aggregation Concept:**

```javascript
SELECT 
  category,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount
FROM expenses
GROUP BY category
ORDER BY total_amount DESC
```

**What this does:**
1. Groups all rows by category (food, transport, etc.)
2. For each group, calculates:
   - How many transactions
   - Total amount spent
   - Average per transaction
   - Smallest and largest amounts
3. Orders results by total spending (highest first)

**Example Output:**
```
category    | count | total  | average | min   | max
------------|-------|--------|---------|-------|-------
food        | 23    | 450.00 | 19.57   | 5.00  | 85.00
transport   | 12    | 215.50 | 17.96   | 8.00  | 45.00
bills       | 4     | 320.00 | 80.00   | 75.00 | 120.00
```

## 🔒 Security: SQL Injection Prevention

**The Problem:**
```javascript
// ❌ DANGEROUS - DON'T DO THIS!
const query = `SELECT * FROM expenses WHERE category = '${userInput}'`;
db.exec(query);

// If userInput = "food' OR '1'='1"
// Query becomes: SELECT * FROM expenses WHERE category = 'food' OR '1'='1'
// This returns ALL expenses! Security breach!
```

**The Solution: Parameterized Queries**
```javascript
// ✅ SAFE - ALWAYS DO THIS!
const query = 'SELECT * FROM expenses WHERE category = ?';
db.exec(query, [userInput]);

// Even if userInput = "food' OR '1'='1"
// It's treated as a literal string, not SQL code
// No injection possible!
```

**Why Parameterized Queries Work:**
1. SQL structure is defined separately from data
2. Database treats `?` placeholders as data, never as code
3. Special characters are automatically escaped
4. Prevents all forms of SQL injection

## 📈 Date Range Queries

Working with dates is crucial for expense tracking.

**Date Format:**
- Always use ISO format: `YYYY-MM-DD` (e.g., "2024-11-03")
- Lexicographically sortable (alphabetical order = chronological order)
- SQLite TEXT comparison works correctly

**Range Queries:**
```javascript
// All expenses in October 2024
SELECT * FROM expenses
WHERE date >= '2024-10-01' 
  AND date <= '2024-10-31'
ORDER BY date ASC
```

**Month Calculations:**
```javascript
function getMonthlySummary(year, month) {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
  
  // Use in query
  const query = `
    SELECT * FROM expenses
    WHERE date >= ? AND date <= ?
  `;
  return db.exec(query, [startDate, endDate]);
}
```

## 🎯 Input Validation

**Why Validate?**
1. Prevent bad data in database
2. Provide helpful error messages
3. Maintain data integrity
4. Prevent crashes

**Validation Functions:**

```javascript
// Amount must be positive number
function isValidAmount(amount) {
  return typeof amount === 'number' 
      && amount > 0 
      && isFinite(amount);
}

// Date must be YYYY-MM-DD and a real date
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date) && dateString === date.toISOString().split('T')[0];
}

// Category must be in allowed list
function isValidCategory(category) {
  const validCategories = ['food', 'transport', ...];
  return validCategories.includes(category.toLowerCase());
}
```

**When to Validate:**
- ✅ Before INSERT
- ✅ Before UPDATE
- ✅ Before building queries with user input
- ✅ As early as possible (fail fast!)

## 🔄 Error Handling Patterns

**Try-Catch in MCP Tools:**
```javascript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Execute tool
    const result = addExpense(args.amount, args.category, ...);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
    
  } catch (error) {
    // Return error to user
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: error.message
        }, null, 2)
      }],
      isError: true
    };
  }
});
```

**Common Error Types:**
1. **Validation Errors**: Bad input from user
2. **Not Found Errors**: Trying to update/delete non-existent record
3. **Database Errors**: Constraint violations, disk full, etc.
4. **Type Errors**: Wrong data type provided

## 📦 Best Practices Summary

### ✅ DO:
- Use parameterized queries ALWAYS
- Validate all inputs before database operations
- Use indexes on frequently queried columns
- Return helpful error messages
- Save database after modifications (sql.js requirement)
- Use transactions for multi-step operations
- Document your queries with comments

### ❌ DON'T:
- Concatenate user input into SQL strings
- Forget WHERE clause in UPDATE/DELETE
- Skip validation "because it should be fine"
- Return raw database errors to users
- Query in a loop (use JOINs instead)
- Store dates as strings without validation

## 🎓 Next Steps for Learning

1. **Practice Aggregations**: Try different GROUP BY combinations
2. **Complex Queries**: Add JOINs when you add more tables
3. **Transactions**: Wrap related operations in BEGIN/COMMIT
4. **Indexes**: Experiment with EXPLAIN QUERY PLAN
5. **Backup**: Implement automated backups of finance.db
6. **Reports**: Generate more complex analytics

## 📚 Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQL Tutorial](https://www.w3schools.com/sql/)
- [sql.js Documentation](https://sql.js.org/documentation/)
- [SQL Injection Explained](https://www.owasp.org/index.php/SQL_Injection)

Happy learning! 🚀
