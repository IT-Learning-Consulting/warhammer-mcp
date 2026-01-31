@echo off
title Foundry MCP Backend Server
echo ============================================
echo   Foundry MCP Backend - Standalone Mode
echo ============================================
echo.

:: Change to script directory
cd /d "%~dp0"

:: Check if lock file exists with stale process
set "LOCKFILE=%TEMP%\foundry-mcp-backend.lock"
if exist "%LOCKFILE%" (
    set /p PID=<"%LOCKFILE%"
    tasklist /FI "PID eq %PID%" 2>nul | find "%PID%" >nul
    if errorlevel 1 (
        echo Removing stale lock file...
        del "%LOCKFILE%" 2>nul
    ) else (
        echo Backend already running with PID %PID%
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 0
    )
)

:: Check if dist exists
if not exist "dist\backend.js" (
    echo ERROR: dist\backend.js not found!
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

:: Start the backend
node dist\backend.js

:: If we get here, the backend stopped
echo.
echo Backend stopped.
pause
