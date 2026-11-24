# t.ps1 - pomocnik pro nasazeni v BSADMIN (TDT-RDSH), bez psani dlouhych prikazu.
# Spusteni (cmd): powershell -ep bypass -noexit -f t.ps1
# Funkce: sa = ulozit schranku do vstup.html | pa = patch 01a | ca = vysledek 01a do schranky
#         pbc / pbs = patch 01b CZ / SK | cbc / cbs = vysledek 01b CZ / SK do schranky | ll = seznam + sha
$ErrorActionPreference = 'Stop'
$base = 'https://raw.githubusercontent.com/LiorD78/tagra.app/main/tools/bsadmin/'
$w = Join-Path $env:TEMP '7\oci\w'
New-Item -ItemType Directory -Force $w | Out-Null
Set-Location $w
foreach ($f in 'p01a.ps1', 'p01b.ps1') { Invoke-WebRequest ($base + $f) -OutFile $f -UseBasicParsing }
function global:sa { (Get-Clipboard -Raw) | Set-Content -Encoding UTF8 vstup.html; Write-Host ('ulozeno vstup.html ' + (Get-Item vstup.html).Length + ' B') }
function global:clipf([string]$n) { Set-Clipboard -Value ([IO.File]::ReadAllText((Resolve-Path $n), (New-Object Text.UTF8Encoding($false)))); Write-Host ('schranka = ' + $n + ' ' + (Get-Item $n).Length + ' B') }
function global:pa { powershell -ExecutionPolicy Bypass -File p01a.ps1 vstup.html }
function global:ca { clipf 'a136-CZ-v2026-11-23-tdt-vyjimky.html' }
function global:pbc { powershell -ExecutionPolicy Bypass -File p01b.ps1 cz vstup.html }
function global:pbs { powershell -ExecutionPolicy Bypass -File p01b.ps1 sk vstup.html }
function global:cbc { clipf 'c5711-CZ-v2026-11-23-tdt-program.html' }
function global:cbs { clipf 'c5711-SK-v2026-11-23-tdt-program.html' }
function global:ll { Get-ChildItem -File | ForEach-Object { $_.Name + ' ' + $_.Length + ' ' + (Get-FileHash $_.Name).Hash.Substring(0, 12) } }
Write-Host ('OK pripraveno v ' + $w + ' (sa, pa, ca, pbc, pbs, cbc, cbs, ll)')
