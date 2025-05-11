@echo off
setlocal enabledelayedexpansion

echo ==================================
echo   Water Filter CRM Installation  
echo ==================================

REM Check for Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Error: Node.js is not installed or not in PATH.
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
  set node_major=%%a
  set node_major=!node_major:~1!
)

if !node_major! lss 14 (
  echo Warning: Node.js version !node_major! detected.
  echo This application requires Node.js 14 or higher.
  echo Current version: 
  node -v
  
  set /p continue="Continue anyway? (y/n): "
  if /i "!continue!" neq "y" (
    echo Installation aborted.
    pause
    exit /b 1
  )
)

REM Create directory structure if not exists
if not exist "scripts" mkdir scripts

REM Create necessary files
echo Generating package.json...
echo {> package.json
echo   "name": "water-filter-crm",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "private": true,>> package.json
echo   "dependencies": {>> package.json
echo     "@supabase/supabase-js": "^2.21.0",>> package.json
echo     "dotenv": "^16.0.3",>> package.json
echo     "react": "^18.2.0",>> package.json
echo     "react-dom": "^18.2.0",>> package.json
echo     "react-router-dom": "^6.10.0",>> package.json
echo     "tailwindcss": "^3.3.2">> package.json
echo   },>> package.json
echo   "scripts": {>> package.json
echo     "start": "react-scripts start",>> package.json
echo     "build": "react-scripts build",>> package.json
echo     "test": "react-scripts test",>> package.json
echo     "eject": "react-scripts eject",>> package.json
echo     "setup-db": "node ./scripts/setup-db.js">> package.json
echo   },>> package.json
echo   "eslintConfig": {>> package.json
echo     "extends": [>> package.json
echo       "react-app">> package.json
echo     ]>> package.json
echo   },>> package.json
echo   "browserslist": {>> package.json
echo     "production": [>> package.json
echo       ">0.2%%",>> package.json
echo       "not dead",>> package.json
echo       "not op_mini all">> package.json
echo     ],>> package.json
echo     "development": [>> package.json
echo       "last 1 chrome version",>> package.json
echo       "last 1 firefox version",>> package.json
echo       "last 1 safari version">> package.json
echo     ]>> package.json
echo   }>> package.json
echo }>> package.json

REM Create .env file
echo Creating .env file...
echo REACT_APP_SUPABASE_URL=https://your-supabase-url.supabase.co> .env
echo REACT_APP_SUPABASE_ANON_KEY=your-anon-key>> .env

echo.
echo =====================================
echo Please update the Supabase credentials in .env file before proceeding!
echo =====================================
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
  echo Failed to install dependencies. Please check your npm installation.
  pause
  exit /b 1
)

REM Ask if user wants to set up the database
set /p setup_db="Do you want to set up the database with sample data? (y/n): "
if /i "%setup_db%"=="y" (
  echo Setting up database...
  call npm run setup-db
  
  if %errorlevel% neq 0 (
    echo.
    echo Database setup failed. Please check your Supabase credentials and try again.
    pause
    exit /b 1
  )
)

echo.
echo ============================================
echo Installation completed successfully!
echo.
echo To start the application, run:
echo   start-crm.bat
echo ============================================
pause 