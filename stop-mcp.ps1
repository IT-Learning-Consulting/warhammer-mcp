#Requires -Version 5.1
<#
.SYNOPSIS
    Stops the Foundry MCP Backend server.
#>

$ErrorActionPreference = "SilentlyContinue"

$LockFile = Join-Path $env:TEMP "foundry-mcp-backend.lock"
$KilledPids = @()

Write-Host "Stopping Foundry MCP Backend..." -ForegroundColor Cyan
Write-Host ""

# Primary: kill by lock file PID
if (Test-Path $LockFile) {
    $LockPid = Get-Content $LockFile -ErrorAction SilentlyContinue
    if ($LockPid) {
        $Proc = Get-Process -Id $LockPid -ErrorAction SilentlyContinue
        if ($Proc) {
            Stop-Process -Id $LockPid -Force -ErrorAction SilentlyContinue
            $KilledPids += $LockPid
            Write-Host "  Killed PID $LockPid (from lock file)" -ForegroundColor Green
        }
        else {
            Write-Host "  Lock file PID $LockPid is already dead" -ForegroundColor Yellow
        }
    }
    Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
    Write-Host "  Lock file removed" -ForegroundColor Gray
}
else {
    Write-Host "  No lock file found" -ForegroundColor Yellow
}

# Fallback: find any node.exe whose CommandLine contains foundry-vtt-mcp
$NodeProcs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*foundry-vtt-mcp*' }
foreach ($p in $NodeProcs) {
    if ($KilledPids -notcontains $p.ProcessId) {
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
        $KilledPids += $p.ProcessId
        Write-Host "  Killed PID $($p.ProcessId) (fallback: CommandLine match)" -ForegroundColor Green
    }
}

Write-Host ""

# Report final port state
$Port31415 = Get-NetTCPConnection -LocalPort 31415 -ErrorAction SilentlyContinue
if ($Port31415) {
    Write-Host "  Port 31415: still bound (PIDs: $($Port31415.OwningProcess -join ', '))" -ForegroundColor Red
    Write-Host "  Run status-mcp.bat to investigate." -ForegroundColor Yellow
}
else {
    Write-Host "  Port 31415: free" -ForegroundColor Green
}

if ($KilledPids.Count -eq 0) {
    Write-Host "  No backend processes found." -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "Done. Killed: $($KilledPids -join ', ')" -ForegroundColor Green
}
