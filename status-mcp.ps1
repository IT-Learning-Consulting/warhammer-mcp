#Requires -Version 5.1
<#
.SYNOPSIS
    Shows the current status of the Foundry MCP Backend server.
#>

$ErrorActionPreference = "SilentlyContinue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Foundry MCP Backend - Status" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Lock file / PID
$LockFile = Join-Path $env:TEMP "foundry-mcp-backend.lock"
if (Test-Path $LockFile) {
    $LockPid = Get-Content $LockFile -ErrorAction SilentlyContinue
    Write-Host "Lock file: $LockFile" -ForegroundColor Gray
    Write-Host "  PID:  $LockPid" -ForegroundColor White

    if ($LockPid) {
        $Proc = Get-Process -Id $LockPid -ErrorAction SilentlyContinue
        if ($Proc) {
            $Uptime = (Get-Date) - $Proc.StartTime
            Write-Host "  Status: RUNNING" -ForegroundColor Green
            Write-Host "  Started: $($Proc.StartTime)" -ForegroundColor Gray
            Write-Host "  Uptime:  $([math]::Floor($Uptime.TotalMinutes)) min" -ForegroundColor Gray
            Write-Host "  Memory: $([math]::Round($Proc.WorkingSet64 / 1MB, 1)) MB" -ForegroundColor Gray
        }
        else {
            Write-Host "  Status: DEAD (stale lock)" -ForegroundColor Red
            Write-Host "  Run stop-mcp.bat to clean up." -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "Lock file: not present" -ForegroundColor Yellow
    Write-Host "  Backend may not be running." -ForegroundColor Gray
}

Write-Host ""

# Port bindings
Write-Host "Port bindings:" -ForegroundColor White
foreach ($Port in @(31414, 31415)) {
    $Conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($Conn) {
        Write-Host "  :$Port  LISTENING  (PID $($Conn.OwningProcess))" -ForegroundColor Green
    }
    else {
        Write-Host "  :$Port  not bound" -ForegroundColor Gray
    }
}

Write-Host ""

# Log tail
$LogDir = Join-Path $env:TEMP "foundry-mcp"
$LogPath = Join-Path $LogDir "backend-$(Get-Date -Format 'yyyyMMdd').log"
$ErrPath = Join-Path $LogDir "backend-$(Get-Date -Format 'yyyyMMdd').err.log"
if (Test-Path $LogPath) {
    Write-Host "Log ($LogPath) - last 20 lines:" -ForegroundColor White
    Write-Host "--------------------------------------------" -ForegroundColor DarkGray
    Get-Content -Tail 20 $LogPath | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkCyan }
    Write-Host "--------------------------------------------" -ForegroundColor DarkGray
}
else {
    Write-Host "Log: no log file found for today ($LogPath)" -ForegroundColor Yellow
}

if (Test-Path $ErrPath) {
    $ErrSize = (Get-Item $ErrPath).Length
    if ($ErrSize -gt 0) {
        Write-Host ""
        Write-Host "Stderr ($ErrPath) - $ErrSize bytes, last 20 lines:" -ForegroundColor Yellow
        Write-Host "--------------------------------------------" -ForegroundColor DarkGray
        Get-Content -Tail 20 $ErrPath | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        Write-Host "--------------------------------------------" -ForegroundColor DarkGray
    }
    else {
        Write-Host "Stderr: empty (clean run)" -ForegroundColor Green
    }
}

Write-Host ""
# Read-Host only when interactive (double-clicked from Explorer). Skip when piped/scripted
# so callers like /mcp-server don't hang waiting for stdin.
if ($Host.Name -eq 'ConsoleHost' -and -not [Console]::IsInputRedirected) {
    Read-Host "Press Enter to close"
}
