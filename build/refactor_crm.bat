@echo off
setlocal enabledelayedexpansion

REM --- Configuration ---
set "SOURCE_HTML=index.html"
set "TARGET_DIR=..\public" REM Target directory relative to the script location (build)
set "SOURCE_DIR=." REM Source directory relative to the script location (build)

REM --- !!! USER INPUT REQUIRED: Line Numbers !!! ---
REM --- Replace the 0s below with the actual line numbers from your index.html ---
set "css_start_line=41"   REM Line number containing <!-- CSS_START -->
set "css_end_line=107"     REM Line number containing <!-- CSS_END -->
set "js_start_line=556"    REM Line number containing <!-- MAIN_JS_START -->
set "js_end_line=1854"      REM Line number containing <!-- MAIN_JS_END -->
REM --- End of User Input ---


REM --- Basic Validation of User Input (Existence Only) ---
echo Validating provided line numbers...
if "%css_start_line%" == "0" echo ERROR: Please set css_start_line in the script. & pause & exit /b 1
if "%css_end_line%" == "0" echo ERROR: Please set css_end_line in the script. & pause & exit /b 1
if "%js_start_line%" == "0" echo ERROR: Please set js_start_line in the script. & pause & exit /b 1
if "%js_end_line%" == "0" echo ERROR: Please set js_end_line in the script. & pause & exit /b 1
echo Line numbers seem to be set. Assuming they are in correct order.
echo CSS Start: %css_start_line%, CSS End: %css_end_line%
echo JS Start: %js_start_line%, JS End: %js_end_line%
echo ---

REM --- Check if source HTML exists ---
if not exist "%SOURCE_DIR%\%SOURCE_HTML%" (
    echo ERROR: Source file "%SOURCE_DIR%\%SOURCE_HTML%" not found!
    pause
    exit /b 1
)

REM --- Create Target Directory Structure ---
echo Creating target directories...
if exist "%TARGET_DIR%" (
    echo WARNING: Target directory "%TARGET_DIR%" already exists.
    echo Files within it might be overwritten. Press Ctrl+C to cancel or any key to continue...
    pause > nul
)
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if not exist "%TARGET_DIR%\css" mkdir "%TARGET_DIR%\css"
if not exist "%TARGET_DIR%\js" mkdir "%TARGET_DIR%\js"
if not exist "%TARGET_DIR%\js\modules" mkdir "%TARGET_DIR%\js\modules"

REM --- Define Output Files ---
set "NEW_HTML=%TARGET_DIR%\index.html"
set "CSS_FILE=%TARGET_DIR%\css\style.css"
set "TEMP_JS_FILE=%TARGET_DIR%\js\app.js" REM Extract all JS here first
set "CONFIG_JS=%TARGET_DIR%\js\config.js"
set "UTILS_JS=%TARGET_DIR%\js\utils.js"
set "API_JS=%TARGET_DIR%\js\api.js"
set "UI_JS=%TARGET_DIR%\js\ui.js"
set "AUTH_INIT_JS=%TARGET_DIR%\js\auth_init.js"
set "MAIN_JS=%TARGET_DIR%\js\main.js"
set "DASHBOARD_JS=%TARGET_DIR%\js\modules\dashboard.js"
set "LEADS_JS=%TARGET_DIR%\js\modules\leads.js"
set "CUSTOMERS_JS=%TARGET_DIR%\js\modules\customers.js"
set "ORDERS_JS=%TARGET_DIR%\js\modules\orders.js"
set "PRODUCTS_JS=%TARGET_DIR%\js\modules\products.js"
set "PACKAGES_JS=%TARGET_DIR%\js\modules\packages.js"
set "REPORTS_JS=%TARGET_DIR%\js\modules\reports.js"
set "SETTINGS_JS=%TARGET_DIR%\js\modules\settings.js"

REM --- Clear/Create Output Files ---
echo Preparing output files...
if exist "%NEW_HTML%" del "%NEW_HTML%"
if exist "%CSS_FILE%" del "%CSS_FILE%"
if exist "%TEMP_JS_FILE%" del "%TEMP_JS_FILE%"
type nul > "%CONFIG_JS%"
type nul > "%UTILS_JS%"
type nul > "%API_JS%"
type nul > "%UI_JS%"
type nul > "%AUTH_INIT_JS%"
type nul > "%MAIN_JS%"
type nul > "%DASHBOARD_JS%"
type nul > "%LEADS_JS%"
type nul > "%CUSTOMERS_JS%"
type nul > "%ORDERS_JS%"
type nul > "%PRODUCTS_JS%"
type nul > "%PACKAGES_JS%"
type nul > "%REPORTS_JS%"
type nul > "%SETTINGS_JS%"


REM --- Process the HTML File using Line Numbers ---
echo Processing %SOURCE_HTML% by line number...
set "line_num=0"
set "in_head=0"
set "added_css_link=0"
set "added_js_links=0"

(
    for /f "usebackq tokens=* delims=" %%L in ("%SOURCE_DIR%\%SOURCE_HTML%") do (
        set /a line_num+=1
        set "line=%%L"
        set "write_to_html=1"
        set "write_to_css=0"
        set "write_to_js=0"

        REM --- Decide where to write based on line number ---
        if !line_num! GTR %css_start_line% if !line_num! LSS %css_end_line% (
            set "write_to_css=1"
            set "write_to_html=0"
        )
        if !line_num! GTR %js_start_line% if !line_num! LSS %js_end_line% (
            set "write_to_js=1"
            set "write_to_html=0"
        )

        REM --- Skip Marker Lines themselves ---
        if !line_num! == %css_start_line% set "write_to_html=0"
        if !line_num! == %css_end_line% set "write_to_html=0"
        if !line_num! == %js_start_line% set "write_to_html=0"
        if !line_num! == %js_end_line% set "write_to_html=0"


        REM --- Write to CSS File ---
        if !write_to_css! == 1 (
            echo(!line! >> "%CSS_FILE%"
        )

        REM --- Write to JS File ---
        if !write_to_js! == 1 (
            echo(!line! >> "%TEMP_JS_FILE%"
        )

        REM --- Write to New HTML File ---
        if !write_to_html! == 1 (
            REM Check for head section boundaries using findstr on the variable
            echo "!line!" | findstr /i /c:"<head>" > nul && set "in_head=1"
            echo "!line!" | findstr /i /c:"</head>" > nul && set "in_head=0"

            REM Add CSS link in head after title or other meta tags
            if !in_head! == 1 (
               echo(!line!
               echo "!line!" | findstr /i /c:"</title>" > nul
               if !errorlevel! == 0 if !added_css_link! == 0 (
                  echo     ^<link rel="stylesheet" href="css/style.css" /^>
                  set "added_css_link=1"
               )
            ) else (
               REM Add JS links before closing body tag
               echo "!line!" | findstr /i /c:"</body>" > nul
               if !errorlevel! == 0 if !added_js_links! == 0 (
                  echo     REM --- External and Core JS ---
                  echo     ^<script src="https://unpkg.com/@supabase/supabase-js@2"^>^</script^>
                  echo     ^<script src="https://cdn.jsdelivr.net/npm/chart.js"^>^</script^>
                  echo     ^<script src="js/auth.js"^>^</script^> REM Assuming auth.js initializes window.authClient
                  echo     ^<script src="js/auth_init.js"^>^</script^> REM Initializes supabaseClient
                  echo.
                  echo     REM --- Application Logic (Order Matters!) ---
                  echo     ^<script src="js/config.js"^>^</script^>
                  echo     ^<script src="js/utils.js"^>^</script^>
                  echo     ^<script src="js/api.js"^>^</script^>
                  echo     ^<script src="js/ui.js"^>^</script^>
                  echo.
                  echo     REM --- Feature Modules ---
                  echo     ^<script src="js/modules/dashboard.js"^>^</script^>
                  echo     ^<script src="js/modules/leads.js"^>^</script^>
                  echo     ^<script src="js/modules/customers.js"^>^</script^>
                  echo     ^<script src="js/modules/orders.js"^>^</script^>
                  echo     ^<script src="js/modules/products.js"^>^</script^>
                  echo     ^<script src="js/modules/packages.js"^>^</script^>
                  echo     ^<script src="js/modules/reports.js"^>^</script^>
                  echo     ^<script src="js/modules/settings.js"^>^</script^>
                  echo     ^<script src="js/tasks.js" defer^>^</script^> REM Existing tasks.js
                  echo.
                  echo     REM --- Main Application Runner ---
                  echo     ^<script src="js/app.js"^>^</script^> REM Contains bulk JS initially
                  echo     ^<script src="js/main.js"^>^</script^> REM Runs initialization
                  echo.
                  set "added_js_links=1"
               )
               echo(!line!
            )
        )
    )
) > "%NEW_HTML%"

REM --- Copy External JS Files ---
echo Copying external JS files...
if exist "%SOURCE_DIR%\auth.js" (
    copy /Y "%SOURCE_DIR%\auth.js" "%TARGET_DIR%\js\auth.js" > nul
    echo Copied auth.js
) else (
    echo WARNING: auth.js not found in source directory "%SOURCE_DIR%".
)
if exist "%SOURCE_DIR%\tasks.js" (
    copy /Y "%SOURCE_DIR%\tasks.js" "%TARGET_DIR%\js\tasks.js" > nul
    echo Copied tasks.js
) else (
    echo WARNING: tasks.js not found in source directory "%SOURCE_DIR%".
)

REM --- Add placeholder comments to empty JS files ---
echo Adding placeholder comments to JS files...
(echo // Configuration constants (e.g., Supabase URL/Key if needed, though likely in auth_init)) > "%CONFIG_JS%"
(echo // Utility functions (formatting, modals, toast, etc.)) > "%UTILS_JS%"
(echo // API interaction functions (Supabase calls, mock data)) > "%API_JS%"
(echo // UI manipulation functions (navigation, table rendering, etc.)) > "%UI_JS%"
(echo // Initializes global supabaseClient using authClient) > "%AUTH_INIT_JS%"
(echo // Main application execution logic (DOMContentLoaded listener, initial calls)) > "%MAIN_JS%"
(echo // Dashboard specific functions) > "%DASHBOARD_JS%"
(echo // Leads specific functions) > "%LEADS_JS%"
(echo // Customers specific functions) > "%CUSTOMERS_JS%"
(echo // Orders specific functions) > "%ORDERS_JS%"
(echo // Products specific functions) > "%PRODUCTS_JS%"
(echo // Packages specific functions) > "%PACKAGES_JS%"
(echo // Reports specific functions) > "%REPORTS_JS%"
(echo // Settings specific functions) > "%SETTINGS_JS%"


echo --- Refactoring Process Partially Complete ---
echo.
echo IMPORTANT MANUAL STEP REQUIRED:
echo 1. Open the generated file: "%TEMP_JS_FILE%"
echo 2. Manually copy and paste the relevant functions and variables from "%TEMP_JS_FILE%"
echo    into the corresponding empty .js files created in "%TARGET_DIR%\js\" and "%TARGET_DIR%\js\modules\".
echo    Follow the plan outlined in the guide (utils, api, ui, modules, etc.).
echo 3. The "%MAIN_JS%" file should contain the main DOMContentLoaded listener and calls to initialize functions.
echo 4. The "%AUTH_INIT_JS%" file should contain the logic to get the supabaseClient from window.authClient.
echo 5. Once you have manually split the contents of "%TEMP_JS_FILE%", you can delete it if desired,
echo    AND also remove the line '^<script src="js/app.js"^>^</script^>' from "%NEW_HTML%".
echo.
echo After manual splitting, test "%TARGET_DIR%\index.html" thoroughly.
echo.
pause
endlocal