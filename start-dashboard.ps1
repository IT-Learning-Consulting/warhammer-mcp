param(
    [string]$ProjectRoot = $PSScriptRoot
)

$PLUGIN_DASHBOARD = "C:\Users\danil0\.claude\plugins\cache\understand-anything\understand-anything\2.7.4\packages\dashboard"

$env:GRAPH_DIR    = $ProjectRoot
$env:NODE_OPTIONS = "--use-system-ca"

Set-Location $PLUGIN_DASHBOARD

Write-Host "Starting knowledge-graph dashboard for $ProjectRoot ..."
Write-Host "Press Ctrl+C to stop.`n"

& npx vite --host 127.0.0.1 | ForEach-Object {
    Write-Host $_
    if ($_ -match 'token=([a-f0-9]+)') {
        $url = "http://127.0.0.1:5173/?token=$($Matches[1])"
        Start-Process $url
    }
}
