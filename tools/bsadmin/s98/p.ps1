# p.ps1 N - polozku N z q.txt (n|pid|jazyk|druh|base64 UTF-8) vlozi do schranky a overi zpetnym ctenim
param([int]$n = 1)
Add-Type -AssemblyName System.Windows.Forms
$q = '\\tdt0003\BSSHOP\texty\68f23\q.txt'
$L = [IO.File]::ReadAllLines($q, (New-Object Text.UTF8Encoding($false)))
$it = $null
foreach ($l in $L) { $p = $l.Split([char]124); if ($p.Count -ge 5 -and [int]$p[0] -eq $n) { $it = $p } }
if (-not $it) { Write-Host ('CHYBI polozka ' + $n); exit 1 }
$x = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($it[4]))
[Windows.Forms.Clipboard]::SetText($x)
Start-Sleep -Milliseconds 300
$c = [Windows.Forms.Clipboard]::GetText()
$ok = 'NE'; if ($c -eq $x) { $ok = 'ANO' }
$h = [BitConverter]::ToString((New-Object Security.Cryptography.SHA256Managed).ComputeHash([Text.Encoding]::UTF8.GetBytes($x))).Replace('-', '').Substring(0, 12).ToLower()
$z = $x; if ($z.Length -gt 70) { $z = $z.Substring(0, 70) }
Write-Host ('[' + $n + '] ' + $it[1] + ' ' + $it[2] + ' ' + $it[3] + ' delka ' + $x.Length + ' sha ' + $h + ' schranka ' + $ok)
Write-Host ('    ' + ($z -replace "`r`n", ' / '))
