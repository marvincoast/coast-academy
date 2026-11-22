<#
.SYNOPSIS
  Coast Academy - Instalador e Launcher Unificado para Windows (via WSL 2)
.DESCRIPTION
  Inicia Docker Desktop (se instalado), traduz o caminho do repositorio para WSL 2,
  executa infra/scripts/setup-and-run.sh no Ubuntu/WSL e abre os paineis no navegador.
#>

$ErrorActionPreference = "Stop"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  Coast Academy - Setup e Execucao Local (Windows -> WSL 2)" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Inicia Docker Desktop no Windows se estiver instalado
$dockerDesktop = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerDesktop) {
    $running = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $running) {
        Write-Host "==> Iniciando Docker Desktop no Windows..." -ForegroundColor Yellow
        Start-Process -FilePath $dockerDesktop
        Write-Host "    Aguardando Docker Desktop ficar pronto (15s)..." -ForegroundColor Gray
        Start-Sleep -Seconds 15
    } else {
        Write-Host "[OK] Docker Desktop ja esta aberto." -ForegroundColor Green
    }
}

# 2. Verifica se WSL 2 esta disponivel
$wslCmd = Get-Command wsl -ErrorAction SilentlyContinue
if (-not $wslCmd) {
    Write-Host "[ERRO] WSL 2 nao encontrado neste Windows." -ForegroundColor Red
    Write-Host "Abra o PowerShell como Administrador e execute: wsl --install -d Ubuntu" -ForegroundColor Yellow
    exit 1
}

# 3. Resolve a raiz do repositorio coast-academy (dois niveis acima de infra\scripts)
$repoWin = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$drive = $repoWin.Substring(0, 1).ToLower()
$rest = ($repoWin.Substring(2) -replace '\\', '/')
$wslRepo = "/mnt/$drive$rest"
$wslScript = "$wslRepo/infra/scripts/setup-and-run.sh"

Write-Host "==> Repositorio Windows: $repoWin" -ForegroundColor Blue
Write-Host "==> Repositorio WSL:     $wslRepo" -ForegroundColor Blue
Write-Host "==> Executando infra/scripts/setup-and-run.sh no WSL 2..." -ForegroundColor Blue
Write-Host ""

# 4. Normaliza CRLF -> LF no setup-and-run.sh antes de invocar o bash
$localSh = Join-Path $PSScriptRoot "setup-and-run.sh"
if (Test-Path $localSh) {
    $raw = [System.IO.File]::ReadAllText($localSh)
    [System.IO.File]::WriteAllText($localSh, ($raw -replace "`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
}

# 5. Executa dentro do WSL 2
& wsl.exe bash $wslScript
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "[OK] Abrindo todos os paineis no navegador..." -ForegroundColor Green
    Start-Process "http://localhost"
    Start-Process "http://localhost:54324"
    Start-Process "http://localhost:54323"
    Start-Process "http://localhost:3001"
    Start-Process "http://localhost:3002"
    Start-Process "http://localhost:9090"
    Start-Process "http://localhost:12345"
} else {
    Write-Host ""
    Write-Host "[ERRO] O script retornou codigo $exitCode. Verifique as mensagens acima." -ForegroundColor Red
    exit $exitCode
}