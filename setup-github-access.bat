@echo off
echo ===========================================
echo GitHub Access Setup - מדריך הגדרת גישה לגיטהאב
echo ===========================================
echo.

echo שלב 1: הגדרת פרטי המשתמש בגיט
echo Step 1: Setting up Git user information
echo.

set /p GIT_NAME="Enter your name for Git (שם המשתמש שלך בגיט): "
set /p GIT_EMAIL="Enter your email for Git (כתובת האימייל שלך): "

git config --global user.name "%GIT_NAME%"
git config --global user.email "%GIT_EMAIL%"
echo.
echo Git user configured successfully. (פרטי המשתמש הוגדרו בהצלחה)
echo.

echo שלב 2: הגדרת מנהל האימות לשמירת הפרטים
echo Step 2: Setting up credential manager
echo.
git config --global credential.helper store
echo Credentials will now be stored after first successful login.
echo פרטי הכניסה יישמרו אחרי התחברות מוצלחת ראשונה.
echo.

echo שלב 3: הגדרת ה-URL של הריפוזיטורי
echo Step 3: Setting up repository URL
echo.
git remote -v
echo.

set /p CHANGE_URL="Do you want to change the repository URL? (Y/N) (האם לשנות את כתובת הריפוזיטורי?): "
if /i "%CHANGE_URL%"=="Y" (
    git remote remove origin
    echo.
    echo Please choose connection method (בחר שיטת התחברות):
    echo 1. HTTPS (requires username and token)
    echo 2. SSH (requires SSH key setup)
    echo.
    set /p CONN_TYPE="Enter choice (1/2) (בחר 1 או 2): "
    
    if "%CONN_TYPE%"=="1" (
        set /p REPO_URL="Enter HTTPS URL (https://github.com/username/repo.git): "
        git remote add origin %REPO_URL%
    ) else if "%CONN_TYPE%"=="2" (
        set /p REPO_URL="Enter SSH URL (git@github.com:username/repo.git): "
        git remote add origin %REPO_URL%
    )
)

echo.
echo שלב 4: בדיקת החיבור והעלאת קובץ בדיקה
echo Step 4: Testing connection with a test file
echo.

echo Creating a test file... (יוצר קובץ בדיקה)
echo This is a test file > github-test.txt
git add github-test.txt
git commit -m "Test commit for authentication"
echo.

echo ===================================================================
echo IMPORTANT - Please Read Carefully (חשוב - אנא קרא בעיון)
echo ===================================================================
echo.
echo When prompted for credentials:
echo - Username: Your GitHub username (שם המשתמש שלך בגיטהאב)
echo - Password: DO NOT use your GitHub password, use a Personal Access Token
echo   (אל תשתמש בסיסמת GitHub הרגילה, השתמש בטוקן גישה אישי)
echo.
echo If you don't have a Personal Access Token, follow these steps:
echo אם אין לך טוקן גישה אישי, עקוב אחר השלבים הבאים:
echo.
echo 1. Go to: https://github.com/settings/tokens
echo 2. Click "Generate new token" (classic)
echo 3. Give it a name like "CRM Project Access"
echo 4. Select at least the "repo" scope (all repo checkboxes)
echo 5. Click "Generate token"
echo 6. Copy the token - this is the ONLY time you will see it!
echo    (העתק את הטוקן - זו הפעם היחידה שתראה אותו!)
echo.
echo Press any key when you're ready to continue...
pause >nul

echo Attempting to push to GitHub... (מנסה לדחוף לגיטהאב)
echo.
git push -u origin master
echo.

echo If the push was successful, authentication is working correctly.
echo You can now run setup-git-and-publish.bat to publish your project.
echo.
echo If it failed, please double-check your credentials and try again.
echo.

echo Cleaning up test file... (מנקה את קובץ הבדיקה)
git rm github-test.txt --cached
git commit -m "Remove test file"

echo.
echo ===================================================================
echo Setup Complete - הגדרה הושלמה
echo ===================================================================
echo.
echo If everything worked, you can now run:
echo setup-git-and-publish.bat
echo.
echo to publish your project to GitHub with timestamp versioning.
echo.

pause 