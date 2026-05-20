@echo off
title Concert Cost Tracker - Dev Server
cd /d "%~dp0"

if not exist "node_modules\" (
  echo Installing dependencies...
  call "%ProgramFiles%\nodejs\npm.cmd" install
  if errorlevel 1 goto :failed
)

if not exist ".env.local" (
  echo.
  echo WARNING: .env.local is missing.
  echo Copy .env.local.example to .env.local and add your Supabase keys.
  echo.
)

REM Another dev server still running will break if we delete .next
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo.
  echo ERROR: Port 3000 is already in use.
  echo Stop the other dev server with Ctrl+C in its window, then run dev.cmd again.
  echo Or run restart-dev.cmd to stop port 3000 and start fresh.
  echo.
  pause
  exit /b 1
)

REM Stale production build in .next breaks dev mode
if exist ".next\BUILD_ID" (
  echo Clearing production build cache...
  rmdir /s /q ".next" 2>nul
  if exist "node_modules\.cache\" rmdir /s /q "node_modules\.cache" 2>nul
)

echo.
echo ============================================================
echo   Concert Cost Tracker - local dev server
echo   URL:  http://localhost:3000
echo   Login: http://localhost:3000/login
echo.
echo   KEEP THIS WINDOW OPEN while you use the app.
echo   First start can take 1-2 minutes to compile.
echo   Do NOT run "npm run build" while this window is open.
echo ============================================================
echo.

start /min cmd /c "timeout /t 25 /nobreak >nul && start http://localhost:3000/login"

call node_modules\.bin\next.cmd dev -p 3000
if errorlevel 1 goto :failed
exit /b 0

:failed
echo.
echo Dev server failed. Run restart-dev.cmd or: clean.cmd then dev.cmd
echo.
pause
exit /b 1
