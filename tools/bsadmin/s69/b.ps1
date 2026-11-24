# b.ps1 - sekvence pro obnovu galerii Poppy stromecek: na kartu 4 cesty (g4,g3,g2,g1) + 4 alty CZ + 4 alty SK
# do schranky postupne; dalsi polozka az po zmene schranky (kontrolni kopie s mezerou)
param([int]$s = 1, [int]$e = 0)
Add-Type -AssemblyName System.Windows.Forms
$u = New-Object Text.UTF8Encoding($false)
$A = [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'alts.txt'), $u)
$m = @{}
foreach ($l in $A) { $p = $l.Split([char]124); if ($p.Count -ge 5) { if (-not $m.ContainsKey($p[1])) { $m[$p[1]] = @() }; $m[$p[1]] += ,$p } }
$C = @('323095 vanilla', '323094 strawberry', '323093 jasmin', '323910 citrus', '360362 frost-ice', '360358 blue-berry', '323091 freesia', '323906 levander', '360361 coconut', '323907 cattleya', '360360 real-leather', '323909 gardenia', '360363 cold-steel', '323905 hibiscus', '360359 ocean-breeze', '323908 pine')
$T = @('', '1-studio', '2-detail', '3-kabina', '4-darek')
$Q = @()
foreach ($c in $C) {
  $id, $sl = $c.Split(' ')
  foreach ($g in 4, 3, 2, 1) { $Q += ,@($id, 'PATH', ('g' + $g), ('\\tdt0003\BSSHOP\Obrazky\poppy-stromecek-v1\poppy-stromecek-' + $sl + '-' + $T[$g] + '-v1.webp')) }
  foreach ($p in $m[$id]) { $Q += ,@($p[1], $p[2], $p[3], $p[4]) }
}
Write-Host ('polozek ' + $Q.Count)
if ($e -lt $s) { $e = $Q.Count }
for ($k = $s; $k -le $e; $k++) {
  $q = $Q[$k - 1]
  $t = $q[3]
  [Windows.Forms.Clipboard]::SetText($t)
  Write-Host ('[' + $k + '] ' + $q[0] + ' ' + $q[1] + ' ' + $q[2] + ' : ' + $t)
  do { Start-Sleep -Milliseconds 200; $c2 = $t ; try { $c2 = [Windows.Forms.Clipboard]::GetText() } catch { } } while ($c2 -eq $t)
  Write-Host '   ok'
  Start-Sleep -Milliseconds 300
}
Write-Host ('HOTOVO ' + $s + '-' + $e)
