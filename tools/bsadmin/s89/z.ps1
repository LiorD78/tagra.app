# z.ps1 - stahne zipy z Google Drive (sdilene odkazem) podle zips.txt (id sha256 cilova_slozka), overi sha256 a rozbali
$ErrorActionPreference = 'Stop'
$d = $PSScriptRoot
foreach ($l in Get-Content (Join-Path $d 'zips.txt')) {
  $p = $l.Trim() -split '\s+', 3
  if ($p.Count -lt 3) { continue }
  $f = Join-Path $env:TEMP ($p[0] + '.zip')
  $u = 'https://drive.usercontent.google.com/download?id=' + $p[0] + [char]38 + 'export=download' + [char]38 + 'confirm=t'
  Invoke-WebRequest $u -OutFile $f -UseBasicParsing
  $h = (Get-FileHash $f -Algorithm SHA256).Hash.ToLower()
  if ($h -ne $p[1]) { Write-Host ('CHYBA sha ' + $p[0] + ' ' + $h.Substring(0, 12) + ' <> ' + $p[1].Substring(0, 12) + ' (' + (Get-Item $f).Length + ' B)'); continue }
  New-Item -ItemType Directory -Force $p[2] | Out-Null
  Expand-Archive -Path $f -DestinationPath $p[2] -Force
  $n = (Get-ChildItem $p[2] -File).Count
  Write-Host ('OK ' + $p[0].Substring(0, 8) + ' -> ' + $p[2] + ' (souboru ve slozce ' + $n + ')')
}
Write-Host 'HOTOVO z'
