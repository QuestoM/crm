@echo off
setlocal

:: List of JavaScript files to create
set "files_to_create=app-config.js utils.js modals.js tables.js dashboard-logic.js leads-logic.js customers-logic.js products-logic.js packages-logic.js orders-logic.js navigation-logic.js app-main.js"

echo Creating empty JavaScript files...
echo.

for %%f in (%files_to_create%) do (
    if exist "%%f" (
        echo File "%%f" already exists. Skipping.
    ) else (
        echo Creating "%%f"...
        type NUL > "%%f"
        if errorlevel 1 (
            echo   ERROR: Could not create "%%f".
        ) else (
            echo   Successfully created "%%f".
        )
    )
)

echo.
echo Script finished.
echo Please manually copy the relevant code sections from your main.js into these new files.
echo Remember to update your index.html with the new script tags in the correct order.

endlocal
pause