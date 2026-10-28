<#
.SYNOPSIS
    Prepara um PC Windows para desenvolver e operar o GOATBOT.

.DESCRIPTION
    Confere o Node, instala dependências, troca binários nativos que vieram do
    Linux (sharp), instala ffmpeg e yt-dlp pelo winget se faltarem, cria o .env
    a partir do exemplo e roda a suíte de testes. Pode rodar de novo sem medo.

.EXAMPLE
    .\scripts\setup-windows.ps1
    .\scripts\setup-windows.ps1 -SemTestes
#>
param([switch]$SemTestes)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Test-Comando([string]$Nome) { [bool](Get-Command $Nome -ErrorAction SilentlyContinue) }

# 1. Node >= 22.5 (o banco usa node:sqlite)
if (-not (Test-Comando node)) { throw "Node.js não encontrado. Instale: winget install OpenJS.NodeJS.LTS" }
$versao = [version]((node -v).TrimStart("v"))
if ($versao -lt [version]"22.5.0") { throw "Node $versao é antigo; precisa de 22.5 ou mais novo." }
Write-Host "Node $versao ok" -ForegroundColor Green

# 2. Dependências
if (-not (Test-Path node_modules)) {
    Write-Host "Instalando dependências..." -ForegroundColor Cyan
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci falhou." }
}

# 3. sharp: um node_modules copiado do Linux só tem o binário linux-x64
# (sem 2>$null: no PowerShell 5.1 com Stop, stderr de programa externo vira exceção)
$testeSharp = "try { require('sharp'); console.log('ok') } catch (e) { console.log('falhou') }"
if ((node -e $testeSharp) -ne "ok") {
    $sharp = node -p "require('./node_modules/sharp/package.json').version"
    Write-Host "Instalando o binário do sharp $sharp para Windows..." -ForegroundColor Cyan
    npm install --no-save --os=win32 --cpu=x64 "sharp@$sharp"
    if ((node -e $testeSharp) -ne "ok") { throw "sharp continua sem carregar." }
}
Write-Host "sharp ok" -ForegroundColor Green

# 4. Binários de mídia (download, conversão, figurinha, nota de voz)
foreach ($item in @(@{ Cmd = "ffmpeg"; Id = "Gyan.FFmpeg" }, @{ Cmd = "yt-dlp"; Id = "yt-dlp.yt-dlp" })) {
    if (Test-Comando $item.Cmd) { Write-Host "$($item.Cmd) ok" -ForegroundColor Green; continue }
    if (-not (Test-Comando winget)) { Write-Warning "$($item.Cmd) ausente e sem winget para instalar."; continue }
    Write-Host "Instalando $($item.Cmd)..." -ForegroundColor Cyan
    winget install --id $item.Id -e --accept-source-agreements --accept-package-agreements
    Write-Warning "Feche e abra o terminal para o $($item.Cmd) entrar no PATH."
}

# 5. .env
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Warning ".env criado a partir do .env.example: preencha BOT_OWNER_ID e o resto."
}

# 6. Git: bits de execução não existem no Windows, não devem virar alteração
git config core.fileMode false

# 7. Testes
if (-not $SemTestes) {
    Write-Host "Rodando npm test..." -ForegroundColor Cyan
    npm test
    if ($LASTEXITCODE -ne 0) { throw "Há testes falhando." }
}

Write-Host ""
Write-Host "Pronto. Para acessar a VPS: .\scripts\vps.ps1 chave" -ForegroundColor Green
