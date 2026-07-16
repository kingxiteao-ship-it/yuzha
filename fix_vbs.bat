@echo off
echo Fixing VBS file encoding...
powershell -Command "(Get-Content -Raw start.vbs) -replace "`n", "`r`n" | Set-Content -NoNewline start.vbs"
echo Done. Please try double-clicking start.vbs again.
pause
