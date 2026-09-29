# Replace muskan5692339/telangana-colleges-dashboard main with the app in this zip.
# Vercel builds that GitHub repo with Root Directory left blank (package.json at repo root).
$ErrorActionPreference = "Stop"

$zip = @(
  "$env:USERPROFILE\Downloads\telangana_dashboard_53_colleges.zip",
  "$env:USERPROFILE\Downloads\telangana_old_batch_53_colleges_github.zip"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $zip) {
  throw "Save telangana_dashboard_53_colleges.zip to Downloads, then run this script again."
}

$repo = "C:\Users\muska\tcd-github"
$remote = "https://github.com/muskan5692339/telangana-colleges-dashboard.git"

if (Test-Path $repo) { Remove-Item -LiteralPath $repo -Recurse -Force }
git clone $remote $repo
Set-Location $repo

Get-ChildItem -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
Expand-Archive -LiteralPath $zip -DestinationPath $repo -Force

if (Test-Path "$repo\telangana-colleges-dashboard\package.json") {
  Remove-Item -LiteralPath "$repo\telangana-colleges-dashboard" -Recurse -Force
}
if (-not (Test-Path "$repo\package.json")) {
  throw "package.json is not at the repo root. Use telangana_dashboard_53_colleges.zip from the chat."
}
if (-not (Test-Path "$repo\src\lib\inc10-colleges.json")) {
  throw "src\lib\inc10-colleges.json is missing, so this is not the 53-college build."
}

git add -A
git commit -m "Old batch: 53 colleges from Inc10.0_Student_Facing_Monitoring.xlsx"
git push origin main
Write-Host ""
Write-Host "Pushed. In Vercel keep Settings > General > Root Directory EMPTY, then wait for the deploy."
Write-Host "Check https://telangana-colleges-dashboard.vercel.app/student-view : 3rd Year : Old Batch = 53 colleges."
