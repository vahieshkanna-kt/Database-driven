@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo StudentHub - Task 4 Setup and Launcher
echo ========================================
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Install Node.js LTS, then close and reopen this window.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install failed. Check your internet connection.
    pause
    exit /b 1
  )
)
if not exist .env copy .env.example .env >nul
echo.
echo IMPORTANT: MongoDB must be running locally, or configure MongoDB Atlas in the .env file.
echo Default local database: mongodb://127.0.0.1:27017/student_management
echo.
call npm start
pause
