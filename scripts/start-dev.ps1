# start-dev.ps1
# Starts SkillPilot backend + updates IP + launches Expo
# Usage: Right-click -> "Run with PowerShell"  OR  npm run start-all

$RootDir = Split-Path -Parent $PSScriptRoot

Write-Host "`n🔧 Updating local IP in network-config.ts..." -ForegroundColor Cyan
node "$RootDir\scripts\set-ip.js"

Write-Host "`n🚀 Starting backend server in a new terminal window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList `
  "-NoExit", "-Command", `
  "cd '$RootDir\backend'; Write-Host '✅ Backend starting on port 5001...' -ForegroundColor Green; node server.js"

Start-Sleep -Seconds 2

Write-Host "`n📱 Starting Expo (--lan mode)..." -ForegroundColor Cyan
Set-Location $RootDir
npx expo start --lan
