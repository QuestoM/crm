@echo off
echo Cleaning up and consolidating project structure...

REM Create backup before cleanup
mkdir backup\cleanup-backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%
xcopy /E /Y react-app backup\cleanup-backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%\react-app\
xcopy /E /Y react-crm-app backup\cleanup-backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%\react-crm-app\
xcopy /E /Y server.js backup\cleanup-backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%\

REM Move and create necessary directories
IF NOT EXIST src\pages\dashboard mkdir src\pages\dashboard
IF NOT EXIST src\shared\utils mkdir src\shared\utils
IF NOT EXIST src\shared\ui\layout mkdir src\shared\ui\layout

REM Move the RTL utilities
IF NOT EXIST react-dashboard-app\src\shared\utils (
    mkdir react-dashboard-app\src\shared\utils
)
copy /Y src\shared\utils\rtl.ts react-dashboard-app\src\shared\utils\rtl.ts 2>nul

REM Move UI components with RTL support 
IF NOT EXIST react-dashboard-app\src\shared\ui\layout (
    mkdir react-dashboard-app\src\shared\ui\layout
)
IF NOT EXIST react-dashboard-app\src\shared\ui\navigation (
    mkdir react-dashboard-app\src\shared\ui\navigation
)
copy /Y src\shared\ui\layout\RtlLayout.tsx react-dashboard-app\src\shared\ui\layout\RtlLayout.tsx 2>nul
copy /Y src\shared\ui\layout\MainLayout.tsx react-dashboard-app\src\shared\ui\layout\MainLayout.tsx 2>nul
copy /Y src\shared\ui\layout\PageHeader.tsx react-dashboard-app\src\shared\ui\layout\PageHeader.tsx 2>nul
copy /Y src\shared\ui\navigation\Sidebar.tsx react-dashboard-app\src\shared\ui\navigation\Sidebar.tsx 2>nul
copy /Y src\shared\ui\navigation\Navbar.tsx react-dashboard-app\src\shared\ui\navigation\Navbar.tsx 2>nul

REM Copy the modules directory for domain logic
IF NOT EXIST react-dashboard-app\src\modules (
    mkdir react-dashboard-app\src\modules
)
xcopy /E /Y src\modules react-dashboard-app\src\modules\ 2>nul

REM Copy Supabase configuration
IF NOT EXIST react-dashboard-app\src\services\supabase (
    mkdir react-dashboard-app\src\services\supabase
)
copy /Y src\services\supabase\config.ts react-dashboard-app\src\services\supabase\config.ts 2>nul
copy /Y src\services\supabase\client.ts react-dashboard-app\src\services\supabase\client.ts 2>nul

REM Copy pages for leads and customers
IF NOT EXIST react-dashboard-app\src\pages\leads (
    mkdir react-dashboard-app\src\pages\leads
)
IF NOT EXIST react-dashboard-app\src\pages\customers (
    mkdir react-dashboard-app\src\pages\customers
)
copy /Y src\pages\leads\index.tsx react-dashboard-app\src\pages\leads\index.tsx 2>nul
copy /Y src\pages\customers\index.tsx react-dashboard-app\src\pages\customers\index.tsx 2>nul

REM Copy API interfaces
IF NOT EXIST react-dashboard-app\src\types (
    mkdir react-dashboard-app\src\types
)
copy /Y api-interfaces.ts react-dashboard-app\src\types\api-interfaces.ts 2>nul

REM Create/update vite.config.js in the dashboard app
echo import { defineConfig } from 'vite'> react-dashboard-app\vite.config.js
echo import react from '@vitejs/plugin-react'>> react-dashboard-app\vite.config.js
echo.>> react-dashboard-app\vite.config.js
echo export default defineConfig({>> react-dashboard-app\vite.config.js
echo   plugins: [react()],>> react-dashboard-app\vite.config.js
echo   server: {>> react-dashboard-app\vite.config.js
echo     port: 3100,>> react-dashboard-app\vite.config.js
echo     strictPort: true,>> react-dashboard-app\vite.config.js
echo   }>> react-dashboard-app\vite.config.js
echo })>> react-dashboard-app\vite.config.js

REM Create index.html for the dashboard app if it doesn't exist
IF NOT EXIST react-dashboard-app\index.html (
    echo ^<!DOCTYPE html^>> react-dashboard-app\index.html
    echo ^<html lang="he" dir="rtl"^>>> react-dashboard-app\index.html
    echo   ^<head^>>> react-dashboard-app\index.html
    echo     ^<meta charset="UTF-8" /^>>> react-dashboard-app\index.html
    echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>>> react-dashboard-app\index.html
    echo     ^<title^>Water Filter CRM^</title^>>> react-dashboard-app\index.html
    echo   ^</head^>>> react-dashboard-app\index.html
    echo   ^<body^>>> react-dashboard-app\index.html
    echo     ^<div id="root"^>^</div^>>> react-dashboard-app\index.html
    echo     ^<script type="module" src="/src/main.tsx"^>^</script^>>> react-dashboard-app\index.html
    echo   ^</body^>>> react-dashboard-app\index.html
    echo ^</html^>>> react-dashboard-app\index.html
)

REM Copy tailwind.config.js to dashboard app
copy /Y tailwind.config.js react-dashboard-app\tailwind.config.js 2>nul
copy /Y postcss.config.js react-dashboard-app\postcss.config.js 2>nul

REM Create tsconfig.json for the dashboard app if it doesn't exist
copy /Y tsconfig.json react-dashboard-app\tsconfig.json 2>nul
copy /Y tsconfig.node.json react-dashboard-app\tsconfig.node.json 2>nul

REM Copy MCP configuration
IF NOT EXIST react-dashboard-app\.cursor (
    mkdir react-dashboard-app\.cursor
)
copy /Y .cursor\mcp.json react-dashboard-app\.cursor\mcp.json 2>nul

REM Move readme to dashboard app
copy /Y README.md react-dashboard-app\README.md 2>nul

REM Create simple MainLayout for dashboard
IF NOT EXIST src\shared\ui\layout\MainLayout.tsx (
  echo import React, { ReactNode } from 'react';> src\shared\ui\layout\MainLayout.tsx
  echo import { useRtlDirection } from '../../utils/rtl';>> src\shared\ui\layout\MainLayout.tsx
  echo.>> src\shared\ui\layout\MainLayout.tsx
  echo interface MainLayoutProps {>> src\shared\ui\layout\MainLayout.tsx
  echo   children: ReactNode;>> src\shared\ui\layout\MainLayout.tsx
  echo }>> src\shared\ui\layout\MainLayout.tsx
  echo.>> src\shared\ui\layout\MainLayout.tsx
  echo export const MainLayout: React.FC^<MainLayoutProps^> = ({ children }) =^> {>> src\shared\ui\layout\MainLayout.tsx
  echo   const isRtl = useRtlDirection();>> src\shared\ui\layout\MainLayout.tsx
  echo.>> src\shared\ui\layout\MainLayout.tsx
  echo   return ^(>> src\shared\ui\layout\MainLayout.tsx
  echo     ^<div className="min-h-screen bg-gray-50"^>>> src\shared\ui\layout\MainLayout.tsx
  echo       ^<div className="flex flex-col"^>>> src\shared\ui\layout\MainLayout.tsx
  echo         ^<main className="flex-1 p-4"^>>> src\shared\ui\layout\MainLayout.tsx
  echo           {children}>> src\shared\ui\layout\MainLayout.tsx
  echo         ^</main^>>> src\shared\ui\layout\MainLayout.tsx
  echo       ^</div^>>> src\shared\ui\layout\MainLayout.tsx
  echo     ^</div^>>> src\shared\ui\layout\MainLayout.tsx
  echo   ^);>> src\shared\ui\layout\MainLayout.tsx
  echo };>> src\shared\ui\layout\MainLayout.tsx
)

REM Create index.css in src directory if it doesn't exist
IF NOT EXIST src\index.css (
  copy /Y react-dashboard-app\src\index.css src\index.css 2>nul
)

echo.
echo Cleanup complete! You can now run the RTL dashboard with start.bat
echo. 