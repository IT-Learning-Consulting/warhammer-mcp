#Requires -Version 5.1
<#
.SYNOPSIS
    Starts the Foundry MCP Backend server in standalone mode.

.DESCRIPTION
    This script starts the backend server independently of Claude Desktop,
    allowing it to run 24/7 and accept connections from multiple MCP clients.

.PARAMETER Hidden
    Run in background without a visible window (uses Start-Process).

.EXAMPLE
    .\start-backend.ps1
    Starts the backend in the current terminal.

.EXAMPLE
    .\start-backend.ps1 -Hidden
    Starts the backend in the background.
#>

param(
    [switch]$Hidden
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
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
            Write-Host "To stop it: Stop-Process -Id $PID_Content" -ForegroundColor Gray
            exit 0
        }
        else {
            Write-Host "Removing stale lock file..." -ForegroundColor Yellow
            Remove-Item $LockFile -Force
        }
    }
}

# Check if dist exists
$BackendPath = Join-Path $ScriptDir "dist\backend.js"
if (-not (Test-Path $BackendPath)) {
    Write-Host "ERROR: dist\backend.js not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host ""
Write-Host "Ports:" -ForegroundColor White
Write-Host "  - 31414: Control channel (MCP clients)" -ForegroundColor Gray
Write-Host "  - 31415: WebSocket (Foundry VTT)" -ForegroundColor Gray
Write-Host ""

if ($Hidden) {
    Write-Host "Starting in background mode..." -ForegroundColor Yellow
    $Process = Start-Process -FilePath "node" -ArgumentList $BackendPath -WindowStyle Hidden -PassThru
    Write-Host "Backend started with PID: $($Process.Id)" -ForegroundColor Green
    Write-Host ""
    Write-Host "To stop: Stop-Process -Id $($Process.Id)" -ForegroundColor Gray
}
else {
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Start the backend
    & node $BackendPath
    
    Write-Host ""
    Write-Host "Backend stopped." -ForegroundColor Yellow
}
