@echo off
echo ==================================
echo    CRM Database Initialization   
echo ==================================

REM Check if .env file exists
if not exist .env (
  echo Error: .env file not found.
  echo Please run start-crm.bat first to create the necessary configuration.
  pause
  exit /b 1
)

echo Loading Supabase schema and seed data...

REM Run database setup scripts
call npx supabase init

REM Check for success
if %errorlevel% neq 0 (
  echo.
  echo Failed to initialize Supabase.
  pause
  exit /b 1
)

echo Creating database tables...
call node ./scripts/setup-db.js

if %errorlevel% neq 0 (
  echo.
  echo Failed to create database tables.
  echo Please check your Supabase credentials in the .env file.
  pause
  exit /b 1
)

echo.
echo =====================================
echo Database initialization complete!
echo You can now run start-crm.bat to start the application.
echo =====================================
pause 