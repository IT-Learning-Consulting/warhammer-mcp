# Warhammer MCP

MCP server + Foundry VTT module that lets MCP-capable AI clients interact with a Foundry world.

This repo is **WFRP4e-focused** (Warhammer Fantasy Roleplay 4e) and ships a Foundry module named **Warhammer MCP** (`id: warhammer-mcp`).

> **Lineage.** Originally derived from [`adambdooley/foundry-vtt-mcp`](https://github.com/adambdooley/foundry-vtt-mcp) (MIT). The two histories share a merge base (`45b8af2`) but have run in parallel since the split — there are zero merged upstream commits in this codebase. Treat it as a sibling project, not an active fork. Differences from upstream: WFRP4e-only (D&D5e / PF2e / DSA5 / Cosmere removed), dedicated `handlers/` layer in the Foundry module, umbrella/action tool pattern, unified `notify.ts` GM-feedback channel, `cross-doc-fk` audit + repair, persistence runbook, multi-client configs, skills harness. ComfyUI map-generation and WebRTC transport are not present.

- Version: see `package.json` / `docs/CHANGELOG.md`
- Foundry compatibility: v13 only (pinned)

---

## How it works

```
MCP Client (Claude Desktop / Claude Code / VS Code / etc.)
  └─ stdio → packages/mcp-server/dist/index.js   (MCP wrapper)
        └─ TCP 31414 → packages/mcp-server/dist/backend.js  (backend)
              └─ WebSocket 31415 → Foundry module (in browser)
```

**Ports**

- `31414` — MCP tool calls (client → backend)
- `31415` — Foundry browser module bridge (Foundry → backend)

---

## Quick start (from source)

### 1) Install & build

```bash
npm install
npm run build
```

### 2) Install the Foundry module

You need the module available under your Foundry data folder, e.g.:

```
<Foundry Data>/Data/modules/warhammer-mcp/
```

For local development, this repo includes a simple deploy script:

```bash
npm run build:deploy
```

`npm run build:deploy` uses `scripts/deploy-foundry.js`, which currently has a hard-coded target path. If your Foundry data folder is different, edit `scripts/deploy-foundry.js` (or copy the module folder manually).

After deploying, reload the Foundry page (F5) and enable **Warhammer MCP** in your world.

### 3) Start the backend

You have two common options:

**Option A — Client-spawned (most MCP clients)**

- Configure your MCP client to run `node <repo>/packages/mcp-server/dist/index.js`.
- The wrapper will spawn/attach to the backend automatically.

**Option B — Standalone (recommended for always-on / multi-client)**

- Windows convenience scripts in the repo root:
  - `start-mcp.bat` / `start-mcp.ps1`
  - `stop-mcp.bat` / `stop-mcp.ps1`
  - `status-mcp.bat` / `status-mcp.ps1`

See `README-PERSISTENCE.md` for the persistence runbook (logs, shortcuts, troubleshooting).

---

## MCP client configuration

This repo includes ready-to-copy config snippets for multiple clients:

- `claude_desktop_config.example.json` (Claude Desktop)
- `configs/clients/*` (Claude Code, VS Code Copilot, Codex, Gemini)

Start here:

- `configs/clients/README.md`

**Verification**

Once connected, try calling the world probe tool:

- `mcp__foundry-mcp__get-world-info`

---

## Tool surface (post-consolidation)

The API surface is intentionally consolidated: **96 tools** implemented as action-based “umbrella” tools (e.g. `manage-character`, `journal`, `rolltable`, `scene`, etc.) — **75 core** WFRP4e/Foundry tools plus **21 conditional `module-*`** integrations that register only when the matching third-party module is active.

Authoritative list and architecture notes live in:

- `docs/INSTRUCTIONS.md`
- `docs/CHANGELOG.md`
- `docs/TOOL_CONSOLIDATION_PLAN_2.md`

---

## Repo layout

```
packages/
  mcp-server/        MCP wrapper + backend (Node)
  foundry-module/    Foundry VTT module (browser)
shared/              Shared TS types/schemas
configs/clients/      MCP client config snippets
docs/                 Dev notes + system guide
tests/                Vitest tests (skills harness)
test/                 Manual test suite docs
```

Key entrypoints:

- `packages/mcp-server/dist/index.js` — MCP stdio wrapper (what clients execute)
- `packages/mcp-server/dist/backend.js` — backend process (standalone / persistent)

---

## Development

### Common commands

```bash
npm run build
npm run build:deploy
npm run test
npm run test:skills
npm run lint
npm run typecheck
```

### After making changes

- Foundry module changes: `npm run build:deploy` → reload Foundry (F5)
- MCP server changes: `npm run build` → restart your MCP client (or restart the standalone backend)

More details:

- `docs/INSTRUCTIONS.md`

---

## License & Credits

MIT — see `LICENSE`.

Originally derived from [`adambdooley/foundry-vtt-mcp`](https://github.com/adambdooley/foundry-vtt-mcp) (Adam Dooley, MIT). Upstream credit retained in `package.json` `contributors`.
