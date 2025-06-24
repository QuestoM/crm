@echo off
echo ===========================================
echo Git Setup and GitHub Publishing Tool (with build folder)
echo ===========================================
echo.

REM Ensure build directory is not ignored
echo Making sure build directory is not ignored by git...
findstr /v /c:"/build" .gitignore > .gitignore.temp 2>nul
if %ERRORLEVEL% EQU 0 (
  move /y .gitignore.temp .gitignore
  echo # /build  # Commented out to include build directory >> .gitignore
  echo Build directory will be included in git.
) else (
  echo Build directory already configured in .gitignore.
)
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
  
  REM Test repository connection
  echo Testing connection to the repository...
  git ls-remote --exit-code %REPO_URL% >nul 2>&1
  if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ WARNING: Cannot connect to the repository at %REPO_URL%
    echo Please check if the repository exists and you have access to it.
    echo.
    echo Would you like to:
    echo 1. Continue anyway
    echo 2. Try a different URL
    echo 3. Exit and run fix-github-remote.bat later
    set /p REPO_CHOICE="Enter your choice (1-3): "
    
    if "%REPO_CHOICE%"=="2" (
      git remote remove origin
      set /p NEW_REPO_URL="Enter a different GitHub repository URL: "
      git remote add origin %NEW_REPO_URL%
    ) else if "%REPO_CHOICE%"=="3" (
      echo.
      echo Please run fix-github-remote.bat to fix your repository URL later.
      pause
      exit /b 1
    )
  ) else (
    echo Repository connection successful!
  )
  
  REM Initial commit if needed
  git add -f build/
  git add .
  git commit -m "Initial commit with build directory"
  echo.
  echo Git repository is now set up and ready.
) else (
  echo Git repository already initialized.
  
  REM Make sure build directory is tracked
  echo Ensuring build directory is tracked...
  git add -f build/
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

REM Test repository connection
echo Testing connection to GitHub repository...
set REPO_URL_TEST=""
FOR /F "tokens=2" %%a IN ('git remote -v ^| findstr "origin" ^| findstr "(push)" ^| head -1') DO SET REPO_URL_TEST=%%a
git ls-remote --exit-code %REPO_URL_TEST% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ⚠️ WARNING: Cannot connect to the repository.
  echo.
  echo Would you like to:
  echo 1. Continue anyway (local commits only, no push)
  echo 2. Run fix-github-remote.bat to update the repository URL
  echo 3. Exit
  set /p CONNECT_CHOICE="Enter your choice (1-3): "
  
  if "%CONNECT_CHOICE%"=="2" (
    call fix-github-remote.bat
    pause
    exit /b 1
  ) else if "%CONNECT_CHOICE%"=="3" (
    echo Exiting...
    pause
    exit /b 1
  ) else (
    echo.
    echo Continuing with local commits only. You will need to push manually later.
    set LOCAL_ONLY=1
  )
) else (
  echo Repository connection successful!
  set LOCAL_ONLY=0
)
echo.

REM Ensure build directory is included before running the publish script
echo Ensuring build directory is included in the commit...
git add -f build/

REM Run the publishing script
echo Running GitHub publishing script...
if "%LOCAL_ONLY%"=="1" (
  echo LOCAL_ONLY=true > .publish-config.temp
  node publish-to-github.js
  del .publish-config.temp
) else (
  node publish-to-github.js
)

pause 