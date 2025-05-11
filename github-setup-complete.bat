@echo off
echo ===========================================
echo GitHub Complete Setup - הגדרה מלאה לגיטהאב
echo ===========================================
echo.

echo מגדיר את פרטי המשתמש בגיט...
echo Configuring Git user information...

git config --global user.name "QuestoM"
git config --global user.email "netanel@questo.media"
echo.
echo פרטי המשתמש הוגדרו.
echo User information configured.
echo.

echo מגדיר מנהל אישורים לשמירת הפרטים...
echo Setting up credential manager...
git config --global credential.helper store
echo.

echo מגדיר את כתובת הריפוזיטורי...
echo Setting up repository URL...
git remote remove origin
git remote add origin https://github.com/QuestoM/crm.git
echo.

echo יוצר טוקן גישה אישי (Personal Access Token)...
echo Creating a test file for authentication...
echo This is a test file > github-test.txt
git add github-test.txt
git commit -m "Test setup"
echo.

echo =======================================================
echo.
echo יש להיכנס לקישור הבא וליצור טוקן גישה אישי חדש:
echo Please visit this link to create a new Personal Access Token:
echo.
echo https://github.com/settings/tokens/new
echo.
echo 1. תן לטוקן שם כמו "CRM Project"
echo 2. סמן את כל התיבות תחת "repo"
echo 3. לחץ על "Generate token"
echo 4. העתק את הטוקן לשימוש בשלב הבא
echo.
echo 1. Name it something like "CRM Project"
echo 2. Select all checkboxes under "repo"
echo 3. Click "Generate token"
echo 4. Copy the token for use in the next step
echo.
echo =======================================================
echo.
pause

echo מנסה לדחוף לגיטהאב... אנא הזן את שם המשתמש והטוקן כשתתבקש
echo Attempting to push to GitHub... Please enter your username and token when prompted
echo.
echo Username: QuestoM
echo Password: [Use your Personal Access Token you just created]
echo.
git push -u origin master

echo.
echo אם הדחיפה הצליחה, הכל מוגדר נכון!
echo If the push was successful, everything is set up correctly!
echo.
echo מנקה את קובץ הבדיקה...
echo Cleaning up test file...
git rm github-test.txt --cached
git commit -m "Remove test file"
git push origin master

echo.
echo =======================================================
echo ההגדרה הושלמה בהצלחה!
echo Setup completed successfully!
echo.
echo כעת תוכל להריץ:
echo Now you can run:
echo setup-git-and-publish.bat
echo.
echo כדי לפרסם את הפרויקט שלך עם תיוג גרסאות לפי זמן.
echo to publish your project with timestamp versioning.
echo =======================================================
echo.

pause 