# Quick Reference Card

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Test the server
node test.js

# Run the server
npm start
```

## 🔧 Available Tools

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `add_expense` | Add new expense | amount, category, description, date |
| `get_expenses` | List expenses | startDate, endDate, category, limit |
| `get_spending_by_category` | Category breakdown | startDate, endDate |
| `get_monthly_summary` | Monthly report | year, month |
| `update_expense` | Modify expense | id, [any field to update] |
| `delete_expense` | Remove expense | id |
| `export_to_csv` | Export to CSV | startDate, endDate, category |

## 📋 Valid Categories

```
food, transport, entertainment, bills, shopping, 
health, education, travel, savings, other
```

## 📅 Date Format

Always use: `YYYY-MM-DD` (e.g., "2024-11-03")

## 💬 Example Queries

```
"Add $25 for lunch today, category food"
"Show my expenses from last week"
"What's my spending by category for October?"
"Generate monthly summary for November 2024"
"Update expense 5 to $30"
"Delete expense 12"
"Export all food expenses to CSV"
```

## 🗄️ Database Schema

```sql
expenses (
  id INTEGER PRIMARY KEY,
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT
)
```

## 📂 Project Structure

```
financemcp/
├── index.js          # Main MCP server
├── db.js             # Database & validation
├── utils.js          # CSV export & helpers
├── package.json      # Dependencies
├── finance.db        # SQLite database
└── README.md         # Documentation
```

## ⚙️ Claude Desktop Config

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "finance-tracker": {
      "command": "node",
      "args": ["C:\\path\\to\\financemcp\\index.js"]
    }
  }
}
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Server not in Claude | Check config path, restart Claude |
| Cannot install | Use sql.js (no build tools needed) |
| Database errors | Check write permissions |
| Invalid category | Use one of the 10 valid categories |
| Date errors | Use YYYY-MM-DD format |

## 🔒 Security Checklist

- ✅ Parameterized queries (prevents SQL injection)
- ✅ Input validation (amount, date, category)
- ✅ Amount must be positive
- ✅ Date format validated
- ✅ Category whitelist enforced

## 📊 SQL Cheat Sheet

```sql
-- Insert
INSERT INTO expenses (amount, category, description, date)
VALUES (?, ?, ?, ?)

-- Select all
SELECT * FROM expenses

-- Filter by date
SELECT * FROM expenses 
WHERE date >= '2024-10-01' AND date <= '2024-10-31'

-- Filter by category
SELECT * FROM expenses WHERE category = 'food'

-- Count & sum by category
SELECT category, COUNT(*), SUM(amount)
FROM expenses
GROUP BY category

-- Update
UPDATE expenses SET amount = ? WHERE id = ?

-- Delete
DELETE FROM expenses WHERE id = ?
```

## 📈 Common Aggregations

```sql
-- Total spending
SELECT SUM(amount) FROM expenses

-- Average expense
SELECT AVG(amount) FROM expenses

-- Expense count
SELECT COUNT(*) FROM expenses

-- By category
SELECT category, SUM(amount) 
FROM expenses 
GROUP BY category 
ORDER BY SUM(amount) DESC

-- Monthly total
SELECT SUM(amount)
FROM expenses
WHERE date >= '2024-11-01' AND date <= '2024-11-30'
```

## 📁 File Locations

- **Database**: `./finance.db`
- **Config**: See Claude Desktop section above
- **Logs**: Check Claude Desktop console
- **Exports**: CSV returned as text

## 🎯 Validation Rules

| Field | Rule |
|-------|------|
| amount | Positive number, finite |
| category | One of 10 valid categories |
| description | Non-empty string |
| date | YYYY-MM-DD, valid date |
| id | Positive integer |

## 💡 Pro Tips

1. **Batch imports**: Ask Claude to add multiple expenses at once
2. **Natural language**: Claude understands "yesterday", "last week", etc.
3. **Analysis**: Ask for insights, not just data
4. **CSV export**: Great for Excel/Sheets analysis
5. **Monthly reviews**: Set up regular check-ins

## 🔗 Important Files

- `README.md` - Full documentation
- `CLAUDE_SETUP.md` - Setup instructions
- `EXAMPLES.md` - Usage examples
- `LEARNING_GUIDE.md` - Database concepts
- `test.js` - Test script

## 📞 Need Help?

1. Check `LEARNING_GUIDE.md` for database concepts
2. See `EXAMPLES.md` for usage patterns
3. Run `node test.js` to verify setup
4. Check Claude Desktop console for errors

---

**Remember**: Always restart Claude Desktop after config changes! 🔄
