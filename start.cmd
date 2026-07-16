@echo off
cd /d "%~dp0"
start "" /min "%~dp0electron\electron.exe" . --no-sandbox
