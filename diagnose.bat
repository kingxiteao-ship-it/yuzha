@echo off
chcp 65001 >nul
echo ============================================
echo  TaoJian Diagnostic Launcher
echo ============================================
echo.
cd /d "%~dp0"
echo Current directory: %cd%
echo.
echo Checking electron.exe...
if exist "electron\electron.exe" (
    echo [OK] electron.exe found
    echo Size:
    dir "electron\electron.exe" ^| findstr "electron.exe"
) else (
    echo [ERROR] electron.exe NOT found!
)
echo.
echo Checking data files...
dir data\*.json >nul 2>&1 && echo [OK] data files found || echo [WARN] data files missing
echo.
echo Starting TaoJian...
echo (If this window stays open, there may be an error below)
echo ============================================
"electron\electron.exe" . --no-sandbox
echo.
echo Exit code: %ERRORLEVEL%
pause
