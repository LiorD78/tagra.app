# p56cx.ps1 - pomocny grab pro p56c.ps1: schranka -> zaloha_<k>.html v takove normalizaci konce radku, aby sedela sha vstupu z API.
# Pouziti (ve slozce balicku): powershell -ExecutionPolicy Bypass -File p56cx.ps1 <czd|czs|skd|sks>
param([string]$k)
$ErrorActionPreference = 'Stop'
$IN = @{ 'czd' = 'bd06bee764b778dfe80fb9e3340f883617e78f2b5a9673bd38bdf025b0d56a9e'; 'czs' = '8c3d1ee29e1c8f0c6eb68ab7c7d7acebb459d089767e2f8f2455c13df46a4c5a'; 'skd' = '6ff6546f8544fa258185bdb9d50131854e18eff20cac022c9a3fd72227954456'; 'sks' = '9b344426d3eb703cb5a39aa96d9e372cada96529010b259447183eb99a7ebf5e' }
if (-not $IN.ContainsKey($k)) { Write-Host ('STOP: neznamy klic ' + $k); exit 1 }
$enc = New-Object Text.UTF8Encoding($false)
function H([string]$s) { $b = $enc.GetBytes($s); (([Security.Cryptography.SHA256]::Create().ComputeHash($b)) | ForEach-Object { $_.ToString('x2') }) -join '' }
$t = Get-Clipboard -Raw
if (-not $t) { Write-Host 'STOP: schranka je prazdna'; exit 1 }
if ($t[0] -eq [char]0xFEFF) { $t = $t.Substring(1) }
$lf = $t.Replace("`r`n", "`n")
$cands = [ordered]@{ 'beze zmeny' = $t; 'LF' = $lf; 'LF+trim' = $lf.TrimEnd(); 'LF+trim+nl' = ($lf.TrimEnd() + "`n"); 'trim' = $t.TrimEnd(); 'CRLF' = $lf.Replace("`n", "`r`n") }
foreach ($n in $cands.Keys) {
  $s = $cands[$n]
  if ((H $s) -eq $IN[$k]) {
    [IO.File]::WriteAllText((Join-Path $PWD ('zaloha_' + $k + '.html')), $s, $enc)
    Write-Host ('IN OK (' + $n + ') zaloha_' + $k + '.html znaku ' + $s.Length)
    exit 0
  }
}
[IO.File]::WriteAllText((Join-Path $PWD ('zaloha_' + $k + '-zive.html')), $t, $enc)
Write-Host ('IN MISMATCH - zive se lisi od API 22. 11. (ulozeno zaloha_' + $k + '-zive.html, znaku ' + $t.Length + ', LF sha ' + (H $lf).Substring(0, 12) + ')')
exit 1
