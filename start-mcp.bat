@echo off
title Foundry MCP Backend Server
echo ============================================
echo   Foundry MCP Backend - Standalone Mode
echo ============================================
echo.

:: Change to script directory (project root)
cd /d "%~dp0"

:: Check if dist exists
if not exist "packages\mcp-server\dist\backend.js" (
    echo ERROR: packages\mcp-server\dist\backend.js not found!
    echo Please run 'npm run build' first.
    echo.
    pause
    exit /b 1
)

echo Starting backend server...
echo.
echo Ports:
echo   - 31414: Control channel (MCP clients)
echo   - 31415: WebSocket (Foundry VTT)
echo.
echo Press Ctrl+C to stop the server.
echo ============================================
echo.

:: Start the backend from the mcp-server directory
cd packages\mcp-server
node dist\backend.js

:: If we get here, the backend stopped
echo.
echo Backend stopped.
pause
