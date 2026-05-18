# Client config snippets

All clients connect to the **same** Foundry MCP backend on `127.0.0.1:31414` via the same stdio wrapper at `packages/mcp-server/dist/index.js`. First client to start auto-spawns the backend; subsequent clients attach to the running backend (singleton lock, see `backend.ts`).

You can run Claude Code, Copilot-in-VSCode, Codex, and Gemini at the same time against one Foundry world.

## Prerequisites

1. Foundry VTT is running with the `warhammer-mcp` module enabled (listens on `:31415`).
2. The MCP server has been built: `cd packages/mcp-server && npm run build` → `dist/index.js` exists.
3. The path in each snippet (`D:/foundry-vtt-mcp/...`) matches where this repo lives on your machine. Edit it if you cloned somewhere else.

## Per-client install

### Claude Code

File: `claude-code.mcp.json` → copy into the **project root** of any project as `.mcp.json`. Restart Claude Code; tools appear under `mcp__foundry-mcp__*`.

### GitHub Copilot in VS Code

File: `vscode-copilot.mcp.json` → copy into any workspace as `.vscode/mcp.json`. Open VS Code, run "MCP: Start Server" or reload the window. Requires Copilot Chat with MCP support enabled.

### Codex CLI

File: `codex.toml` → append its contents to `~/.codex/config.toml` (Windows: `%USERPROFILE%\.codex\config.toml`). Restart Codex.

### Gemini CLI

File: `gemini-cli.json` → merge its `mcpServers` block into `~/.gemini/settings.json` (Windows: `%USERPROFILE%\.gemini\settings.json`). Restart Gemini CLI.

### Claude Desktop

The repo root already has `claude_desktop_config.example.json` for this; same shape as `claude-code.mcp.json`. Merge into `%APPDATA%\Claude\claude_desktop_config.json`.

## Verification

After connecting any client, ask it to list tools or call `mcp__foundry-mcp__get-world-info`. If the backend is up, you'll see the world title come back.

The backend logs to `%TEMP%\foundry-mcp-server\mcp-server.log`; the stdio wrapper logs to `%TEMP%\foundry-mcp-server\wrapper.log`. Either log tells you which client connected and when.

## Caveats

- **Schema cache** — Claude Code caches MCP tool schemas at session start. After rebuilding `mcp-server`, restart the client. Foundry-module rebuilds require a world reload, not a client restart.
- **Codex / Gemini config format churn** — their MCP config syntax has changed once or twice; if these snippets don't load, check the current docs and adjust the top-level key name. The `command`/`args`/`env` payload is stable.
- **One Foundry world** — the backend binds to a single Foundry instance on `:31415`. If you run two Foundry worlds simultaneously, only the first to register on that port is reachable.
