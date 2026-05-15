# start_eval_foundry.ps1
#
# RETIRED 2026-05-13. The parallel Node-Foundry rig is no longer used; evals
# now run against the LIVE desktop Foundry on port 31415 with the warhammer-mcp
# module enabled on adventures-in-the-warhammer-world. See stability_anchors.md
# for the current runbook. This file is preserved for audit trail only.
#
# ---- Original purpose (historical) -------------------------------------------
# Launches the parallel Node-Foundry instance used for eval runs.
# Foreground by default; -Background spawns and returns the PID.
#
# Install path:    E:\foundry_v13_node\           (app dir; node main.mjs lives here)
# Data path:       E:\foundry_v13_node_data\      (sibling of install — Node rejects dataPath inside app dir)
# HTTP port:       30001
# Websocket port:  31415 (warhammer-mcp -- unaffected by this script; HC-5)

[CmdletBinding()]
param(
    [switch]$Background
)

$ErrorActionPreference = 'Stop'

$entry    = 'E:\foundry_v13_node\main.mjs'
$dataPath = 'E:\foundry_v13_node_data'
$port     = 30001

if (-not (Test-Path -LiteralPath $entry -PathType Leaf)) {
    Write-Error "Node Foundry not installed at E:\foundry_v13_node -- see runbook `§One-time setup"
    exit 1
}

$nodeArgs = @($entry, "--dataPath=$dataPath", "--port=$port")

if ($Background) {
    $proc = Start-Process -FilePath 'node' -ArgumentList $nodeArgs -NoNewWindow -PassThru
    Write-Host "Started: PID=$($proc.Id), port=$port"
    Write-Host "Browse to http://localhost:$port to continue setup / load Eval World"
    exit 0
} else {
    Write-Host "Browse to http://localhost:$port to continue setup / load Eval World"
    & node @nodeArgs
    exit $LASTEXITCODE
}
