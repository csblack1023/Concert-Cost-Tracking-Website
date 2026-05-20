@echo off
REM Install packages (uses npm.cmd — avoids PowerShell script blocking)
cd /d "%~dp0"
call "%ProgramFiles%\nodejs\npm.cmd" install
if errorlevel 1 (
  echo Install failed.
  exit /b 1
)
echo Done. Run dev.cmd or: npm.cmd run dev
