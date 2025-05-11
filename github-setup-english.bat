@echo off
echo ===========================================
echo GitHub Complete Setup
echo ===========================================
echo.

echo Configuring Git user information...
git config --global user.name "QuestoM"
git config --global user.email "netanel@questo.media"
echo User information configured.
echo.

echo Setting up credential manager...
git config --global credential.helper store
echo.

echo Setting up repository URL...
git remote remove origin
git remote add origin https://github.com/QuestoM/crm.git
echo.

echo Creating a test file for authentication...
echo This is a test file > github-test.txt
git add github-test.txt
git commit -m "Test setup"
echo.

echo =======================================================
echo.
echo Please visit this link to create a new Personal Access Token:
echo.
echo https://github.com/settings/tokens/new
echo.
echo 1. Name it something like "CRM Project"
echo 2. Select all checkboxes under "repo"
echo 3. Click "Generate token"
echo 4. Copy the token for use in the next step
echo.
echo =======================================================
echo.
pause

echo Attempting to push to GitHub... Please enter your username and token when prompted
echo.
echo Username: QuestoM
echo Password: [Use your Personal Access Token you just created]
echo.
git push -u origin master

echo.
echo If the push was successful, everything is set up correctly!
echo.
echo Cleaning up test file...
git rm github-test.txt --cached
git commit -m "Remove test file"
git push origin master

echo.
echo =======================================================
echo Setup completed successfully!
echo.
echo Now you can run:
echo setup-git-and-publish.bat
echo.
echo to publish your project with timestamp versioning.
echo =======================================================
echo.

pause 