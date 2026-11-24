# c.ps1 - kontrola existence souboru PATH z q.txt
$L = [IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'q.txt'), (New-Object Text.UTF8Encoding($false)))
$ok = 0; $bad = 0
foreach ($l in $L) { $p = $l.Split([char]124); if ($p.Count -ge 5 -and $p[2] -eq 'PATH') { $f = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p[4])); if (Test-Path -LiteralPath $f) { $ok++ } else { $bad++; Write-Host ('CHYBI ' + $p[1] + ' ' + $p[3] + ' ' + $f) } } }
Write-Host ('OK ' + $ok + ' CHYBI ' + $bad)
