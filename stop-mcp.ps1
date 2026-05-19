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

# Fallback A: port owners on backend ports (precise — :31414 control + :31415 Foundry bridge).
# Only kill node processes; if a non-node process owns the port, skip and report.
$PortOwners = @()
foreach ($port in 31414, 31415) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        if ($c.OwningProcess -and $PortOwners -notcontains $c.OwningProcess) {
            $PortOwners += $c.OwningProcess
        }
    }
}
foreach ($ownerPid in $PortOwners) {
    if ($KilledPids -notcontains $ownerPid) {
        $Proc = Get-Process -Id $ownerPid -ErrorAction SilentlyContinue
        if ($Proc -and $Proc.ProcessName -eq 'node') {
            Stop-Process -Id $ownerPid -Force -ErrorAction SilentlyContinue
            $KilledPids += $ownerPid
            Write-Host "  Killed PID $ownerPid (port owner: 31414/31415)" -ForegroundColor Green
        }
        elseif ($Proc) {
            Write-Host "  Skipped PID $ownerPid on backend port (not node.exe: $($Proc.ProcessName))" -ForegroundColor Yellow
        }
    }
}

# Fallback B: narrow CommandLine match — only the actual backend entrypoint script.
# Replaces the previous overly-broad '*foundry-vtt-mcp*' match which killed unrelated dev processes
# (vitest watch, tsc watch, ad-hoc node invocations) anywhere in the foundry-vtt-mcp repo.
$NodeProcs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -like '*packages\mcp-server\dist\backend.js*' -or
        $_.CommandLine -like '*packages\mcp-server\dist\backend.bundle.cjs*'
    }
foreach ($p in $NodeProcs) {
    if ($KilledPids -notcontains $p.ProcessId) {
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
        $KilledPids += $p.ProcessId
        Write-Host "  Killed PID $($p.ProcessId) (fallback: backend entrypoint CommandLine match)" -ForegroundColor Green
    }
}

Write-Host ""

# Report final port state for both backend ports
$Port31414Bound = $false
foreach ($port in 31414, 31415) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "  Port ${port}: still bound (PIDs: $($conn.OwningProcess -join ', '))" -ForegroundColor Red
        if ($port -eq 31414) { $Port31414Bound = $true }
    }
    else {
        Write-Host "  Port ${port}: free" -ForegroundColor Green
    }
}
if ($Port31414Bound) {
    Write-Host "  Run status-mcp.bat to investigate." -ForegroundColor Yellow
}

if ($KilledPids.Count -eq 0) {
    Write-Host "  No backend processes found." -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "Done. Killed: $($KilledPids -join ', ')" -ForegroundColor Green
}
