# a.ps1 - postupne vklada alty do schranky; dalsi az po zmene schranky (kontrolni kopie s mezerou)
param([int]$s = 1, [int]$e = 0)
Add-Type -AssemblyName System.Windows.Forms
if ($e -lt $s) { $e = $s }
$L = [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'alts.txt'), (New-Object Text.UTF8Encoding($false)))
$m = @{}
foreach ($l in $L) { $p = $l.Split([char]124); if ($p.Count -ge 5) { $m[[int]$p[0]] = $p } }
for ($k = $s; $k -le $e; $k++) {
  $p = $m[$k]
  if (-not $p) { Write-Host ('chybi radek ' + $k); break }
  $t = $p[4]
  [Windows.Forms.Clipboard]::SetText($t)
  Write-Host ('[' + $k + '] ' + $p[1] + ' ' + $p[2] + ' ' + $p[3] + ' : ' + $t)
  do { Start-Sleep -Milliseconds 200; $c = $t ; try { $c = [Windows.Forms.Clipboard]::GetText() } catch { } } while ($c -eq $t)
  Write-Host '   ok'
  Start-Sleep -Milliseconds 300
}
Write-Host ('HOTOVO ' + $s + '-' + $e)
