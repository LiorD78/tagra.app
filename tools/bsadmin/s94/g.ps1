# g.ps1 jmeno - ulozi aktualni obsah schranky jako zalohu do \\tdt0003\BSSHOP\texty\68f1\zaloha\jmeno.html
param([string]$jm = 'zaloha')
Add-Type -AssemblyName System.Windows.Forms
$d = '\\tdt0003\BSSHOP\texty\68f1\zaloha'
New-Item -ItemType Directory -Force $d | Out-Null
$c = [Windows.Forms.Clipboard]::GetText()
$f = Join-Path $d ($jm + '.html')
[IO.File]::WriteAllText($f, $c, (New-Object Text.UTF8Encoding($false)))
$z = $c; if ($z.Length -gt 90) { $z = $z.Substring(0, 90) }
Write-Host ('ZALOHA ' + $f + ' delka ' + $c.Length)
Write-Host ('    ' + ($z -replace "`r`n", ' / '))
