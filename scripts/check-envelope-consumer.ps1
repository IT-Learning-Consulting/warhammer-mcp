# check-envelope-consumer.ps1 — PowerShell port of check-envelope-consumer.sh for Windows CI.
# See the .sh sibling for the full rationale (BUG-069 / CCR-Envelope-Consumer / DP-15).

$ErrorActionPreference = "Stop"
$ToolsDir = "packages/mcp-server/src/tools"
$ExitCode = 0

if (-not (Test-Path $ToolsDir)) {
  Write-Error "check-envelope-consumer: $ToolsDir not found (run from repo root)"
  exit 2
}

Write-Host "Scanning $ToolsDir for BUG-069 anti-patterns..."

# 1. this.query<any> — WARN only (pre-existing surface is large; grandfathered for now)
# Skip comment lines (// or *) that reference the pattern textually.
$hits1 = Get-ChildItem -Path $ToolsDir -Filter *.ts -Recurse |
  Select-String -Pattern 'this\.query<\s*any\s*>' |
  Where-Object { $_.Line -notmatch '^\s*(//|\*)' }
if ($hits1) {
  $count = $hits1.Count
  Write-Host ""
  Write-Host "WARN: $count this.query<any>(...) calls — type-loss that lets BUG-069 typecheck."
  Write-Host "      Every new handler in Phase 2-9 must use a concrete response type."
  Write-Host "      Pre-existing calls are grandfathered; backfill opportunistically."
  Write-Host "      Fix pattern: this.query<MyConcreteResponse>(...) — see tools/ownership.ts."
  # Soft warning: do NOT set ExitCode. Hard fail is reserved for actual BUG-069 anti-pattern below.
}

# 2 & 3. .success / .data / .error access within ~5-8 lines after `await this.query(...)`
Get-ChildItem -Path $ToolsDir -Filter *.ts -Recurse | ForEach-Object {
  $file = $_.FullName
  $lines = Get-Content $file
  $capture = $false
  $captureLine = 0
  for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1
    if ($line -match 'await\s+this\.query') {
      $capture = $true
      $captureLine = $lineNum
      continue
    }
    if ($capture) {
      if ($lineNum - $captureLine -gt 8) { $capture = $false; continue }
      if ($line -match '\.success\b' -or $line -match '\?\.success\b') {
        Write-Host "FAIL (2 — .success): ${file}:${lineNum}: $line"
        $script:ExitCode = 1
      }
      if ($line -match 'response\.data\b' -or $line -match 'response\?\.data\b' -or
          $line -match 'response\.error\b' -or $line -match 'response\?\.error\b') {
        Write-Host "FAIL (3 — response.data/error): ${file}:${lineNum}: $line"
        $script:ExitCode = 1
      }
    }
  }
}

if ($ExitCode -eq 0) {
  Write-Host "OK — no BUG-069 anti-patterns found."
}

exit $ExitCode
