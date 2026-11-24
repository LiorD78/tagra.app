# s.ps1 - polozky ze seq.txt (n|pid|druh|gN|text) postupne do schranky; posun az po kontrolni kopii (text + mezera)
param([int]$s = 1, [int]$e = 0)
Add-Type -AssemblyName System.Windows.Forms
$L = [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'seq.txt'), (New-Object Text.UTF8Encoding($false)))
$M = @{}
foreach ($l in $L) { $p = $l.Split([char]124); if ($p.Count -ge 5) { $M[[int]$p[0]] = $p } }
if ($e -lt $s) { $e = $M.Count }
Write-Host ('polozek ' + $M.Count)
for ($k = $s; $k -le $e; $k++) {
  $it = $M[$k]
  if (-not $it) { Write-Host ('chybi ' + $k); break }
  $x = $it[4]
  [Windows.Forms.Clipboard]::SetText($x)
  Write-Host ('[' + $k + '] ' + $it[1] + ' ' + $it[2] + ' ' + $it[3] + ' : ' + $x)
  $mk = $x + ' '
  do { Start-Sleep -Milliseconds 200; $c2 = $x ; try { $c2 = [Windows.Forms.Clipboard]::GetText() } catch { }; if ($c2 -ne $x -and $c2 -ne $mk) { try { [Windows.Forms.Clipboard]::SetText($x) } catch { } } } while ($c2 -ne $mk)
  Write-Host '   ok'
  Start-Sleep -Milliseconds 300
}
Write-Host ('HOTOVO ' + $s + '-' + $e)
