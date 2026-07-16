@echo off
chcp 65001 >nul
echo.
echo  ============================================
echo    涛笺 启动器
echo  ============================================
echo.
echo  推荐使用 start.vbs 双击启动（无黑窗口）
echo.
echo  此窗口会在应用启动后自动关闭...
echo.
cd /d "%~dp0"
"electron\electron.exe" . --no-sandbox
echo.
