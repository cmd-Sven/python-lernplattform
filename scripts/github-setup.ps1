# GitHub einrichten & Projekt veröffentlichen
# Rechtsklick -> "Mit PowerShell ausführen" oder in PowerShell:
#   cd "c:\Users\Sven Sieber\Desktop\Python_lernen\python-lernplattform"
#   .\scripts\github-setup.ps1

$gh = "C:\Program Files\GitHub CLI\gh.exe"
$git = "C:\Program Files\Git\bin\git.exe"

if (-not (Test-Path $gh)) {
    Write-Host "GitHub CLI nicht gefunden. Installiere mit: winget install GitHub.cli" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $git)) {
    Write-Host "Git nicht gefunden. Installiere von https://git-scm.com" -ForegroundColor Red
    exit 1
}

Set-Location $PSScriptRoot\..

Write-Host "`n=== Schritt 1: GitHub-Anmeldung ===" -ForegroundColor Cyan
& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Browser-Anmeldung starten …" -ForegroundColor Yellow
    & $gh auth login -h github.com -p https -w
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "`n=== Schritt 2: Öffentliches Repository erstellen & pushen ===" -ForegroundColor Cyan
$repoName = "python-lernplattform"
& $gh repo view $repoName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Repository existiert bereits – pushe …" -ForegroundColor Yellow
    & $git push -u origin main
} else {
    & $gh repo create $repoName --public --source=. --remote=origin --push
}

if ($LASTEXITCODE -eq 0) {
    $url = & $gh repo view --json url -q .url 2>$null
    Write-Host "`nFertig! Repository: $url" -ForegroundColor Green
} else {
    Write-Host "`nFehler beim Erstellen/Pushen. Prüfe die Meldung oben." -ForegroundColor Red
}
