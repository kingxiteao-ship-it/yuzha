Dim WshShell, fso, logFile, strPath, strCmd
On Error Resume Next

Set WshShell = CreateObject("WScript.Shell")
strPath = WshShell.CurrentDirectory

Set fso = CreateObject("Scripting.FileSystemObject")
Set logFile = fso.CreateTextFile(strPath & "\start_log.txt", True, False)
logFile.WriteLine("TaoJian started: " & Now)
logFile.WriteLine("Directory: " & strPath)
logFile.Close()

strCmd = Chr(34) & strPath & "\electron\electron.exe" & Chr(34) & " . --no-sandbox"
WshShell.CurrentDirectory = strPath
WshShell.Run strCmd, 0, False

If Err.Number <> 0 Then
    Set logFile = fso.OpenTextFile(strPath & "\start_log.txt", 8, True)
    logFile.WriteLine("Error: " & Err.Number & " - " & Err.Description)
    logFile.Close()
    MsgBox "Launch failed! Error: " & Err.Description, vbCritical, "TaoJian"
End If
