# r.ps1 S E [cesta] - polozky S..E z q.txt (n|pid|jazyk|druh|base64) postupne do schranky; dalsi polozka az kdyz schranka = DALSI (Z = zpet o 1, KONEC = konec)
param([int]$s = 1, [int]$e = 0, [string]$q = '\\tdt0003\BSSHOP\texty\68f1\q.txt')
Add-Type -AssemblyName System.Windows.Forms
$L = [IO.File]::ReadAllLines($q, (New-Object Text.UTF8Encoding($false)))
$M = @{}
foreach ($l in $L) { $p = $l.Split([char]124); if ($p.Count -ge 5) { $M[[int]$p[0]] = $p } }
if ($e -lt $s) { $e = $M.Count }
Write-Host ('polozek ' + $M.Count + ', jedu ' + $s + '-' + $e)
$k = $s
while ($k -le $e) {
  $it = $M[$k]
  if (-not $it) { Write-Host ('chybi ' + $k); break }
  $x = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($it[4]))
  [Windows.Forms.Clipboard]::SetText($x)
  $z = $x; if ($z.Length -gt 60) { $z = $z.Substring(0, 60) }
  Write-Host ('[' + $k + '] ' + $it[1] + ' ' + $it[2] + ' ' + $it[3] + ' delka ' + $x.Length + ' : ' + ($z -replace "`r`n", ' / '))
  $c = ''
  do { Start-Sleep -Milliseconds 300; try { $c = [Windows.Forms.Clipboard]::GetText().Trim() } catch { $c = '' } } while ($c -ne 'DALSI' -and $c -ne 'Z' -and $c -ne 'KONEC')
  if ($c -eq 'KONEC') { break }
  if ($c -eq 'Z') { $k = [Math]::Max($s, $k - 1) } else { $k++ }
}
Write-Host 'HOTOVO r'
