<#
.SYNOPSIS
    Deploy do GOATBot na VPS a partir do Windows.

.DESCRIPTION
    Empacota o commit atual (git archive), envia por scp e executa
    scripts/remote/deploy-remote.sh na VPS: backup do código anterior em
    /root/deploy-backups, extração e rebuild do container. Não depende do
    GitHub. .env, sessão do WhatsApp e banco ficam como estão na VPS.

    Só vai o que está COMMITADO. Alterações não commitadas não sobem.

.PARAMETER Alvo
    Host ou alias do SSH. Padrão: "vps", definido em ~/.ssh/config.

.PARAMETER Push
    Também faz "git push origin HEAD" para o GitHub antes do deploy.

.EXAMPLE
    .\scripts\deploy-vps.ps1
    .\scripts\deploy-vps.ps1 -Push
#>
param(
    [Parameter(Position = 0)]
    [string]$Alvo = "vps",
    [switch]$Push
)

# Continue, não Stop: no PowerShell 5.1 qualquer linha que ssh/docker escrevem
# no stderr (até um aviso) viraria exceção. Falha é checada pelo $LASTEXITCODE.
$ErrorActionPreference = "Continue"
$raiz = Split-Path $PSScriptRoot -Parent
$remoto = Join-Path $PSScriptRoot "remote\deploy-remote.sh"
$pacote = Join-Path $env:TEMP "goat-deploy.tar.gz"

Push-Location $raiz
try {
    $versao = git log -1 --format="%h %cs"
    Write-Host "=================================================="
    Write-Host "Deploy GOATBot -> $Alvo  (commit $versao)" -ForegroundColor Cyan
    Write-Host "=================================================="

    if (git status --porcelain) {
        Write-Warning "Há alterações não commitadas; elas NÃO vão no deploy."
    }

    if ($Push) {
        Write-Host "Enviando para o GitHub..." -ForegroundColor Yellow
        git push origin HEAD
        if ($LASTEXITCODE -ne 0) { throw "git push falhou (código $LASTEXITCODE)." }
    }

    Write-Host "Empacotando o commit..."
    git archive --format=tar.gz -o $pacote HEAD
    if ($LASTEXITCODE -ne 0) { throw "git archive falhou." }
    Write-Host ("   {0:N1} MB" -f ((Get-Item $pacote).Length / 1MB))

    Write-Host "Enviando para a VPS..."
    scp -q $pacote $remoto "${Alvo}:/tmp/"
    if ($LASTEXITCODE -ne 0) { throw "scp para $Alvo falhou. Teste com: .\scripts\vps.ps1 chave" }

    # O tr tira o CRLF que o Windows possa ter posto no script.
    ssh $Alvo "tr -d '\r' < /tmp/deploy-remote.sh | bash -s -- /tmp/goat-deploy.tar.gz '$versao'; codigo=`$?; rm -f /tmp/deploy-remote.sh; exit `$codigo"
    if ($LASTEXITCODE -ne 0) { throw "O deploy na VPS terminou com erro (código $LASTEXITCODE)." }
}
finally {
    Remove-Item $pacote -ErrorAction SilentlyContinue
    Pop-Location
}
