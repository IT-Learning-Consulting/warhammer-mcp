@call "%~dp0stop-mcp.bat"
@rem 2-second pause for ports to release. ping is used because timeout.exe rejects
@rem stdin-redirected callers ("Input redirection is not supported") which happens when
@rem the script is invoked via `cmd /c` from a non-interactive shell. ping has no such
@rem requirement and works identically when double-clicked or piped.
@%SystemRoot%\System32\ping.exe -n 3 127.0.0.1 >nul
@call "%~dp0start-mcp.bat" %*
