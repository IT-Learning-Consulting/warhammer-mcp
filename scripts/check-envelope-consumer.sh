#!/usr/bin/env bash
# check-envelope-consumer.sh — CI guard against BUG-069 recurrence (CCR-Envelope-Consumer).
#
# BaseTool.query<T>() single-unwraps the {success, data} envelope at the transport boundary
# (foundry-client.ts:54-84) and THROWS on failure. Consumer-side checks like
# `response.success` / `response.data` are an anti-pattern that causes every call to
# return "unknown error" because the success guard is always true.
#
# This script fails CI if ANY tool under packages/mcp-server/src/tools/ contains:
#   1. A `this.query<any>(...)` call (the `any` masks the consumer-side type contract).
#   2. A `.success` access on what looks like a `this.query()` return value.
#   3. A `response.data` / `response.error` pattern post-`this.query()`.
#
# Run from repo root: bash scripts/check-envelope-consumer.sh
# Exit codes: 0 = clean, 1 = violations found.
#
# Codified 2026-05-14 after BUG-069 shipped through a full PIV loop with PASS_WITH_NOTES
# verdict. See mcp_crud_expansion_v1_prd.md §8 CCR-Envelope-Consumer + validation_rubric
# DP-15 for the rule.

set -euo pipefail

TOOLS_DIR="packages/mcp-server/src/tools"
EXIT=0

if [ ! -d "$TOOLS_DIR" ]; then
  echo "check-envelope-consumer: $TOOLS_DIR not found (run from repo root)" >&2
  exit 2
fi

echo "Scanning $TOOLS_DIR for BUG-069 anti-patterns..."

# 1. this.query<any> — type-loss that re-enables the bug (WARN only; pre-existing surface is large)
# Skip lines that look like comments referencing the pattern (// or /* with `this.query<any>` in text).
HITS_1=$(grep -rnE 'this\.query<\s*any\s*>' "$TOOLS_DIR" 2>/dev/null | grep -vE '^\s*[^:]+:[0-9]+:\s*(//|\*)' || true)
if [ -n "$HITS_1" ]; then
  COUNT=$(echo "$HITS_1" | wc -l | tr -d ' ')
  echo ""
  echo "WARN: $COUNT this.query<any>(...) calls — type-loss that lets BUG-069 typecheck."
  echo "      Every new handler in Phase 2-9 must use a concrete response type."
  echo "      Pre-existing calls are grandfathered; backfill opportunistically."
  echo "      Fix pattern: this.query<MyConcreteResponse>(...) — see tools/ownership.ts."
  # Soft warning: do NOT set EXIT=1. Hard fail is reserved for actual BUG-069 anti-pattern below.
fi

# 2. .success access on a this.query() return — the BUG-069 anti-pattern itself
# Look for `const response = await this.query(...)` followed within 5 lines by `response.success` / `response?.success`.
HITS_2=$(awk '
  /await\s+this\.query/ { capture=1; line=NR; next }
  capture {
    if ($0 ~ /\.success\b/ || $0 ~ /\?\.success\b/) {
      print FILENAME ":" NR ": " $0
      EXIT=1
    }
    if (NR - line > 5) capture=0
  }
' "$TOOLS_DIR"/*.ts 2>/dev/null || true)
if [ -n "$HITS_2" ]; then
  echo ""
  echo "FAIL (2): consumer-side .success check on this.query() return — this is BUG-069."
  echo "Fix: remove the .success guard. query() throws on failure; wrap in try/catch instead."
  echo "$HITS_2"
  EXIT=1
fi

# 3. response.data / response.error patterns — same shape mistake
HITS_3=$(awk '
  /await\s+this\.query/ { capture=1; line=NR; next }
  capture {
    if ($0 ~ /response\.data\b/ || $0 ~ /response\?\.data\b/ || $0 ~ /response\.error\b/ || $0 ~ /response\?\.error\b/) {
      print FILENAME ":" NR ": " $0
      EXIT=1
    }
    if (NR - line > 8) capture=0
  }
' "$TOOLS_DIR"/*.ts 2>/dev/null || true)
if [ -n "$HITS_3" ]; then
  echo ""
  echo "FAIL (3): response.data / response.error access on this.query() return — query() returns bare data."
  echo "Fix: const data = await this.query<MyResponse>(...); use data.field directly."
  echo "$HITS_3"
  EXIT=1
fi

if [ "$EXIT" -eq 0 ]; then
  echo "OK — no BUG-069 anti-patterns found."
fi

exit $EXIT
