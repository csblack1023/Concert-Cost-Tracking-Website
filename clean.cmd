@echo off
cd /d "%~dp0"
echo Stopping the dev server first (Ctrl+C in its window) is recommended.
if exist ".next\" (
  echo Removing .next folder...
  rmdir /s /q ".next"
)
if exist "node_modules\.cache\" (
  echo Removing webpack cache...
  rmdir /s /q "node_modules\.cache"
)
echo Done. Double-click dev.cmd or run: dev.cmd
