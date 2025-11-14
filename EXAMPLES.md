# Example Usage Scenarios

This document provides real-world examples of how to use the Personal Finance Tracker MCP server with Claude.

## 📝 Adding Expenses

### Basic Expense Entry
```
You: "Add an expense of $12.50 for lunch today, category food"
Claude: [Uses add_expense tool]
Result: Expense added with ID 1
```

### Multiple Expenses at Once
```
You: "Add these expenses:
- $45 for gas on November 1st, category transport
- $120 for electricity bill on November 2nd, category bills
- $35.99 for movie tickets on November 3rd, category entertainment"

Claude: [Uses add_expense tool multiple times]
Result: All three expenses added
```

### Adding Past Expenses
```
You: "Add a $85 expense for groceries on 2024-10-28, category food"
Claude: [Uses add_expense with specific date]
Result: Expense added with the October date
```

## 📊 Viewing Expenses

### View Recent Expenses
```
You: "Show me my last 10 expenses"
Claude: [Uses get_expenses with limit 10]
Result: Lists 10 most recent expenses
```

### Filter by Date Range
```
You: "Show all my expenses from October 2024"
Claude: [Uses get_expenses with startDate: "2024-10-01", endDate: "2024-10-31"]
Result: All October expenses
```

### Filter by Category
```
You: "List all my food expenses from the past week"
Claude: [Uses get_expenses with category: "food" and appropriate date range]
Result: All food expenses from last 7 days
```

### Combined Filters
```
You: "Show me all transport expenses over $50 from October"
Claude: [Uses get_expenses with filters, then analyzes results]
Result: Filtered list of expensive transport costs
```

## 📈 Category Analysis

### Overall Spending Breakdown
```
You: "What's my spending breakdown by category?"
Claude: [Uses get_spending_by_category]
Result: Shows each category with total, count, average, percentage
```

### Example Output:
```
Total Spending: $1,247.50

Category Breakdown:
1. Food: $450.00 (36.1%) - 23 transactions, avg $19.57
2. Bills: $320.00 (25.6%) - 4 transactions, avg $80.00
3. Transport: $215.50 (17.3%) - 12 transactions, avg $17.96
4. Entertainment: $142.00 (11.4%) - 8 transactions, avg $17.75
5. Shopping: $120.00 (9.6%) - 5 transactions, avg $24.00
```

### Monthly Category Breakdown
```
You: "Show my spending by category for October 2024"
Claude: [Uses get_spending_by_category with date range]
Result: October-specific category breakdown
```

## 📅 Monthly Reports

### Complete Monthly Summary
```
You: "Generate my spending summary for October 2024"
Claude: [Uses get_monthly_summary with year: 2024, month: 10]
```

### Example Output:
```
October 2024 Summary
Period: 2024-10-01 to 2024-10-31

Overall:
- Total Transactions: 48
- Total Spending: $1,247.50
- Average Transaction: $26.00

Top Categories:
1. Food: $450.00 (23 transactions)
2. Bills: $320.00 (4 transactions)
3. Transport: $215.50 (12 transactions)

Daily Spending Trend:
- Oct 1: $45.00 (3 transactions)
- Oct 2: $150.00 (2 transactions)
...
```

### Compare Multiple Months
```
You: "Show me my spending summary for September, October, and November 2024"
Claude: [Uses get_monthly_summary three times]
Result: Side-by-side comparison of three months
```

## ✏️ Updating Expenses

### Update Amount
```
You: "Update expense ID 5 to change the amount to $32.50"
Claude: [Uses update_expense with id: 5, amount: 32.50]
Result: Expense 5 updated
```

### Update Category
```
You: "Change expense 12's category from food to entertainment"
Claude: [Uses update_expense with id: 12, category: "entertainment"]
Result: Category changed
```

### Update Multiple Fields
```
You: "Update expense 8: change amount to $55, category to transport, and description to 'Uber to airport'"
Claude: [Uses update_expense with all three fields]
Result: All fields updated
```

### Fix Wrong Date
```
You: "The expense with ID 15 should be dated 2024-10-30, not today"
Claude: [Uses update_expense with id: 15, date: "2024-10-30"]
Result: Date corrected
```

## 🗑️ Deleting Expenses

### Delete by ID
```
You: "Delete expense with ID 7"
Claude: [Uses delete_expense with id: 7]
Result: Expense 7 deleted
```

### Delete Recent Mistake
```
You: "I just added an expense by mistake, it's ID 23. Please delete it."
Claude: [Uses delete_expense with id: 23]
Result: Expense removed
```

## 📤 Exporting Data

### Export All Expenses
```
You: "Export all my expenses to CSV"
Claude: [Uses export_to_csv with no filters]
Result: Complete CSV file with all expenses
```

### Export by Date Range
```
You: "Export all my October 2024 expenses to CSV"
Claude: [Uses export_to_csv with date range]
Result: CSV with October expenses only
```

### Export by Category
```
You: "Export all my food expenses to CSV format"
Claude: [Uses export_to_csv with category: "food"]
Result: CSV with only food expenses
```

## 🔍 Advanced Analysis Questions

### Spending Patterns
```
You: "What category am I spending the most on?"
Claude: [Uses get_spending_by_category and analyzes]
Result: Identifies top spending category
```

### Budget Tracking
```
You: "Did I spend more than $500 on food this month?"
Claude: [Uses get_spending_by_category or get_monthly_summary]
Result: Yes/No with exact amount
```

### Daily Average
```
You: "What's my average daily spending in November?"
Claude: [Uses get_monthly_summary and calculates]
Result: Total spending / number of days
```

### Find Expensive Items
```
You: "What's the most expensive thing I bought this month?"
Claude: [Uses get_expenses and analyzes amounts]
Result: Identifies highest expense
```

### Category Comparison
```
You: "Am I spending more on food or entertainment?"
Claude: [Uses get_spending_by_category]
Result: Compares the two categories
```

### Trend Analysis
```
You: "Show me how my spending changed from September to October to November"
Claude: [Uses get_monthly_summary for each month]
Result: Month-over-month comparison
```

## 💡 Pro Tips

### Batch Operations
You can ask Claude to perform multiple operations:
```
"Add a $25 food expense for today, then show me my total food spending this week"
```

### Natural Language
You don't need to use exact formats:
```
✅ "Add $50 for groceries yesterday"
✅ "What did I spend on transport last week?"
✅ "Remove that expense I just added"
```

### Get Insights
Ask Claude to analyze the data:
```
"Based on my October spending, what areas should I cut back on?"
"Give me recommendations to reduce my monthly expenses"
```

### Budget Goals
Track against goals:
```
"My monthly food budget is $400. How am I doing this month?"
"If I keep spending at this rate, what will my total be for November?"
```

## 🎯 Common Workflows

### Daily Entry
```
End of day: "Add these expenses from today:
- $8.50 coffee and breakfast, food
- $12 lunch, food  
- $45 gas, transport
- $25 groceries, food"
```

### Weekly Review
```
Every Sunday: "Show me my spending summary for this week and compare it to last week"
```

### Monthly Closeout
```
Start of month: 
1. "Generate my spending summary for [last month]"
2. "Export all [last month] expenses to CSV"
3. "What categories did I overspend in?"
```

### Expense Correction
```
When you notice an error:
1. "Show me my last 5 expenses"
2. "Update expense [ID] to change [field]"
3. "Show the updated expense to confirm"
```

Happy tracking! 🎉
