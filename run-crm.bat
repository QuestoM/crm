@echo off
chcp 65001 > nul
echo ===============================================
echo   WATER FILTER CRM SYSTEM
echo ===============================================
echo.

echo [1/4] Checking for build\index.html...
if exist "build\index.html" (
  echo Found build\index.html
  echo Opening dynamic CRM page with Supabase integration...
  start "" "build\index.html"
  echo CRM launched successfully!
  goto END
) else (
  echo build\index.html not found. Trying next option...
)

echo [2/4] Checking for build\crm.html...
if exist "build\crm.html" (
  echo Found build\crm.html
  echo Opening static CRM page...
  start "" "build\crm.html"
  echo CRM launched successfully!
  goto END
) else (
  echo build\crm.html not found. Trying next option...
)

echo [3/4] Checking for Python to serve build directory...
where python >nul 2>nul
if %errorlevel% equ 0 (
  if exist "build" (
    echo Found Python and build directory
    echo Starting Python server to serve CRM...
    start "" http://localhost:3000
    cd build
    python -m http.server 3000
    goto END
  )
)

echo [4/4] All automatic options failed.
echo.
echo Checking available files:
echo.
if exist "build" (
  echo Files in build directory:
  dir /b build
) else (
  echo build directory not found!
)

echo.
echo For assistance, please contact support or run setup script.

:END
pause 