# TaoJian Silent Launcher
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process -FilePath "$dir\electron\electron.exe" -ArgumentList ".", "--no-sandbox" -WindowStyle Hidden -WorkingDirectory $dir
