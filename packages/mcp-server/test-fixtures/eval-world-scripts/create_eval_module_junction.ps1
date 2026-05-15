# create_eval_module_junction.ps1
#
# RETIRED 2026-05-13. The parallel Node-Foundry rig is no longer used; evals
# now run against the LIVE desktop Foundry, whose module junction at
# E:\foundry_v13\data\Data\modules\warhammer-mcp is created via the desktop-side
# pattern in .claude/docs/mcp-gotchas.md. This file is preserved for audit trail only.
#
# ---- Original purpose (historical) -------------------------------------------
# Idempotently creates the NTFS directory junction that makes the warhammer-mcp
# Foundry module visible to the parallel Node-Foundry install at E:\foundry_v13_node\.
#
# Source of truth:  D:\foundry-vtt-mcp\packages\foundry-module\
# Junction target:  E:\foundry_v13_node_data\Data\modules\warhammer-mcp
# (dataPath is a sibling of the app dir at E:\foundry_v13_node\ — Node rejects dataPath inside app dir)
#
# Re-running is safe: an existing junction is removed and recreated. An existing
# real directory at the destination is refused (operator must remove manually).

$ErrorActionPreference = 'Stop'

$source      = 'D:\foundry-vtt-mcp\packages\foundry-module'
$modulesRoot = 'E:\foundry_v13_node_data\Data\modules'
$dest        = Join-Path $modulesRoot 'warhammer-mcp'

if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    Write-Error "warhammer-mcp source not found at $source"
    exit 1
}

if (-not (Test-Path -LiteralPath $modulesRoot -PathType Container)) {
    New-Item -ItemType Directory -Path $modulesRoot -Force | Out-Null
}

if (Test-Path -LiteralPath $dest) {
    $item = Get-Item -LiteralPath $dest -Force
    $isJunction = ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -eq [IO.FileAttributes]::ReparsePoint
    if ($isJunction) {
        Remove-Item -LiteralPath $dest -Recurse -Force
    } else {
        Write-Error "destination exists and is not a junction at $dest -- remove manually"
        exit 1
    }
}

New-Item -ItemType Junction -Path $dest -Target $source | Out-Null

$created = Get-Item -LiteralPath $dest -Force
Write-Host "Junction created: $dest"
Write-Host "Target: $($created.Target)"
exit 0
