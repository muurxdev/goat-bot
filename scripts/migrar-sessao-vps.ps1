<#
.SYNOPSIS
    Migra sessão do WhatsApp, banco e .env de uma VPS para outra, pelo Windows.

.DESCRIPTION
    Versão Windows do migrar_sessao_vps.sh, com scp no lugar do rsync.
    Para o container na VPS antiga, baixa sessao/, data/ e .env para uma pasta
    temporária deste PC, envia para a VPS nova e sobe o container lá. O bot
    volta autenticado, sem QR code.

.EXAMPLE
    .\scripts\migrar-sessao-vps.ps1 root@IP_ANTIGO root@IP_NOVO
#>
param(
    [Parameter(Mandatory = $true, Position = 0)][string]$VpsAntiga,
    [Parameter(Mandatory = $true, Position = 1)][string]$VpsNova
)

# Continue, não Stop: no PowerShell 5.1 qualquer linha que ssh/docker escrevem
# no stderr (até um aviso) viraria exceção. Falha é checada pelo $LASTEXITCODE.
$ErrorActionPreference = "Continue"
$Caminho = "/var/www/meliodasbotxp"
$Tmp = Join-Path $env:TEMP "goat_migracao_$([DateTimeOffset]::Now.ToUnixTimeSeconds())"

function Invoke-Nativo([string]$Descricao, [scriptblock]$Bloco) {
    & $Bloco
    if ($LASTEXITCODE -ne 0) { throw "$Descricao falhou (código $LASTEXITCODE)." }
}

Write-Host "Origem: $VpsAntiga  ->  Destino: $VpsNova" -ForegroundColor Cyan
New-Item -ItemType Directory -Force $Tmp | Out-Null

try {
    Write-Host "1/4 Parando o container na VPS antiga para copiar íntegro..."
    ssh $VpsAntiga "docker stop goat_bot_xp || true"

    Write-Host "2/4 Baixando sessao/, data/ e .env..."
    Invoke-Nativo "Baixar sessao/" { scp -r -q "${VpsAntiga}:$Caminho/sessao" "$Tmp\" }
    Invoke-Nativo "Baixar data/" { scp -r -q "${VpsAntiga}:$Caminho/data" "$Tmp\" }
    Invoke-Nativo "Baixar .env" { scp -q "${VpsAntiga}:$Caminho/.env" "$Tmp\.env" }

    Write-Host "3/4 Enviando para $VpsNova..."
    Invoke-Nativo "Criar pastas" { ssh $VpsNova "mkdir -p $Caminho/logs $Caminho/temp $Caminho/backups" }
    Invoke-Nativo "Enviar sessao/" { scp -r -q "$Tmp\sessao" "${VpsNova}:$Caminho/" }
    Invoke-Nativo "Enviar data/" { scp -r -q "$Tmp\data" "${VpsNova}:$Caminho/" }
    Invoke-Nativo "Enviar .env" { scp -q "$Tmp\.env" "${VpsNova}:$Caminho/.env" }

    Write-Host "4/4 Subindo o container na VPS nova..."
    Invoke-Nativo "docker compose" { ssh $VpsNova "cd $Caminho && (docker compose up -d || docker compose -f docker-compose.lite.yml up -d)" }

    Write-Host "Migração concluída. Logs: ssh $VpsNova 'docker logs -f goat_bot_xp'" -ForegroundColor Green
}
finally {
    # A pasta tem as credenciais do WhatsApp: não pode ficar largada no PC.
    Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
