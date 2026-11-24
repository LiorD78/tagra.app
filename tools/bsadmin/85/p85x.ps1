# p85x.ps1 - bal. 85 p347914 (kulata patka misto "podstavec 2 x 5 cm"), patch ZIVE verze ze schranky. ASCII.
# Pouziti ve slozce balicku: powershell -ExecutionPolicy Bypass -File p85x.ps1 <czd|czs|skd|sks>
# czd/skd = 1. popis (ocekava zivou v1_2 z bal. 72s -> v1_2b), czs/sks = kratky popis (ocekava v2 z bal. 68s -> v3).
# Kazdy vzor musi sedet presne v ocekavanem poctu, po uprave 0x " 2 x 5 cm". Jinak STOP a schranka beze zmeny.
param([string]$k)
$ErrorActionPreference = 'Stop'
$enc = New-Object Text.UTF8Encoding($false)
function D($s) { $enc.GetString([Convert]::FromBase64String($s)) }
function Hx([string]$s) { $b = $enc.GetBytes($s); (([Security.Cryptography.SHA256]::Create().ComputeHash($b)) | ForEach-Object { $_.ToString('x2') }) -join '' }
$J = @{
  'czd' = @(@("Q1ogdjFfMiAoMjEuIDExLiAyMDI2LCBiYWwuIDcycw==","Q1ogdjFfMmIgKDIyLiAxMS4gMjAyNiwgYmFsLiA4NSDigJMga3VsYXTDoSBwYXRrYTsgesOha2xhZCB2MV8yIGJhbC4gNzJz",1),@("TmV1cGV2xYh1amUgc2Ug4oCTIG1vZGVsIGplbiBzdG9qw60gbmEgcG9kc3RhdmNpIDIgw5cgNSBjbS4=","TmV1cGV2xYh1amUgc2Ug4oCTIG1vZGVsIGplbiB2b2xuxJsgc3RvasOtIG5hIG1hbMOpIGt1bGF0w6kgcGF0Y2UgdsSbxb5lLg==",2),@("PHNwYW4gY2xhc3M9InNwLWQiPnBvZHN0YXZlYyAyIMOXIDUgY208L3NwYW4+","PHNwYW4gY2xhc3M9InNwLWQiPnbEm8W+IHMga3VsYXRvdSBwYXRrb3U8L3NwYW4+",1),@("PHRoIHNjb3BlPSJyb3ciPlBvZHN0YXZlYzwvdGg+PHRkPjIgw5cgNSBjbTwvdGQ+","PHRoIHNjb3BlPSJyb3ciPlBhdGthPC90aD48dGQ+bWFsw6Ega3VsYXTDoSBwYXRrYSB2xJvFvmU8L3RkPg==",1))
  'skd' = @(@("U0sgdjFfMiAoMjEuIDExLiAyMDI2LCBiYWwuIDcycw==","U0sgdjFfMmIgKDIyLiAxMS4gMjAyNiwgYmFsLiA4NSDigJMga3VsYXTDoSBwYXRrYTsgesOha2xhZCB2MV8yIGJhbC4gNzJz",1),@("TmV1cGV2xYh1amUgc2Eg4oCTIG1vZGVsIGxlbiBzdG9qw60gbmEgcG9kc3RhdmNpIDIgw5cgNSBjbS4=","TmV1cGV2xYh1amUgc2Eg4oCTIG1vZGVsIGxlbiB2b8S+bmUgc3RvasOtIG5hIG1hbGVqIG9rcsO6aGxlaiBww6R0a2UgdmXFvmUu",2),@("PHNwYW4gY2xhc3M9InNwLWQiPnBvZHN0YXZlYyAyIMOXIDUgY208L3NwYW4+","PHNwYW4gY2xhc3M9InNwLWQiPnZlxb5hIHMgb2tyw7pobG91IHDDpHRrb3U8L3NwYW4+",1),@("PHRoIHNjb3BlPSJyb3ciPlBvZHN0YXZlYzwvdGg+PHRkPjIgw5cgNSBjbTwvdGQ+","PHRoIHNjb3BlPSJyb3ciPlDDpHRrYTwvdGg+PHRkPm1hbMOhIG9rcsO6aGxhIHDDpHRrYSB2ZcW+ZTwvdGQ+",1))
  'czs' = @(@("Q1ogdjIgKDE5LiAxMS4gMjAyNg==","Q1ogdjMgKDIyLiAxMS4gMjAyNiwgYmFsLiA4NSDigJMga3VsYXTDoSBwYXRrYTsgesOha2xhZCB2MiAxOS4gMTEuIDIwMjY=",1),@("PC9zdHJvbmc+LCBzdG9qw60gbmEgcG9kc3RhdmNpIDIgw5cgNSBjbS4=","PC9zdHJvbmc+LCB2xJvFviBzdG9qw60gbmEgbWFsw6kga3VsYXTDqSBwYXRjZS4=",1))
  'sks' = @(@("U0sgdjIgKDE5LiAxMS4gMjAyNg==","U0sgdjMgKDIyLiAxMS4gMjAyNiwgYmFsLiA4NSDigJMga3VsYXTDoSBwYXRrYTsgesOha2xhZCB2MiAxOS4gMTEuIDIwMjY=",1),@("PC9zdHJvbmc+LCBzdG9qw60gbmEgcG9kc3RhdmNpIDIgw5cgNSBjbS4=","PC9zdHJvbmc+LCB2ZcW+YSBzdG9qw60gbmEgbWFsZWogb2tyw7pobGVqIHDDpHRrZS4=",1))
}
if (-not $J.ContainsKey($k)) { Write-Host ('STOP: neznamy klic ' + $k); exit 1 }
$t = Get-Clipboard -Raw
if (-not $t) { Write-Host 'STOP: schranka je prazdna'; exit 1 }
[IO.File]::WriteAllText((Join-Path $PWD ('zaloha_' + $k + '.html')), $t, $enc)
Write-Host ('IN znaku ' + $t.Length + ' sha ' + (Hx $t).Substring(0, 12) + ' -> zaloha_' + $k + '.html')
if (-not $t.StartsWith('<!--EXPERTMODE-->')) { Write-Host 'STOP: schranka nezacina <!--EXPERTMODE-->'; exit 1 }
$bad = 0
foreach ($p in $J[$k]) {
  $a = D $p[0]; $c = D $p[1]; $n = ([regex]::Matches($t, [regex]::Escape($a))).Count
  if ($n -ne [int]$p[2]) { Write-Host ('STOP: vzor ' + $a.Substring(0, [Math]::Min(40, $a.Length)) + ' nalezen ' + $n + 'x, ocekavano ' + $p[2]); $bad++ }
}
if ($bad -gt 0) { Write-Host 'STOP: nic neupraveno, schranka beze zmeny'; exit 1 }
foreach ($p in $J[$k]) { $t = $t.Replace((D $p[0]), (D $p[1])) }
$z = ([regex]::Matches($t, [regex]::Escape((D 'IDIgw5cgNSBjbQ==')))).Count
if ($z -ne 0) { Write-Host ('STOP: po uprave zustava 2 x 5 cm ' + $z + 'x'); exit 1 }
[IO.File]::WriteAllText((Join-Path $PWD ('out_' + $k + '.html')), $t, $enc)
Set-Clipboard -Value $t
Write-Host ('OUT OK znaku ' + $t.Length + ' sha ' + (Hx $t).Substring(0, 12) + ' - vysledek je ve schrance')
