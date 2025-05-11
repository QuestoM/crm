@echo off
echo ===========================================
echo GitHub Authentication Test
echo ===========================================
echo.

echo Configuring credential helper to store credentials...
git config --global credential.helper store
echo.

echo Creating a test file...
echo This is a test file > github-test.txt
git add github-test.txt
git commit -m "Test commit for authentication"
echo.

echo Attempting to push to GitHub...
echo When prompted, enter your GitHub username and Personal Access Token (NOT your password)
echo.
git push -u origin master
echo.

echo If the push was successful, authentication is working correctly.
echo If it failed, please create a Personal Access Token on GitHub:
echo.
echo 1. Go to: https://github.com/settings/tokens
echo 2. Click "Generate new token" (classic)
echo 3. Give it a name like "CRM Project Access"
echo 4. Select at least the "repo" scope
echo 5. Click "Generate token"
echo 6. Copy the token and use it as your password when prompted
echo.

echo Cleaning up test file...
git rm github-test.txt --cached
git commit -m "Remove test file"

pause 