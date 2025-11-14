# Claude Desktop Configuration Guide

## Step-by-Step Setup

### 1. Find Your Claude Desktop Config File

The location depends on your operating system:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
  - Full path: `C:\Users\YOUR_USERNAME\AppData\Roaming\Claude\claude_desktop_config.json`
  
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. Open the Config File

You can open it in any text editor. If it doesn't exist, create it.

### 3. Add the Finance MCP Server Configuration

Add or update the `mcpServers` section in the JSON file:

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

**⚠️ IMPORTANT**: Replace the path with your actual installation directory!

### 4. If You Have Other MCP Servers

If you already have other MCP servers configured, add the finance-tracker to the existing list:

```json
{
  "mcpServers": {
    "weather-server": {
      "command": "node",
      "args": ["C:\\path\\to\\weather\\server.js"]
    },
    "reddit-server": {
      "command": "node",
      "args": ["C:\\path\\to\\reddit\\server.js"]
    },
    "finance-tracker": {
      "command": "node",
      "args": ["C:\\Users\\Divik\\Downloads\\Github\\MCP\\financemcp\\index.js"]
    }
  }
}
```

### 5. Verify the Path

Make sure the path points to your actual `index.js` file. You can verify it by running:

**PowerShell:**
```powershell
Test-Path "C:\Users\Divik\Downloads\Github\MCP\financemcp\index.js"
```

This should return `True` if the path is correct.

### 6. Restart Claude Desktop

After saving the config file:
1. **Quit** Claude Desktop completely (not just close the window)
2. **Restart** Claude Desktop

### 7. Verify the Server is Running

Once Claude Desktop restarts, you can check if the server is loaded:
- Look for the 🔌 icon or MCP indicator in Claude
- Try asking: "What finance tools do you have?"
- Claude should list the 7 expense tracking tools

## Troubleshooting

### Server Not Appearing

1. **Check the config file syntax**: Make sure the JSON is valid (no missing commas, brackets)
2. **Verify the path**: Ensure the path uses double backslashes `\\` on Windows
3. **Check Node.js**: Make sure Node.js is installed and in your PATH
   ```powershell
   node --version
   ```
4. **View Claude's logs**: Check Claude Desktop's developer console for errors

### Path Issues on Windows

Windows paths need double backslashes in JSON:
- ✅ Correct: `"C:\\Users\\Divik\\Downloads\\..."`
- ❌ Wrong: `"C:\Users\Divik\Downloads\..."`

Or use forward slashes:
- ✅ Also correct: `"C:/Users/Divik/Downloads/..."`

### Testing the Server Manually

You can test if the server starts correctly:

```powershell
node C:\Users\Divik\Downloads\Github\MCP\financemcp\index.js
```

You should see: `Personal Finance Tracker MCP server running on stdio`

Press `Ctrl+C` to stop.

## Example Usage

Once configured, you can ask Claude things like:

- "Add an expense of $45.50 for groceries today, category food"
- "Show me all my expenses from last week"
- "What's my spending breakdown by category for October?"
- "Generate a monthly summary for November 2024"
- "Export my food expenses to CSV"

Happy tracking! 💰
