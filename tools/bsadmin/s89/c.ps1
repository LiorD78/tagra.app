# c.ps1 - kontrola existence souboru PATH ze seq.txt
$L = [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'seq.txt'), (New-Object Text.UTF8Encoding($false)))
$ok = 0; $bad = 0
foreach ($l in $L) { $p = $l.Split([char]124); if ($p.Count -ge 5 -and $p[2] -eq 'PATH') { if (Test-Path -LiteralPath $p[4]) { $ok++ } else { $bad++; Write-Host ('CHYBI ' + $p[1] + ' ' + $p[3] + ' ' + $p[4]) } } }
Write-Host ('OK ' + $ok + ' CHYBI ' + $bad)
