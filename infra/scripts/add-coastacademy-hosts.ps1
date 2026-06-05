# Adiciona 127.0.0.1 coastacademy ao hosts do Windows. Requer Administrador.
$ErrorActionPreference = 'Stop'

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdmin) {
  Write-Host 'ERRO: execute como Administrador (ou use add-coastacademy-hosts.bat).' -ForegroundColor Red
  exit 1
}

$hostsPath = Join-Path $env:windir 'System32\drivers\etc\hosts'
$marker = 'coastacademy'

$lines = Get-Content $hostsPath -ErrorAction Stop
if ($lines -match '(?i)coastacademy') {
  Write-Host "Entrada '$marker' ja existe em $hostsPath"
} else {
  Add-Content -Path $hostsPath -Value "`n127.0.0.1 $marker" -Encoding ASCII
  Write-Host "Adicionado: 127.0.0.1 $marker"
}

ipconfig /flushdns | Out-Null
Write-Host 'DNS cache limpo.'

if (Test-Connection -ComputerName $marker -Count 1 -Quiet) {
  Write-Host "Ping $marker -> OK"
  Write-Host ''
  Write-Host 'Abra: http://coastacademy/login'
  exit 0
}

Write-Host "AVISO: ping em $marker falhou." -ForegroundColor Yellow
exit 1
