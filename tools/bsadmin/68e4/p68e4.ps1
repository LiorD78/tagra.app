# 68e-4: audit p377710 LED oci par - patch zive verze 1. popisu (H2 36px bez verzalek, ikony misto fajfek v cipech). ASCII skript, pravidla v p68e4-rules-CZ.json / -SK.json (UTF-8).
# Pouziti: BSADMIN Id 377710 vlajka CZ (resp. SK) -> 1. Popis produktu -> Zobrazit -> Zdrojovy kod -> Ctrl+A, Ctrl+C;
# v cmd ve slozce se skriptem: powershell -ExecutionPolicy Bypass -File p68e4.ps1 cz   (resp. sk)
# Vystup: schranka + soubor p377710-popis-CZ-v2_2.html (resp. SK). Pri GUARD/POST FAIL se nic nemeni (exit 1).
param([string]$lang = '')
$ErrorActionPreference = 'Stop'
$L = $lang.ToUpper()
if ($L -ne 'CZ' -and $L -ne 'SK') { Write-Host 'CHYBA: parametr cz nebo sk'; exit 1 }
function H($t) { $sha = [Security.Cryptography.SHA256]::Create(); (($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($t)) | ForEach-Object { $_.ToString('x2') }) -join '') }
$j = [IO.File]::ReadAllText((Join-Path $PSScriptRoot ('p68e4-rules-' + $L + '.json')), [Text.Encoding]::UTF8) | ConvertFrom-Json
$s = Get-Clipboard -Raw
if (-not $s) { Write-Host 'CHYBA: schranka je prazdna'; exit 1 }
if (-not $s.Contains('LED oci par ' + $L)) { Write-Host ('CHYBA: ve schrance neni popis p377710 ' + $L); exit 1 }
Write-Host ('VSTUP  len=' + $s.Length + ' sha256=' + (H $s))
$i = 0
foreach ($r in $j.rules) {
  $i++
  $c = [regex]::Matches($s, $r.p).Count
  if ($c -ne [int]$r.n) { Write-Host ('GUARD FAIL pravidlo ' + $i + ': nalezeno ' + $c + ', ocekavano ' + $r.n + ' -> nic se nemeni'); exit 1 }
  $s = [regex]::Replace($s, $r.p, $r.r.Replace('$', '$$'))
}
if (-not $s.StartsWith('<!--EXPERTMODE-->')) { $s = "<!--EXPERTMODE-->`r`n" + $s }
foreach ($q in $j.post) { if ($s.Contains($q)) { Write-Host ('POST FAIL: v textu zustalo: ' + $q); exit 1 } }
[IO.File]::WriteAllText((Join-Path (Get-Location) $j.out), $s, (New-Object Text.UTF8Encoding $false))
Set-Clipboard -Value $s
Write-Host ('VYSTUP len=' + $s.Length + ' sha256=' + (H $s) + ' pravidel=' + $i + ' OK -> ve schrance')
