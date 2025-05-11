@echo off
echo ===========================================
echo Git Setup and GitHub Publishing Tool
echo ===========================================
echo.

REM Check if date-fns is installed
echo Checking dependencies...
call npm list date-fns || (
  echo Installing required dependencies...
  call npm install date-fns --save
  echo Dependencies installed successfully.
)
echo.

REM Check if .git directory exists
if not exist ".git" (
  echo Git repository not initialized. Setting up Git...
  
  REM Initialize Git repository
  git init
  echo Git repository initialized.
  echo.
  
  REM Setup Git user if not already configured
  git config --get user.name >nul 2>&1
  if %ERRORLEVEL% NEQ 0 (
    echo Setting up Git user configuration...
    set /p GIT_NAME="Enter your name for Git: "
    set /p GIT_EMAIL="Enter your email for Git: "
    git config --local user.name "%GIT_NAME%"
    git config --local user.email "%GIT_EMAIL%"
    echo Git user configured.
    echo.
  )
  
  REM Setup remote origin
  echo Please provide your GitHub repository information.
  set /p REPO_URL="Enter GitHub repository URL (e.g., https://github.com/username/repo.git): "
  git remote add origin %REPO_URL%
  
  REM Initial commit if needed
  git add .
  git commit -m "Initial commit"
  echo.
  echo Git repository is now set up and ready.
) else (
  echo Git repository already initialized.
)
echo.

REM Check if remote origin is set
git remote -v | findstr "origin" >nul
if %ERRORLEVEL% NEQ 0 (
  echo Remote origin not set. Please provide your GitHub repository information.
  set /p REPO_URL="Enter GitHub repository URL (e.g., https://github.com/username/repo.git): "
  git remote add origin %REPO_URL%
  echo Remote origin added.
)
echo.

REM Run the publishing script
echo Running GitHub publishing script...
node publish-to-github.js

pause 