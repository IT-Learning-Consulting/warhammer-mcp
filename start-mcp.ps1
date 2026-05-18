#Requires -Version 5.1
<#
.SYNOPSIS
    Starts the Foundry MCP Backend server in background (hidden) mode by default.

.DESCRIPTION
    Starts the backend server independently of Claude Code, writing stdout/stderr to a
    dated log file at %TEMP%\foundry-mcp\backend-YYYYMMDD.log. The process survives
    Claude Code restarts and window closes.

    Use -Foreground to run interactively in the current terminal (useful for debugging).

.PARAMETER Foreground
    Run in the current terminal instead of hidden background mode.

.EXAMPLE
    .\start-mcp.ps1
    Starts the backend hidden with logging to %TEMP%\foundry-mcp\backend-YYYYMMDD.log.

.EXAMPLE
    .\start-mcp.ps1 -Foreground
    Starts the backend in the current terminal (Ctrl+C to stop).
#>

param(
    [switch]$Foreground
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$McpServerDir = Join-Path $ScriptDir "packages\mcp-server"
Set-Location $ScriptDir

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Foundry MCP Backend - Standalone Mode" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check for stale lock file
$LockFile = Join-Path $env:TEMP "foundry-mcp-backend.lock"
if (Test-Path $LockFile) {
    $PID_Content = Get-Content $LockFile -ErrorAction SilentlyContinue
    if ($PID_Content) {
        $ExistingProcess = Get-Process -Id $PID_Content -ErrorAction SilentlyContinue
        if ($ExistingProcess) {
            Write-Host "Backend already running with PID $PID_Content" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "To stop: Stop-Process -Id $PID_Content -Force" -ForegroundColor Gray
            Write-Host "Or double-click: stop-mcp.bat" -ForegroundColor Gray
            exit 0
        }
        else {
            Write-Host "Removing stale lock file (dead PID $PID_Content)..." -ForegroundColor Yellow
            Remove-Item $LockFile -Force
        }
    }
}

# Check if dist exists
$BackendPath = Join-Path $McpServerDir "dist\backend.js"
if (-not (Test-Path $BackendPath)) {
    Write-Host "ERROR: dist\backend.js not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build' in packages\mcp-server first." -ForegroundColor Yellow
    exit 1
}

# Change to mcp-server directory so relative paths in backend work correctly
Set-Location $McpServerDir

if ($Foreground) {
    Write-Host "Starting in foreground mode (Ctrl+C to stop)..." -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    & node $BackendPath
    Write-Host ""
    Write-Host "Backend stopped." -ForegroundColor Yellow
}
else {
    # Ensure log directory exists
    $LogDir = Join-Path $env:TEMP "foundry-mcp"
    if (-not (Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir | Out-Null
    }
    $LogPath = Join-Path $LogDir "backend-$(Get-Date -Format 'yyyyMMdd').log"
    $ErrPath = Join-Path $LogDir "backend-$(Get-Date -Format 'yyyyMMdd').err.log"

    Write-Host "Starting in background mode..." -ForegroundColor Green
    # Start-Process rejects -RedirectStandardOutput and -RedirectStandardError pointing at
    # the same file. Use two separate paths; stderr is typically empty for a clean run.
    $Process = Start-Process `
        -FilePath "node" `
        -ArgumentList $BackendPath `
        -WindowStyle Hidden `
        -RedirectStandardOutput $LogPath `
        -RedirectStandardError $ErrPath `
        -PassThru

    Write-Host ""
    Write-Host "Backend started." -ForegroundColor Green
    Write-Host "  PID:    $($Process.Id)" -ForegroundColor White
    Write-Host "  stdout: $LogPath" -ForegroundColor Gray
    Write-Host "  stderr: $ErrPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To stop:    Stop-Process -Id $($Process.Id) -Force" -ForegroundColor Gray
    Write-Host "Or:         double-click stop-mcp.bat" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Tail log:   Get-Content -Tail 50 -Wait `"$LogPath`"" -ForegroundColor Gray
    Write-Host "Tail err:   Get-Content -Tail 50 -Wait `"$ErrPath`"" -ForegroundColor Gray
}
