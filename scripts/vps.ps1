<#
.SYNOPSIS
    Painel da VPS GOATBot para o Windows PowerShell.

.DESCRIPTION
    Status, logs, restart, deploy, QR code e conferência da chave SSH com um
    comando. O host vem do alias "vps" em ~/.ssh/config (ou de -Alvo).

.EXAMPLE
    .\scripts\vps.ps1 status
    .\scripts\vps.ps1 logs
    .\scripts\vps.ps1 restart
    .\scripts\vps.ps1 deploy          # git pull + rebuild na VPS
    .\scripts\vps.ps1 deploy -Push    # push da main antes
    .\scripts\vps.ps1 qr              # mostra o QR no terminal até conectar
    .\scripts\vps.ps1 chave           # mostra a chave pública e testa o acesso
    .\scripts\vps.ps1 ssh
#>
param (
    [Parameter(Position = 0)]
    [ValidateSet("ssh", "logs", "status", "restart", "deploy", "qr", "chave")]
    [string]$Acao = "status",
    [string]$Alvo = "vps",
    [switch]$Push
)

$Container = "goat_bot_xp"

# IP real por trás do alias, lido do próprio ssh (respeita o ~/.ssh/config).
function Get-HostDaVps {
    $linha = ssh -G $Alvo 2>$null | Where-Object { $_ -like "hostname *" } | Select-Object -First 1
    if (-not $linha) { return $Alvo -replace ".*@", "" }
    return ($linha -split " ", 2)[1]
}

switch ($Acao) {
    "ssh" {
        ssh $Alvo
    }
    "logs" {
        Write-Host "Logs do $Container ao vivo (Ctrl+C para sair)..." -ForegroundColor Yellow
        ssh -t $Alvo "docker logs --tail 50 -f $Container"
    }
    "status" {
        ssh $Alvo "docker ps -a --filter name=$Container --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
    }
    "restart" {
        ssh $Alvo "docker restart $Container"
        if ($LASTEXITCODE -eq 0) { Write-Host "Bot reiniciado." -ForegroundColor Green }
    }
    "deploy" {
        & (Join-Path $PSScriptRoot "deploy-vps.ps1") -Alvo $Alvo -Push:$Push
    }
    "chave" {
        $pub = Join-Path $env:USERPROFILE ".ssh\id_ed25519.pub"
        if (-not (Test-Path $pub)) {
            Write-Host "Sem chave. Criando ~/.ssh/id_ed25519..." -ForegroundColor Yellow
            ssh-keygen -q -t ed25519 -N '""' -C "$env:USERNAME-windows" -f (Join-Path $env:USERPROFILE ".ssh\id_ed25519")
        }
        Write-Host "Chave pública (cole no GitHub e em ~/.ssh/authorized_keys da VPS):" -ForegroundColor Cyan
        Get-Content $pub
        Write-Host ""
        Write-Host "Testando $Alvo ($(Get-HostDaVps))..." -ForegroundColor Cyan
        ssh -o BatchMode=yes -o ConnectTimeout=8 $Alvo "echo acesso ok"
        Write-Host "Testando GitHub..." -ForegroundColor Cyan
        ssh -o BatchMode=yes -o ConnectTimeout=8 -T git@github.com
    }
    "qr" {
        # O painel só escuta em 127.0.0.1 da VPS (docker-compose.override.yml),
        # fechado para a internet. Chega-se nele por um túnel SSH na porta 3000 local.
        $tunel = Start-Process ssh -ArgumentList "-N", "-o", "ExitOnForwardFailure=yes", "-L", "3000:127.0.0.1:3000", $Alvo -PassThru -WindowStyle Hidden
        Start-Sleep -Seconds 3
        if ($tunel.HasExited) { throw "Túnel SSH não abriu (a porta 3000 deste PC está livre?)." }
        $ip = "127.0.0.1"
        Write-Host "Túnel aberto. Buscando QR em http://127.0.0.1:3000 (Ctrl+C para sair)..." -ForegroundColor Cyan
        $ultimo = ""
        try {
        while ($true) {
            try {
                $status = Invoke-RestMethod -Uri "http://${ip}:3000/status" -TimeoutSec 4
                if ($status.connected) {
                    Write-Host "Bot conectado no WhatsApp." -ForegroundColor Green
                    break
                }
            } catch {
                Write-Host "Sem resposta de /status: $($_.Exception.Message)" -ForegroundColor DarkGray
            }
            try {
                $qr = (Invoke-WebRequest -Uri "http://${ip}:3000/qr.raw" -TimeoutSec 4 -UseBasicParsing).Content
            } catch {
                $qr = ""
            }
            if ($qr -and $qr -ne $ultimo) {
                $ultimo = $qr
                Clear-Host
                Write-Host "Escaneie no WhatsApp (ou abra http://${ip}:3000):" -ForegroundColor Cyan
                # Passa o QR por variável de ambiente: nada do servidor vira código JS.
                $env:GOAT_QR = $qr
                node -e "try { require('qrcode-terminal').generate(process.env.GOAT_QR, { small: true }) } catch (e) { console.log(process.env.GOAT_QR) }"
                Remove-Item Env:GOAT_QR
            }
            Start-Sleep -Seconds 2
        }
        }
        finally {
            Stop-Process -Id $tunel.Id -ErrorAction SilentlyContinue
        }
    }
}
