# p01b.ps1 - bal. 2026-11-23-01b: c5711 CZ/SK +1 veta s odkazem na program TAGRA na tdt.cz / tdt.sk
# Pouziti (cmd): powershell -ExecutionPolicy Bypass -File p01b.ps1 cz vstup-cz.html   (resp. sk vstup-sk.html)
# vstup = aktualni uzivatelsky obsah kategorie c5711 v danem jazyce zkopirovany z BSADMIN (Ctrl+A, Ctrl+C, pak: powershell -c "Get-Clipboard -Raw | Set-Content -Encoding UTF8 vstup-cz.html")
# Vystup: c5711-CZ|SK-v2026-11-23-tdt-program.html (UTF-8 bez BOM, LF). Pri nesouladu sha NIC nevytvori -> STAV CHYBA.
param([string]$lang = "cz", [string]$in = "vstup.html")
$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Sha([string]$s) { $b = $utf8.GetBytes($s); $h = [System.Security.Cryptography.SHA256]::Create().ComputeHash($b); return (($h | ForEach-Object { $_.ToString("x2") }) -join "") }
function B64([string]$s) { return $utf8.GetString([Convert]::FromBase64String($s)) }
if ($lang -eq "cz") {
  $EXP_IN  = "476a565bbc11095fca5e2a7bf63596df6b31c909ed520633c28942dd2a1b7ef3"
  $EXP_OUT = "8e2f253c7d2af9571b87ff492f243ba749fb5b7ab55171efc3b8b5fde89c0f7e"
  $anchor  = B64 "YzU3MjAvIj5Qcm9ncmFtIFRBR1JBPC9hPiDigJMgaGxhdm7DrSBwcm9ncmFtIHBybyBrb250cm9sdSBkYXQgeiB0YWNob2dyYWbFryBhIGthcmV0IMWZaWRpxI3Fry4="
  $ins     = B64 "IFBvZHJvYm7DvSBwb3BpcyBmdW5rY8OtIG5hamRldGUgbmEgc3Ryw6FuY2UgPGEgcmVsPSJub29wZW5lciIgdGFyZ2V0PSJfYmxhbmsiIGhyZWY9Imh0dHBzOi8vd3d3LnRkdC5jei9jZXNreS1wcm9ncmFtLXRhZ3JhIj5wcm9ncmFtdSBUQUdSQSBvZCB2w71yb2JjZTwvYT4u"
  $comment = "<!-- 23.11.2026 (bal. 2026-11-23-01b): +1 veta s odkazem na tdt.cz/cesky-program-tagra v karte Jak data vyhodnotit (polozka Program TAGRA). Jinak beze zmeny proti v2026-11-09-a153tip. -->`n"
  $outName = "c5711-CZ-v2026-11-23-tdt-program.html"
} elseif ($lang -eq "sk") {
  $EXP_IN  = "9cf1d857d5de8b307f5b9dcde5c74d63b39cc5e730649de5b193b61fd6ec21f3"
  $EXP_OUT = "4dd19f3ec262136da1cf0983e22aa30654a930353a6ac4b18d481d6d3e9e37ed"
  $anchor  = B64 "YzU3MjAvIj5Qcm9ncmFtIFRBR1JBPC9hPiDigJMgaGxhdm7DvSBwcm9ncmFtIG5hIGtvbnRyb2x1IGTDoXQgeiB0YWNob2dyYWZvdiBhIGthcmlldCB2b2RpxI1vdi4="
  $ins     = B64 "IFBvZHJvYm7DvSBwb3BpcyBmdW5rY2nDrSBuw6FqZGV0ZSBuYSBzdHLDoW5rZSA8YSByZWw9Im5vb3BlbmVyIiB0YXJnZXQ9Il9ibGFuayIgaHJlZj0iaHR0cHM6Ly93d3cudGR0LnNrL2Nlc2tvLXNsb3ZlbnNreS1wcm9ncmFtLXRhZ3JhIj5wcm9ncmFtdSBUQUdSQSBvZCB2w71yb2JjdTwvYT4u"
  $comment = "<!-- 23.11.2026 (bal. 2026-11-23-01b): +1 veta s odkazem na tdt.sk/cesko-slovensky-program-tagra v karte Jak data vyhodnotit (polozka Program TAGRA). Jinak beze zmeny proti v2026-11-09-a153tip. -->`n"
  $outName = "c5711-SK-v2026-11-23-tdt-program.html"
} else { Write-Host "CHYBA: jazyk cz|sk"; exit 1 }
$t = [System.IO.File]::ReadAllText((Resolve-Path $in), $utf8)
if ($t.Length -gt 0 -and $t[0] -eq [char]0xFEFF) { $t = $t.Substring(1) }
$t = $t.Replace("`r`n", "`n").TrimEnd()
$h = Sha $t
if ($h -ne $EXP_IN) { Write-Host "CHYBA: sha vstupu $h <> $EXP_IN (zivy obsah se lisi od v2026-11-09-a153tip)"; exit 1 }
$first = "<!--EXPERTMODE-->`n"
if (-not $t.StartsWith($first)) { Write-Host "CHYBA: radek 1 neni EXPERTMODE"; exit 1 }
$i = $t.IndexOf($anchor)
if ($i -lt 0 -or $t.IndexOf($anchor, $i + 1) -ge 0) { Write-Host "CHYBA: kotva neni presne 1x"; exit 1 }
$r = $first + $comment + $t.Substring($first.Length)
$j = $r.IndexOf($anchor) + $anchor.Length
$r = $r.Substring(0, $j) + $ins + $r.Substring($j)
$ho = Sha $r
if ($ho -ne $EXP_OUT) { Write-Host "CHYBA: sha vystupu $ho <> $EXP_OUT"; exit 1 }
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $outName), $r, $utf8)
Write-Host "OK $outName sha $ho"
