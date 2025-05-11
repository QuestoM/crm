@echo off
echo Cleaning up project for production deployment...

REM Delete temporary and development files
echo Removing temporary and development files...
if exist src\SimpleApp.tsx del src\SimpleApp.tsx
if exist src\index.tsx.bak del src\index.tsx.bak
if exist simple-start.bat del simple-start.bat
if exist start-crm.bat del start-crm.bat

REM Keep only the production launch script
if exist start-production.bat (
  echo Renaming production script to start.bat...
  copy start-production.bat start.bat
  del start-production.bat
)

REM Clean up node_modules for production
echo Optimizing node_modules for production...
call npm prune --production

REM Create a production-ready README
echo Creating production README...
echo # Water Filter CRM> README.md
echo.>> README.md
echo A comprehensive CRM system for water filter business with Hebrew language support.>> README.md
echo.>> README.md
echo ## Features>> README.md
echo.>> README.md
echo - Customer management>> README.md
echo - Lead tracking and conversion>> README.md
echo - Product catalog>> README.md
echo - Order management>> README.md
echo - Inventory tracking>> README.md
echo - Warranty management>> README.md
echo.>> README.md
echo ## Getting Started>> README.md
echo.>> README.md
echo 1. Run `start.bat` to launch the application>> README.md
echo 2. Application will connect to Supabase automatically>> README.md
echo.>> README.md
echo ## System Requirements>> README.md
echo.>> README.md
echo - Windows 10 or newer>> README.md
echo - Node.js 14 or newer>> README.md

echo Cleanup complete - CRM is ready for production!
pause 