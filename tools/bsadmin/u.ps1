# u.ps1 - pomocnik pro nasazeni v BSADMIN (TDT-RDSH) - spousti se z cmd: b <akce>
# Prvni spusteni (cmd v %USERPROFILE%): powershell -ep bypass -f u.ps1 sa   -> zalozi b.bat
# Akce: sa = schranka -> vstup.html | pa = patch 01a | ca = 01a do schranky
#       pbc / pbs = patch 01b CZ / SK | cbc / cbs = 01b CZ / SK do schranky | ll = seznam + sha
param([string]$akce = 'll')
$ErrorActionPreference = 'Stop'
$base = 'https://raw.githubusercontent.com/LiorD78/tagra.app/main/tools/bsadmin/'
$bat = Join-Path $env:USERPROFILE 'b.bat'
if (-not (Test-Path $bat)) { Set-Content -Path $bat -Encoding ASCII -Value '@powershell -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\u.ps1" %*' }
$w = Join-Path $env:TEMP '7\oci\w'
New-Item -ItemType Directory -Force $w | Out-Null
Set-Location $w
foreach ($f in 'p01a.ps1', 'p01b.ps1') { if (-not (Test-Path $f)) { Invoke-WebRequest ($base + $f) -OutFile $f -UseBasicParsing } }
$utf8 = New-Object Text.UTF8Encoding($false)
function clipf([string]$n) { Set-Clipboard -Value ([IO.File]::ReadAllText((Resolve-Path $n), $utf8)); Write-Host ('schranka = ' + $n + ' ' + (Get-Item $n).Length + ' B') }
switch ($akce) {
  'sa'  { (Get-Clipboard -Raw) | Set-Content -Encoding UTF8 vstup.html; $t = [IO.File]::ReadAllText((Resolve-Path vstup.html), $utf8); Write-Host ('ulozeno vstup.html ' + (Get-Item vstup.html).Length + ' B | zacatek: ' + $t.Substring(0, [Math]::Min(40, $t.Length)).Replace("`n", ' ')) }
  'pa'  { powershell -NoProfile -ExecutionPolicy Bypass -File p01a.ps1 vstup.html }
  'ca'  { clipf 'a136-CZ-v2026-11-23-tdt-vyjimky.html' }
  'pbc' { powershell -NoProfile -ExecutionPolicy Bypass -File p01b.ps1 cz vstup.html }
  'pbs' { powershell -NoProfile -ExecutionPolicy Bypass -File p01b.ps1 sk vstup.html }
  'cbc' { clipf 'c5711-CZ-v2026-11-23-tdt-program.html' }
  'cbs' { clipf 'c5711-SK-v2026-11-23-tdt-program.html' }
  'll'  { Get-ChildItem -File | ForEach-Object { $_.Name + ' ' + $_.Length + ' ' + (Get-FileHash $_.Name).Hash.Substring(0, 12) } }
  default { Write-Host ('neznama akce ' + $akce) }
}
