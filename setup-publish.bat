@echo off
echo Installing required dependencies...
npm install date-fns --save
echo.
echo Dependencies installed successfully.
echo.
echo Running GitHub publishing script...
node publish-to-github.js
pause 