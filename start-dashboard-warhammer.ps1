$PLUGIN_DASHBOARD = "C:\Users\danil0\.claude\plugins\cache\understand-anything\understand-anything\2.7.4\packages\dashboard"
$PROJECT_ROOT    = "E:\warhammer_system"   # change this to whatever folder you analyzed

$env:GRAPH_DIR    = $PROJECT_ROOT
$env:NODE_OPTIONS = "--use-system-ca"

Set-Location $PLUGIN_DASHBOARD

Write-Host "Starting knowledge-graph dashboard for $PROJECT_ROOT ..."
Write-Host "Press Ctrl+C to stop.`n"

& npx vite --host 127.0.0.1 | ForEach-Object {
    Write-Host $_
    if ($_ -match 'token=([a-f0-9]+)') {
        $url = "http://127.0.0.1:5173/?token=$($Matches[1])"
        Start-Process $url
    }
}
