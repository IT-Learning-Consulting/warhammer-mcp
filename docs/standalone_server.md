# Standalone Server Mode

This guide explains how to run the Foundry MCP Backend independently of Claude Desktop, allowing 24/7 operation and connectivity from multiple MCP clients simultaneously.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Methods](#methods)
- [Configuration](#configuration)
- [MCP Client Configuration](#mcp-client-configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

---

## Overview

### What is Standalone Mode?

By default, the MCP server (`index.js`) is started by Claude Desktop and acts as a middleman between Claude and the backend. In standalone mode, you run the **backend directly** (`backend.js`), which:

- ✅ Runs independently of any MCP client
- ✅ Stays active 24/7 (with PM2 or as a service)
- ✅ Accepts connections from multiple MCP clients simultaneously
- ✅ Keeps Foundry VTT connected continuously
- ✅ Works with Claude Desktop, Claude Code, VS Code, n8n, GLM, and other MCP clients

### When to Use Standalone Mode

Use standalone mode when you want:
- Backend running even when Claude Desktop is closed
- Multiple AI tools connecting to the same Foundry instance
- 24/7 availability for remote automation (n8n, custom scripts)
- Development/testing without restarting Claude Desktop

---

## Architecture

### Default Architecture (Claude Desktop Only)

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│  Claude Desktop │──MCP──►│   index.js       │──TCP──►│   backend.js    │
│                 │ stdio  │ (MCP Wrapper)    │ 31414  │ (Backend)       │
└─────────────────┘        └──────────────────┘        └─────────────────┘
                                                              │
                                                        WebSocket 31415
                                                              ▼
                                                       ┌─────────────────┐
                                                       │ Foundry Module  │
                                                       └─────────────────┘
```

### Standalone Architecture

```
┌──────────────────┐
│  Claude Desktop  │──┐
├──────────────────┤  │
│   Claude Code    │──┤
├──────────────────┤  │
│   VS Code + GH   │──┼────► ┌──────────────────┐
├──────────────────┤  │      │   index.js       │──┐
│      n8n         │──┤      │ (MCP Wrapper)    │  │
├──────────────────┤  │      └──────────────────┘  │
│    GLM 4.7       │──┘                             │ TCP 31414
└──────────────────┘                                │
                                                    ▼
                                             ┌─────────────────┐
                                             │   backend.js    │
                                             │ (Always Running)│
                                             └─────────────────┘
                                                     │
                                               WebSocket 31415
                                                     ▼
                                              ┌─────────────────┐
                                              │ Foundry Module  │
                                              └─────────────────┘
```

### Port Usage

| Port | Purpose | Used By | Required? |
|------|---------|---------|-----------|
| **31414** | TCP Control Channel | MCP clients → backend | ✅ For MCP tools |
| **31415** | WebSocket | Foundry browser → backend | ✅ For Foundry VTT |

**Important**: The Foundry VTT browser module connects directly to port **31415**, completely bypassing `index.js`. MCP clients connect to port **31414** to use the 48+ tools.

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MCP server already built (`npm run build`)
- Located in: `d:\foundry-vtt-mcp\packages\mcp-server\`

### Fastest Method (Windows)

1. Navigate to: `d:\foundry-vtt-mcp\packages\mcp-server\`
2. Double-click: **`start-backend.bat`**
3. Backend starts listening on ports 31414 and 31415

### Stop the Backend

Press **Ctrl+C** in the terminal window running the backend.

---

## Methods

### Method 1: Batch File (Windows)

**File**: `start-backend.bat`

**Usage**:
```cmd
cd d:\foundry-vtt-mcp\packages\mcp-server
start-backend.bat
```

**Features**:
- ✅ Checks for stale lock files
- ✅ Prevents duplicate instances
- ✅ Shows clear status messages
- ✅ Simple double-click execution

---

### Method 2: PowerShell Script

**File**: `start-backend.ps1`

**Usage (Foreground)**:
```powershell
cd d:\foundry-vtt-mcp\packages\mcp-server
.\start-backend.ps1
```

**Usage (Background)**:
```powershell
.\start-backend.ps1 -Hidden
```

**Features**:
- ✅ Background mode (no visible window)
- ✅ Returns PID for easy management
- ✅ Stale lock file cleanup
- ✅ Better error handling

**Stop Background Process**:
```powershell
Stop-Process -Id <PID>
```

---

### Method 3: npm Scripts

**Usage**:
```bash
cd d:\foundry-vtt-mcp\packages\mcp-server

# Start backend directly
npm run start:standalone

# Or use bundled version (single file, all deps included)
npm run start:standalone:bundle
```

**Available Scripts**:
| Script | Command | Purpose |
|--------|---------|---------|
| `start:standalone` | `node dist/backend.js` | Start backend (requires node_modules) |
| `start:standalone:bundle` | `node dist/backend.bundle.cjs` | Start bundled version (standalone) |

---

### Method 4: PM2 (Recommended for 24/7)

**PM2** is a production-grade process manager that keeps the backend running 24/7 with auto-restart.

#### Install PM2 (Once)

```bash
npm install -g pm2
```

#### Start Backend with PM2

```bash
cd d:\foundry-vtt-mcp\packages\mcp-server
npm run pm2:start
```

#### Manage Backend

```bash
# Check status
npm run pm2:status

# View live logs
npm run pm2:logs

# Stop backend
npm run pm2:stop

# Restart backend
npm run pm2:restart

# Delete from PM2
pm2 delete foundry-mcp-backend
```

#### Auto-Start on Windows Boot

```bash
# Save current PM2 process list
pm2 save

# Configure auto-start (follow the instructions shown)
pm2 startup

# On Windows, this typically creates a startup task
```

#### PM2 Configuration

The backend is configured in `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'foundry-mcp-backend',
    script: 'dist/backend.js',
    autorestart: true,        // Auto-restart on crash
    max_restarts: 10,          // Max restarts in min_uptime window
    min_uptime: '10s',         // Minimum uptime before restart count resets
    restart_delay: 3000,       // Wait 3s between restarts
    watch: false,              // Don't watch files for changes
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/backend-error.log',
    out_file: 'logs/backend-out.log'
  }]
};
```

---

## Configuration

### Backend Lock File

The backend uses a lock file to prevent multiple instances:

**Location**: `%TEMP%\foundry-mcp-backend.lock`  
**Contains**: Process ID (PID) of running backend

**Stale Lock Files**: If the backend crashes, the lock file may remain. All start scripts automatically detect and clean stale locks.

**Manual Cleanup**:
```bash
# Windows
del %TEMP%\foundry-mcp-backend.lock

# PowerShell
Remove-Item $env:TEMP\foundry-mcp-backend.lock
```

---

### Environment Variables

The backend reads these environment variables (optional):

| Variable | Default | Purpose |
|----------|---------|---------|
| `LOG_LEVEL` | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`) |
| `FOUNDRY_HOST` | `localhost` | Foundry connector host |
| `FOUNDRY_PORT` | `31415` | Foundry WebSocket port |

**Example**:
```bash
# Windows CMD
set LOG_LEVEL=debug
npm run start:standalone

# PowerShell
$env:LOG_LEVEL="debug"
npm run start:standalone

# PM2 (edit ecosystem.config.cjs)
env: {
  LOG_LEVEL: 'debug'
}
```

---

## MCP Client Configuration

Your existing MCP client configs **continue to work unchanged**. The backend runs independently, and MCP clients connect via `index.js` wrapper.

### Claude Desktop

**Location**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
    "mcpServers": {
        "warhammer-mcp": {
            "command": "node",
            "args": [
                "d:\\foundry-vtt-mcp\\packages\\mcp-server\\dist\\index.js"
            ],
            "env": {
                "FOUNDRY_HOST": "localhost",
                "FOUNDRY_PORT": "31415"
            }
        }
    }
}
```

**How it works**:
1. Claude Desktop starts `index.js` (MCP wrapper)
2. `index.js` connects to backend on port 31414
3. If backend isn't running, `index.js` auto-starts it

---

### VS Code / Claude Code

**Location**: `.vscode/mcp.json`

```json
{
    "servers": {
        "foundry-mcp": {
            "type": "stdio",
            "command": "node",
            "args": [
                "${workspaceFolder}/packages/mcp-server/dist/index.js"
            ],
            "env": {
                "LOG_LEVEL": "info",
                "FOUNDRY_HOST": "localhost",
                "FOUNDRY_PORT": "31415",
                "FOUNDRY_NAMESPACE": "/warhammer-mcp"
            }
        }
    }
}
```

---

### n8n Configuration

For n8n, you have two options:

#### Option A: Use MCP Wrapper (Recommended)

Connect to the backend via `index.js` using the MCP protocol over stdio.

#### Option B: Direct TCP Connection

Connect directly to port **31414** using JSON-line protocol:

**Message Format**:
```json
{"id": "unique-id", "method": "toolName", "params": {...}}
```

**Response Format**:
```json
{"id": "unique-id", "result": {...}}
{"id": "unique-id", "error": {"message": "error details"}}
```

---

### Custom MCP Clients

To connect custom clients to the standalone backend:

1. **Start the backend** using any method above
2. **Connect via TCP** to `127.0.0.1:31414`
3. **Send JSON-line messages**:
   ```json
   {"id": "1", "method": "ping", "params": {}}\n
   ```
4. **Receive responses**:
   ```json
   {"id": "1", "result": {"ok": true}}\n
   ```

**Available methods**: See backend logs or source code for 48+ available tools.

---

## Troubleshooting

### Backend Won't Start

**Symptom**: "Backend already running" but it's not actually running

**Cause**: Stale lock file

**Solution**:
```bash
# Remove lock file
del %TEMP%\foundry-mcp-backend.lock

# Try starting again
npm run start:standalone
```

---

### Port Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::31415`

**Cause**: Another process using port 31415

**Solution**:
```bash
# Find process using port
netstat -ano | findstr 31415

# Kill the process
taskkill /F /PID <PID>

# Or find and kill via PowerShell
Get-NetTCPConnection -LocalPort 31415 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

---

### Foundry Module Won't Connect

**Symptom**: "Connection refused" in Foundry browser console

**Check**:
1. Backend is running: `netstat -ano | findstr 31415`
2. Port 31415 shows `LISTENING`
3. No firewall blocking localhost connections

**Solution**:
```bash
# Verify backend is running
npm run pm2:status

# Check logs
npm run pm2:logs

# Restart backend
npm run pm2:restart
```

---

### Multiple Claude Desktops

**Symptom**: You have multiple Claude Desktop installations or profiles

**Solution**: Each can use the same backend! Just ensure they all point to the same `index.js` in their configs. The backend handles multiple concurrent MCP clients.

---

### Logs Not Appearing

**Symptom**: PM2 logs directory is empty

**Cause**: Logs directory doesn't exist or wrong path

**Solution**:
```bash
# Create logs directory
mkdir logs

# Check PM2 logs path
pm2 describe foundry-mcp-backend

# View logs directly
pm2 logs foundry-mcp-backend --lines 100
```

---

## Advanced Usage

### Development Mode

Run backend with debug logging:

```bash
# Windows CMD
set LOG_LEVEL=debug
npm run start:standalone

# PowerShell
$env:LOG_LEVEL="debug"; npm run start:standalone
```

---

### Custom Port

To change the WebSocket port (not recommended, requires Foundry module config change):

```bash
# Edit ecosystem.config.cjs
env: {
  FOUNDRY_PORT: '31416'
}

# Restart
npm run pm2:restart
```

**Also update**: Foundry module settings in game to use port 31416.

---

### Multiple Foundry Instances

To run multiple Foundry instances with separate backends:

1. **Copy** the mcp-server directory to a new location
2. **Edit** `ecosystem.config.cjs` to use different ports:
   ```javascript
   env: {
     FOUNDRY_PORT: '31416'  // Changed from 31415
   }
   ```
3. **Start** with a different PM2 app name:
   ```bash
   pm2 start ecosystem.config.cjs --name foundry-mcp-backend-2
   ```
4. **Configure** second Foundry instance to connect to port 31416

---

### Auto-Start Without PM2

Use Windows Task Scheduler to start on login:

1. Open **Task Scheduler**
2. Create Basic Task: "Foundry MCP Backend"
3. Trigger: **At log on**
4. Action: **Start a program**
   - Program: `powershell.exe`
   - Arguments: `-WindowStyle Hidden -File "d:\foundry-vtt-mcp\packages\mcp-server\start-backend.ps1" -Hidden`
5. Conditions: Uncheck "Start only if on AC power"

---

## Comparison: Methods Summary

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Batch File** | Simple, visible console | Manual restart, terminal window | Quick testing |
| **PowerShell** | Background mode, cleaner | Requires PowerShell | Development |
| **npm Script** | Familiar to developers | Manual restart | Dev/testing |
| **PM2** | Auto-restart, logs, robust | Requires global install | Production 24/7 |

---

## Support & Resources

### Logs Locations

| Method | Log Location |
|--------|--------------|
| Batch/PowerShell | Console output only |
| npm script | Console output only |
| PM2 | `packages/mcp-server/logs/` |
| MCP wrapper | `%TEMP%\foundry-mcp-server\mcp-server.log` |

### Checking Backend Status

```bash
# Check if ports are listening
netstat -ano | findstr "31414 31415"

# Check lock file
type %TEMP%\foundry-mcp-backend.lock

# PM2 status
pm2 status
pm2 logs foundry-mcp-backend --lines 50
```

### Common Commands Reference

```bash
# Start backend (simple)
cd d:\foundry-vtt-mcp\packages\mcp-server
npm run start:standalone

# Start with PM2 (recommended)
npm run pm2:start
pm2 save
pm2 startup

# Stop
npm run pm2:stop

# Restart
npm run pm2:restart

# View logs
npm run pm2:logs

# Status check
npm run pm2:status
netstat -ano | findstr 31415
```

---

## Additional Notes

### Compatibility

- ✅ Works with existing Claude Desktop configs
- ✅ Works with VS Code / Claude Code
- ✅ Compatible with any MCP client
- ✅ Foundry VTT connection unchanged
- ✅ All 48+ tools available

### Security

- Backend binds to `localhost` only (not accessible from network)
- Port 31414: Control channel (TCP, JSON-line protocol)
- Port 31415: WebSocket (Foundry browser module)
- No authentication required (localhost-only)

### Performance

- Backend uses ~50-100 MB RAM
- CPU usage: <1% idle, 2-5% during tool execution
- Handles multiple concurrent MCP clients efficiently
- Auto-restart on crash (PM2 mode)

---

## Related Documentation

- [Main README](../README.md) - Full project documentation
- [INSTRUCTIONS.md](INSTRUCTIONS.md) - Development setup guide
- [WFRP4E_SYSTEM_GUIDE.md](WFRP4E_SYSTEM_GUIDE.md) - WFRP4e system details
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

**Last Updated**: May 19, 2026  
**Version**: 0.8.0
