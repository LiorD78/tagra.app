# p01a.ps1 - bal. 2026-11-23-01a: a136 CZ +1 veta s odkazem na tdt.cz (vyjimky)
# Pouziti (cmd): powershell -ExecutionPolicy Bypass -File p01a.ps1 vstup.html
# vstup.html = aktualni obsah 1. popisu clanku a136 CZ zkopirovany z BSADMIN (Ctrl+A, Ctrl+C, pak: powershell -c "Get-Clipboard -Raw | Set-Content -Encoding UTF8 vstup.html")
# Vystup: a136-CZ-v2026-11-23-tdt-vyjimky.html (UTF-8 bez BOM, LF). Pri nesouladu sha NIC nevytvori -> STAV CHYBA.
param([string]$in = "vstup.html")
$ErrorActionPreference = "Stop"
$EXP_IN  = "d51b384d14a31cb5796ac62d86ca2342a386497ca9e0a30304c57a993ad35b3a"
$EXP_OUT = "ab6ef513012e886f4b60bdd776d3d0a39a03368534995ea2ccbdd8df30825c5e"
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Sha([string]$s) { $b = $utf8.GetBytes($s); $h = [System.Security.Cryptography.SHA256]::Create().ComputeHash($b); return (($h | ForEach-Object { $_.ToString("x2") }) -join "") }
$t = [System.IO.File]::ReadAllText((Resolve-Path $in), $utf8)
if ($t.Length -gt 0 -and $t[0] -eq [char]0xFEFF) { $t = $t.Substring(1) }
$t = $t.Replace("`r`n", "`n").TrimEnd()
$h = Sha $t
if ($h -ne $EXP_IN) { Write-Host "CHYBA: sha vstupu $h <> $EXP_IN (zivy obsah se lisi od v2026-11-09-a153tip)"; exit 1 }
$comment = "<!-- 23.11.2026 (bal. 2026-11-23-01): +1 veta s odkazem na tdt.cz/blog/kdy-tachograf-mit-nemusite-jak-prokazat v boxu Prakticky priklad (vlastni ucet). Jinak beze zmeny proti v2026-11-09-a153tip. -->`n"
$anchor = "CELEX%3A02006R0561-20240522`">EUR-Lex</a>.`n"
$ins = $utf8.GetString([Convert]::FromBase64String("ICAgICAgICAgICAgICAgICAgICAgICAgUMWZZWhsZWQgdsWhZWNoIHbDvWppbWVrIGkgcG9zdHVwLCBqYWsgamUgcMWZaSBrb250cm9sZSBkb2xvxb5pdCwgbmFqZGV0ZSB2IMSNbMOhbmt1IDxhIHJlbD0ibm9vcGVuZXIiIHRhcmdldD0iX2JsYW5rIiBocmVmPSJodHRwczovL3d3dy50ZHQuY3ovYmxvZy9rZHktdGFjaG9ncmFmLW1pdC1uZW11c2l0ZS1qYWstcHJva2F6YXQiPktkeSB0YWNob2dyYWYgbcOtdCBuZW11c8OtdGUgYSBqYWsgdG8gcHJva8OhemF0PC9hPiBuYSB3ZWJ1IHbDvXJvYmNlIHByb2dyYW11IFRBR1JBLgo="))
$first = "<!--EXPERTMODE-->`n"
if (-not $t.StartsWith($first)) { Write-Host "CHYBA: radek 1 neni EXPERTMODE"; exit 1 }
$i = $t.IndexOf($anchor)
if ($i -lt 0 -or $t.IndexOf($anchor, $i + 1) -ge 0) { Write-Host "CHYBA: kotva EUR-Lex neni presne 1x"; exit 1 }
$r = $first + $comment + $t.Substring($first.Length)
$j = $r.IndexOf($anchor) + $anchor.Length
$r = $r.Substring(0, $j) + $ins + $r.Substring($j)
$ho = Sha $r
if ($ho -ne $EXP_OUT) { Write-Host "CHYBA: sha vystupu $ho <> $EXP_OUT"; exit 1 }
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "a136-CZ-v2026-11-23-tdt-vyjimky.html"), $r, $utf8)
Write-Host "OK a136-CZ-v2026-11-23-tdt-vyjimky.html sha $ho"
