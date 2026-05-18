#Requires -Version 5.1
<#
.SYNOPSIS
    Creates Desktop shortcuts for MCP Start, Stop, and Status.

.DESCRIPTION
    Idempotent — existing shortcuts are overwritten. Run once after cloning.
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')

$Shortcuts = @(
    @{
        Name     = "MCP Start"
        Target   = Join-Path $ScriptDir "start-mcp.bat"
        Icon     = "imageres.dll,156"    # green play-style icon
        Desc     = "Start Foundry MCP Backend"
    },
    @{
        Name     = "MCP Stop"
        Target   = Join-Path $ScriptDir "stop-mcp.bat"
        Icon     = "imageres.dll,100"    # red stop-style icon
        Desc     = "Stop Foundry MCP Backend"
    },
    @{
        Name     = "MCP Status"
        Target   = Join-Path $ScriptDir "status-mcp.bat"
        Icon     = "imageres.dll,77"     # info icon
        Desc     = "Show Foundry MCP Backend status"
    }
)

foreach ($s in $Shortcuts) {
    $LnkPath = Join-Path $Desktop "$($s.Name).lnk"
    $Shortcut = $WshShell.CreateShortcut($LnkPath)
    $Shortcut.TargetPath = $s.Target
    $Shortcut.WorkingDirectory = $ScriptDir
    $Shortcut.IconLocation = $s.Icon
    $Shortcut.Description = $s.Desc
    $Shortcut.Save()
    Write-Host "Created: $LnkPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Desktop shortcuts installed." -ForegroundColor Cyan
