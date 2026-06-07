param(
  [string]$TaskName = "FoodProjectDataScheduler"
)

$ErrorActionPreference = "SilentlyContinue"

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Unregister-ScheduledTask -TaskName "$TaskName-AtLogon" -Confirm:$false
& schtasks.exe /Delete /TN $TaskName /F | Out-Null
& schtasks.exe /Delete /TN "$TaskName-AtLogon" /F | Out-Null

Write-Output "Removed scheduled task: $TaskName"
Write-Output "Removed scheduled task: $TaskName-AtLogon"
