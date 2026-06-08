Option Explicit

Dim shell
Dim filesystem
Dim scriptDirectory
Dim projectRoot
Dim runner
Dim command
Dim exitCode

Set shell = CreateObject("WScript.Shell")
Set filesystem = CreateObject("Scripting.FileSystemObject")

scriptDirectory = filesystem.GetParentFolderName(WScript.ScriptFullName)
projectRoot = filesystem.GetParentFolderName(scriptDirectory)
runner = filesystem.BuildPath(scriptDirectory, "run-scheduler-once.ps1")

shell.CurrentDirectory = projectRoot
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File " & Chr(34) & runner & Chr(34)
exitCode = shell.Run(command, 0, True)

WScript.Quit exitCode
