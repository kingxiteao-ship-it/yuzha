@echo off
chcp 65001 >nul
echo ============================================
echo  涛笺 打包脚本
echo ============================================
echo.
echo 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js 已安装
echo.
echo 安装依赖...
call npm install
echo.
echo 开始打包...
call npm run build-win
echo.
echo 打包完成！
echo 安装程序位于: dist\涛笺 Setup.exe
echo 免安装版位于: dist\win-unpacked\涛笺.exe
pause
