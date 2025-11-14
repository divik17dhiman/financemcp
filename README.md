# Personal Finance Tracker MCP Server

A Model Context Protocol (MCP) server for tracking personal expenses with SQLite database. This project demonstrates CRUD operations, database queries, aggregations, and data export functionality.

## 🎯 Features

- **Add Expenses**: Record expenses with amount, category, description, and date
- **Query Expenses**: Filter by date range and category
- **Category Analysis**: Get spending breakdown by category with statistics
- **Monthly Summaries**: Generate comprehensive monthly reports
- **Update/Delete**: Modify or remove expense entries
- **Export to CSV**: Export filtered data to CSV format
- **Input Validation**: Comprehensive validation for amounts, dates, and categories

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Claude Desktop app

## 🚀 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install:
   - `@modelcontextprotocol/sdk`: MCP SDK for server implementation
   - `sql.js`: SQLite compiled to JavaScript (no build tools required!)

2. **Verify installation:**
   ```bash
   npm list
   ```

## ⚙️ Configuration

### Configure Claude Desktop

1. **Locate your Claude Desktop config file:**
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the MCP server configuration:**
   ```json
   {
     "mcpServers": {
       "finance-tracker": {
         "command": "node",
         "args": ["C:\\Users\\Divik\\Downloads\\Github\\MCP\\financemcp\\index.js"]
       }
     }
   }
   ```

   **Important**: Update the path to match your actual installation directory!

3. **Restart Claude Desktop** to load the new configuration.

## 🗄️ Database Schema

The SQLite database (`finance.db`) contains one main table:

```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Supported Categories:**
- food
- transport
- entertainment
- bills
- shopping
- health
- education
- travel
- savings
- other

## 🛠️ Available Tools

### 1. `add_expense`
Add a new expense to the database.

**Parameters:**
- `amount` (number, required): Expense amount (must be positive)
- `category` (string, required): One of the valid categories
- `description` (string, required): Brief description
- `date` (string, required): Date in YYYY-MM-DD format

**Example:**
```
Add an expense: $45.50 for groceries on 2024-11-01, category food
```

### 2. `get_expenses`
Retrieve expenses with optional filtering.

**Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)
- `category` (string, optional): Filter by category
- `limit` (number, optional): Max results (default: 100)

**Examples:**
```
Show me all my expenses from October 2024
Show all food expenses from last week
List my last 20 expenses
```

### 3. `get_spending_by_category`
Get aggregated spending breakdown by category.

**Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)

**Returns:**
- Total spending
- Per-category breakdown with count, sum, average, min, max, percentage

**Example:**
```
Show my spending breakdown by category for October 2024
What categories am I spending the most on?
```

### 4. `get_monthly_summary`
Generate comprehensive monthly spending report.

**Parameters:**
- `year` (number, required): Year (e.g., 2024)
- `month` (number, required): Month (1-12)

**Returns:**
- Total transactions and spending
- Category breakdown
- Daily spending trends

**Example:**
```
Show me my spending summary for November 2024
Generate a monthly report for October 2024
```

### 5. `update_expense`
Update an existing expense.

**Parameters:**
- `id` (number, required): Expense ID
- `amount` (number, optional): New amount
- `category` (string, optional): New category
- `description` (string, optional): New description
- `date` (string, optional): New date

**Example:**
```
Update expense ID 5 to change the amount to $52.30
Change expense 3's category to transport
```

### 6. `delete_expense`
Delete an expense by ID.

**Parameters:**
- `id` (number, required): Expense ID to delete

**Example:**
```
Delete expense with ID 7
Remove the expense I just added (ID 12)
```

### 7. `export_to_csv`
Export expenses to CSV format.

**Parameters:**
- `startDate` (string, optional): Start date filter
- `endDate` (string, optional): End date filter
- `category` (string, optional): Category filter

**Example:**
```
Export all my October expenses to CSV
Export all food expenses to CSV format
```

## 💡 Example Usage Scenarios

Here are some questions you can ask Claude once the server is running:

### Basic Operations
- "Add an expense of $25.50 for lunch today, category food"
- "Add a $150 payment for internet bill on November 1st"
- "Show me all my expenses from this week"
- "List all my transport expenses from October"

### Analysis & Reports
- "What's my total spending this month?"
- "Show me my spending breakdown by category for October 2024"
- "Generate a monthly summary for November 2024"
- "What category am I spending the most on?"
- "Show me my average daily spending this month"

### Data Management
- "Update expense 5 to change the amount to $30"
- "Change expense 3's category from food to entertainment"
- "Delete expense with ID 8"
- "Export all my October expenses to CSV"

### Advanced Queries
- "How much did I spend on food vs entertainment last month?"
- "Show me all expenses over $100 from the past 2 months"
- "What's my average expense per category?"
- "Give me a breakdown of my daily spending for November"

## 🏗️ Project Structure

```
financemcp/
├── index.js          # Main MCP server with all 7 tools
├── db.js             # Database initialization and validation
├── utils.js          # Utility functions (CSV export, formatting)
├── package.json      # Project dependencies
├── finance.db        # SQLite database (auto-created)
└── README.md         # This file
```

## 🔒 Security Features

- **Parameterized Queries**: All SQL queries use parameterized statements to prevent SQL injection
- **Input Validation**: Comprehensive validation for amounts (positive), dates (YYYY-MM-DD), and categories
- **Type Checking**: Strict type validation for all inputs
- **Error Handling**: Graceful error handling with descriptive messages

## 📚 Learning Highlights

This project demonstrates:

1. **Database Operations**
   - Schema design with constraints (CHECK, NOT NULL)
   - Indexes for query optimization
   - CRUD operations (Create, Read, Update, Delete)
   - Transactions and prepared statements

2. **SQL Queries**
   - Filtering with WHERE clauses
   - Aggregations (SUM, COUNT, AVG, MIN, MAX)
   - GROUP BY for category analysis
   - Date range queries
   - Dynamic query building

3. **MCP Best Practices**
   - Tool schema definitions with validation
   - Error handling and user feedback
   - Structured responses with metadata
   - Input sanitization

4. **Data Export**
   - CSV generation with proper escaping
   - Batch operations
   - Data transformation

## 🐛 Troubleshooting

### Server not appearing in Claude
- Verify the path in `claude_desktop_config.json` is correct
- Restart Claude Desktop after config changes
- Check Claude's developer console for errors

### Database errors
- Ensure write permissions in the project directory
- Check if `finance.db` file is locked by another process
- Delete `finance.db` to reset (will lose all data)

### Installation issues
- Run `npm install` again
- Try deleting `node_modules` and `package-lock.json`, then reinstall
- Ensure Node.js version is 16+

## 🔧 Development

### Testing the server directly
```bash
npm start
```

The server will run on stdio and wait for MCP protocol messages.

### Viewing the database
You can use any SQLite browser to view `finance.db`:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- VS Code SQLite extension
- Command line: `sqlite3 finance.db`

## 📝 Future Enhancements

Ideas for extending this project:
- [ ] Add budget limits per category
- [ ] Recurring expenses support
- [ ] Multiple currencies
- [ ] Receipt attachment storage
- [ ] Income tracking
- [ ] Savings goals
- [ ] Data visualization (charts)
- [ ] Tags for expenses
- [ ] Multi-user support
- [ ] Backup/restore functionality

## 📄 License

MIT License - Feel free to use and modify for your own learning!

## 🙏 Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- Uses [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for database operations

---

**Happy expense tracking! 💰📊**
