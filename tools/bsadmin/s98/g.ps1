# g.ps1 cislo - ulozi aktualni obsah schranky jako zalohu do \\tdt0003\BSSHOP\texty\68f23\zaloha\zN.html
param([int]$n = 0)
Add-Type -AssemblyName System.Windows.Forms
$d = '\\tdt0003\BSSHOP\texty\68f23\zaloha'
New-Item -ItemType Directory -Force $d | Out-Null
$c = [Windows.Forms.Clipboard]::GetText()
$f = Join-Path $d ('z' + $n + '.html')
[IO.File]::WriteAllText($f, $c, (New-Object Text.UTF8Encoding($false)))
$z = $c; if ($z.Length -gt 90) { $z = $z.Substring(0, 90) }
Write-Host ('ZALOHA ' + $f + ' delka ' + $c.Length)
Write-Host ('    ' + ($z -replace "`r`n", ' / '))
