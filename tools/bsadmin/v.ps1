# v.ps1 - obecny pomocnik pro nasazeni v BSADMIN (TDT-RDSH). Spousti se z cmd: b <akce> [arg...]
# Jednorazove: curl -sSo v.ps1 https://raw.githubusercontent.com/LiorD78/tagra.app/main/tools/bsadmin/v.ps1
#              powershell -ep bypass -f v.ps1 init      (prepise %USERPROFILE%\b.bat na v.ps1)
# Akce:  up            = aktualizace v.ps1 (obejde cache)
#        pkg <nazev>   = stahne balicek tools/bsadmin/<nazev>/ podle files.txt (alias soubor), overi sha256.txt
#        sv <alias|soubor> = schranka -> soubor (zaloha / vstup)
#        cl <alias|soubor> = soubor -> schranka
#        ps <alias|skript> [arg...] = spusti PowerShell skript balicku v jeho slozce
#        ll            = seznam souboru aktualniho balicku + sha
param([string]$akce = 'll', [string]$a1 = '', [string]$a2 = '', [string]$a3 = '')
$ErrorActionPreference = 'Stop'
$base = 'https://raw.githubusercontent.com/LiorD78/tagra.app/main/tools/bsadmin/'
$root = Join-Path $env:TEMP '7\oci'
New-Item -ItemType Directory -Force $root | Out-Null
$curf = Join-Path $root 'cur.txt'
$utf8 = New-Object Text.UTF8Encoding($false)
function Bust([string]$u) { return $u + [char]63 + 't' + [char]61 + [DateTime]::UtcNow.Ticks }
function Dl([string]$u, [string]$f) { Invoke-WebRequest (Bust $u) -OutFile $f -UseBasicParsing -Headers @{ 'Cache-Control' = 'no-cache' } }
function Cur { if (-not (Test-Path $curf)) { throw 'neni zvolen balicek (b pkg <nazev>)' }; return (Get-Content $curf -Raw).Trim() }
function Dir2 { $d = Join-Path $root (Cur); Set-Location $d; return $d }
function Res([string]$x) {
  $m = 'files.txt'
  if (Test-Path $m) { foreach ($l in Get-Content $m) { $p = $l.Trim() -split '\s+', 2; if ($p.Count -eq 2 -and $p[0] -eq $x) { return $p[1] } } }
  return $x
}
function Sha([string]$f) { return (Get-FileHash $f -Algorithm SHA256).Hash.ToLower() }
switch ($akce) {
  'init' {
    Set-Content -Path (Join-Path $env:USERPROFILE 'b.bat') -Encoding ASCII -Value '@powershell -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\v.ps1" %*'
    Write-Host 'OK b.bat -> v.ps1'
  }
  'up' { Dl ($base + 'v.ps1') (Join-Path $env:USERPROFILE 'v.ps1'); Write-Host ('OK v.ps1 aktualizovan ' + (Sha (Join-Path $env:USERPROFILE 'v.ps1')).Substring(0, 12)) }
  'pkg' {
    if (-not $a1) { throw 'chybi nazev balicku' }
    $d = Join-Path $root $a1
    New-Item -ItemType Directory -Force $d | Out-Null
    Set-Location $d
    Set-Content -Path $curf -Value $a1 -Encoding ASCII
    $pb = $base + $a1 + '/'
    Dl ($pb + 'files.txt') 'files.txt'
    $ok = $true
    foreach ($l in Get-Content 'files.txt') {
      $p = $l.Trim() -split '\s+', 2
      if ($p.Count -ne 2) { continue }
      Dl ($pb + $p[1]) $p[1]
    }
    try { Dl ($pb + 'sha256.txt') 'sha256.txt' } catch { }
    if (Test-Path 'sha256.txt') {
      foreach ($l in Get-Content 'sha256.txt') {
        $p = $l.Trim() -split '\s+', 2
        if ($p.Count -ne 2) { continue }
        $f = $p[1].TrimStart('*')
        if (-not (Test-Path $f)) { continue }
        $h = Sha $f
        if ($h -eq $p[0].ToLower()) { Write-Host ('sha OK   ' + $f) } else { Write-Host ('sha CHYBA ' + $f + ' ' + $h); $ok = $false }
      }
    }
    Get-Content 'files.txt' | ForEach-Object { Write-Host ('  ' + $_) }
    if ($ok) { Write-Host ('OK balicek ' + $a1 + ' v ' + $d) } else { Write-Host 'CHYBA: sha nesedi - NIC NEVKLADAT' }
  }
  'sv' { $d = Dir2; $f = Res $a1; (Get-Clipboard -Raw) | Set-Content -Encoding UTF8 $f; $t = [IO.File]::ReadAllText((Resolve-Path $f), $utf8); $z = $t.Substring(0, [Math]::Min(60, $t.Length)).Replace("`r", ' ').Replace("`n", ' '); Write-Host ('ulozeno ' + $f + ' znaku ' + $t.Length + ' | ' + $z) }
  'cl' { $d = Dir2; $f = Res $a1; Set-Clipboard -Value ([IO.File]::ReadAllText((Resolve-Path $f), $utf8)); Write-Host ('schranka = ' + $f + ' ' + (Get-Item $f).Length + ' B sha ' + (Sha $f).Substring(0, 12)) }
  'ps' { $d = Dir2; $f = Res $a1; $args2 = @($a2, $a3) | Where-Object { $_ }; & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $d $f) @args2 }
  'll' { $d = Dir2; Write-Host ('balicek ' + (Cur)); Get-ChildItem -File | ForEach-Object { $_.Name + ' ' + $_.Length + ' ' + (Sha $_.Name).Substring(0, 12) } }
  default { Write-Host ('neznama akce ' + $akce) }
}
