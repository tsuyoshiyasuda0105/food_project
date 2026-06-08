param(
  [string]$TaskName = "FoodProjectDataScheduler",
  [int]$IntervalMinutes = 5
)

$ErrorActionPreference = "Stop"
if ($PSVersionTable.PSVersion.Major -ge 7) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Runner = Join-Path $ProjectRoot "scripts\run-scheduler-once.ps1"
$HiddenRunner = Join-Path $ProjectRoot "scripts\run-scheduler-hidden.vbs"

if (-not (Test-Path $Runner)) {
  throw "Scheduler runner was not found: $Runner"
}
if (-not (Test-Path $HiddenRunner)) {
  throw "Hidden scheduler runner was not found: $HiddenRunner"
}

$action = New-ScheduledTaskAction `
  -Execute "wscript.exe" `
  -Argument "//B `"$HiddenRunner`"" `
  -WorkingDirectory $ProjectRoot

$repeatTrigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$logonTrigger = New-ScheduledTaskTrigger -AtLogOn

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

try {
  Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger @($repeatTrigger, $logonTrigger) `
    -Settings $settings `
    -Description "Food project API acquisition scheduler. Starts Next.js if needed and catches up missed jobs." `
    -Force | Out-Null

  Write-Output "Registered scheduled task: $TaskName"
  Write-Output "Runner: $HiddenRunner"
  Write-Output "Interval: every $IntervalMinutes minutes plus at logon"
} catch {
  Write-Warning "Register-ScheduledTask failed. Falling back to schtasks.exe with current-user permissions. Error: $($_.Exception.Message)"

  $taskCommand = "wscript.exe //B `"$HiddenRunner`""
  & schtasks.exe /Create /TN $TaskName /SC MINUTE /MO $IntervalMinutes /TR $taskCommand /F | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "schtasks.exe minute task registration failed with exit code $LASTEXITCODE"
  }

  $logonTaskName = "$TaskName-AtLogon"
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $logonOutput = & schtasks.exe /Create /TN $logonTaskName /SC ONLOGON /TR $taskCommand /F 2>&1
  $logonExitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($logonExitCode -ne 0) {
    Write-Warning "schtasks.exe logon task registration failed with exit code $logonExitCode. The minute task is still registered and will catch up after sign-in. $logonOutput"
  } else {
    Write-Output "Registered logon task with schtasks.exe: $logonTaskName"
  }

  Write-Output "Registered scheduled task with schtasks.exe: $TaskName"
  Write-Output "Runner: $HiddenRunner"
  Write-Output "Interval: every $IntervalMinutes minutes"
}
