# p56b2.ps1 - bal. 56c B2: horni lista bez kodu INSTALACE50/INSTALACIA50 + perex novinky a151 CZ
# Pouziti (cmd, ve slozce skriptu):
#   powershell -ExecutionPolicy Bypass -File p56b2.ps1 lista cz   (vstup = obsah editoru Horni informacni listy CZ ve schrance)
#   powershell -ExecutionPolicy Bypass -File p56b2.ps1 lista sk
#   powershell -ExecutionPolicy Bypass -File p56b2.ps1 perex cz   (vstup = text perexu novinky a151 CZ)
# Vystup: OUT OK + vysledek ve schrance (a v souboru out-<mode>-<lang>.txt). Jinak STOP a nic do schranky.
param([string]$mode,[string]$lang)
$ErrorActionPreference='Stop'
function D($s){[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($s))}
function H($s){$h=[Security.Cryptography.SHA256]::Create();(($h.ComputeHash([Text.Encoding]::UTF8.GetBytes($s))|ForEach-Object{$_.ToString('x2')}) -join '')}
function C($t,$p){([regex]::Matches($t,[regex]::Escape($p))).Count}
$utf8=New-Object Text.UTF8Encoding($false)
$in=Get-Clipboard -Raw
if(-not $in){'STOP: schranka je prazdna';exit 1}
'IN  delka '+$in.Length+' sha '+(H $in)
[IO.File]::WriteAllText((Join-Path $PWD ('zaloha-'+$mode+'-'+$lang+'.txt')),$in,$utf8)
$out=$null
if($mode -eq 'lista'){
  if($lang -eq 'cz'){$lo=D 'KyBpbnN0YWxhY2UgRG93bmxvYWQgQm94IFJlbW90ZSB6YSBwb2xvdmludTwvc3Bhbj4=';$ln=D 'KyBpbnN0YWxhY2UgRG93bmxvYWQgQm94IFJlbW90ZSB6YSBwb2xvdmludSDigJMgc2xldmEgc2UgdiBrb8Whw61rdSBvZGXEjXRlIGF1dG9tYXRpY2t5PC9zcGFuPg=='}
  elseif($lang -eq 'sk'){$lo=D 'KyBpbsWhdGFsw6FjaWEgRG93bmxvYWQgQm94IFJlbW90ZSB6YSBwb2xvdmljdTwvc3Bhbj4=';$ln=D 'KyBpbsWhdGFsw6FjaWEgRG93bmxvYWQgQm94IFJlbW90ZSB6YSBwb2xvdmljdSDigJMgesS+YXZhIHNhIHYga2/FocOta3Ugb2Rwb8SNw610YSBhdXRvbWF0aWNreTwvc3Bhbj4='}
  else{'STOP: jazyk cz nebo sk';exit 1}
  $re='[ \t\r\n]*'+[char]0xB7+'[ \t\r\n]*k'+[char]0xF3+'d[ \t\r\n]*<button[^>]*tmx-tbdl__code[^>]*>INSTALAC(E|IA)50</button>'
  $n=([regex]::Matches($in,$re)).Count
  if($n -ne 1){'STOP: blok s kodem nalezen '+$n+'x (ocekavano 1x) - live verze je jina';exit 1}
  if((C $in $lo) -ne 1){'STOP: text instalace (span long) nalezen '+(C $in $lo)+'x (ocekavano 1x)';exit 1}
  if((C $in 'id="tmx-tbdl-akce"') -ne 1 -or (C $in 'id="tmx-topbar-count"') -ne 1){'STOP: chybi id tmx-tbdl-akce / tmx-topbar-count';exit 1}
  $out=[regex]::Replace($in,$re,'')
  $out=$out.Replace($lo,$ln)
  if((C $out 'tmx-tbdl__code') -ne 0 -or (C $out "writeText('INSTALAC") -ne 0){'STOP: ve vysledku zustava tlacitko kodu - nic nevkladat, zapsat CHYBA';exit 1}
  if((C $out 'id="tmx-topbar-count"') -ne 1){'STOP: po uprave chybi tmx-topbar-count';exit 1}
  if(-not $out.StartsWith('<!--EXPERTMODE-->')){'POZOR: vstup nezacina <!--EXPERTMODE--> (zkontrolovat, ze byl vybran cely editor)'}
}
elseif($mode -eq 'perex' -and $lang -eq 'cz'){
  $po=D 'IHMga8OzZGVtIElOU1RBTEFDRTUw'
  if((C $in $po) -ne 1){'STOP: " s kodem INSTALACE50" nalezeno '+(C $in $po)+'x (ocekavano 1x)';exit 1}
  $out=$in.Replace($po,'')
}
else{'STOP: neznamy rezim (lista cz|lista sk|perex cz)';exit 1}
'OUT delka '+$out.Length+' sha '+(H $out)
[IO.File]::WriteAllText((Join-Path $PWD ('out-'+$mode+'-'+$lang+'.txt')),$out,$utf8)
Set-Clipboard -Value $out
'OUT OK - vysledek je ve schrance'
