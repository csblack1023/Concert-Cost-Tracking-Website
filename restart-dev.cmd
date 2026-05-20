@echo off
title Restart Concert Cost Tracker
cd /d "%~dp0"

echo.
echo === Stopping dev servers on ports 3000-3010 ===
for %%p in (3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p" ^| findstr "LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)

timeout /t 2 /nobreak >nul

echo === Clearing cache ===
if exist ".next\" rmdir /s /q ".next"
if exist "node_modules\.cache\" rmdir /s /q "node_modules\.cache"

echo === Starting dev server ===
call node_modules\.bin\next.cmd dev -p 3000
