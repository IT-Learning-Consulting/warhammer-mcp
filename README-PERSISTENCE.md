# Foundry MCP Backend — Persistence Runbook

## 1. What this is

The MCP backend (`packages/mcp-server/dist/backend.js`) is now a long-lived OS process that runs independently of Claude Code. You control it via double-click scripts. Claude Code reconnects to the running backend on each restart without spawning a new one — no more zombie cascades.

## 2. Daily use

1. **Start the backend** — double-click `mcp-start.bat` (vault root or `D:\foundry-vtt-mcp\`). A hidden Node process starts and logs to `%TEMP%\foundry-mcp\backend-YYYYMMDD.log`.
2. **Work normally** — open Claude Code, open Foundry. Close and reopen Claude Code as many times as you like; the backend keeps running.
3. **Stop the backend** — double-click `mcp-stop.bat` when you're done for the day (or just leave it running — it's lightweight).

The backend does **not** auto-start on Windows reboot by design. Just click `mcp-start.bat` at the start of each session.

## 3. Pinning to taskbar / Desktop shortcuts

**Option A — Desktop shortcuts (recommended):**

Run once:

```powershell
powershell -ExecutionPolicy Bypass -File "D:\foundry-vtt-mcp\install-shortcuts.ps1"
```

This creates `MCP Start`, `MCP Stop`, and `MCP Status` shortcuts on your Desktop.

**Option B — Pin to Start menu:**

Right-click `mcp-start.bat` → "Pin to Start".

**Option C — Taskbar via shortcut:**

Right-click the `MCP Start` Desktop shortcut → "Pin to taskbar".

## 4. Log location

Logs are written to:

```
%TEMP%\foundry-mcp\backend-YYYYMMDD.log
```

Tail the current day's log in PowerShell:

```powershell
Get-Content -Tail 50 -Wait "$env:TEMP\foundry-mcp\backend-$(Get-Date -Format 'yyyyMMdd').log"
```

Logs rotate daily (one file per day). Old logs are in the same `%TEMP%\foundry-mcp\` folder.

## 5. Troubleshooting

### "Backend won't start"

1. Run `status-mcp.bat` — if PID shows RUNNING, it's already up (click the Start button again to get the "already running" message with the current PID).
2. If `dist\backend.js not found` error — run `npm run build` in `D:\foundry-vtt-mcp\packages\mcp-server`.
3. Check the log: `Get-Content -Tail 50 "$env:TEMP\foundry-mcp\backend-$(Get-Date -Format 'yyyyMMdd').log"`.

### "Foundry says MCP disconnected"

1. Check `status-mcp.bat` — is the backend alive? Ports 31414 and 31415 should show LISTENING.
2. If backend is dead: click `mcp-start.bat`. Foundry's reconnect logic (RECONNECT_ATTEMPTS=999) will pick it up within ~30 seconds — no world reload needed.
3. If backend is alive but Foundry still shows disconnected: reload the Foundry world (F5 in the browser).

### "Want to see what the backend is doing"

```powershell
# Tail the live log
Get-Content -Tail 50 -Wait "$env:TEMP\foundry-mcp\backend-$(Get-Date -Format 'yyyyMMdd').log"

# Or run in foreground mode (Ctrl+C to stop)
powershell -ExecutionPolicy Bypass -File "D:\foundry-vtt-mcp\start-mcp.ps1" -Foreground
```

### "Port 31415 still bound after stop"

A stale process is holding the port. Run:

```powershell
Get-NetTCPConnection -LocalPort 31415 | Select-Object OwningProcess
Stop-Process -Id <OwningProcess> -Force
```
