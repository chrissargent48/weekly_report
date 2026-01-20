@echo off
setlocal

TITLE Weekly Report Builder Launcher
COLOR 0A

echo ===================================================
echo   WEEKLY REPORT BUILDER - LAUNCHER
echo ===================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    COLOR 0C
    echo Error: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b
)

:: Install modules if missing
if not exist "node_modules\" (
    echo [1/2] Installing dependencies [First run only]...
    call npm install
) else (
    echo [1/2] Dependencies already installed.
)

:: Start App
echo.
echo [2/2] Starting application...
echo.
echo ---------------------------------------------------
echo  DO NOT CLOSE THIS WINDOW
echo  Minimizing is fine.
echo  App is correctly running if you see "VITE v6.x.x".
echo ---------------------------------------------------
echo.

:: Run Monorepo (Server + Client)
call npm start
