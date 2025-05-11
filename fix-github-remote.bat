@echo off
echo ===========================================
echo GitHub Remote URL Fix Tool
echo ===========================================
echo.

echo The current remote URL might be incorrect:
git remote -v
echo.

echo Please make sure that:
echo 1. You have created the repository on GitHub
echo 2. The repository name is correct
echo 3. You have the correct access permissions
echo.

set /p CONTINUE="Do you want to update the remote URL? (Y/N): "
if /i "%CONTINUE%" neq "Y" (
    echo Operation cancelled.
    goto :end
)

echo.
echo Removing current remote origin...
git remote remove origin

echo.
echo Please enter the correct GitHub repository information:
set /p REPO_URL="Enter GitHub repository URL (e.g., https://github.com/username/repo.git): "

echo.
echo Adding new remote origin...
git remote add origin %REPO_URL%

echo.
echo Testing connection to the repository...
git ls-remote --exit-code %REPO_URL% > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Repository connection successful!
    echo.
    echo You may now run 'setup-git-and-publish.bat' again to publish your code.
) else (
    echo.
    echo Repository connection failed. Please check:
    echo 1. The repository exists on GitHub
    echo 2. The URL is correct
    echo 3. You have proper access permissions
    echo 4. If using HTTPS, your credentials are correct
    echo.
    echo To create a new repository on GitHub:
    echo 1. Go to github.com and log in
    echo 2. Click the '+' icon in the upper right and select 'New repository'
    echo 3. Name your repository 'crm' or another name of your choice
    echo 4. Leave it as Public or make it Private based on your needs
    echo 5. Do NOT initialize with README or other files
    echo 6. Click 'Create repository'
    echo 7. Copy the HTTPS URL and use it in this script
)

:end
pause