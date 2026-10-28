/**
 * Live Web & API QR Code Server
 * Permite visualizar e escanear o QR Code remotamente pelo navegador do PC ou terminal
 */

const http = require('http')
const QRCode = require('qrcode')
const logger = require('./logger')
const { getBotName } = require('../config/botConfig')

let currentQr = null
let isConnected = false
let connectedUser = null
let serverInstance = null

// Preenchido pelo index quando o cliente do WhatsApp fica pronto; permite
// avisar o comprador assim que o pagamento confirma.
let onPagamentoConfirmado = null
function setPagamentoHandler(fn) { onPagamentoConfirmado = fn }

function startQrServer(port = process.env.PORT || 3000) {
    if (serverInstance) return serverInstance

    const server = http.createServer(async (req, res) => {
        const url = req.url.split('?')[0]

        // 0. Webhook do Stripe. Vem ANTES de tudo porque precisa do corpo CRU:
        //    qualquer middleware que leia/reserialize o body invalida o HMAC.
        if (url === '/stripe/webhook') {
            const { handle } = require('../services/payments/stripeWebhook')
            return handle(req, res, { aoCreditar: onPagamentoConfirmado })
        }

        // 1. Raw QR string (usado pelo script de terminal no PC)
        if (url === '/qr.raw') {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
            return res.end(currentQr || '')
        }

        // 2. Status API
        if (url === '/status') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({
                connected: isConnected,
                user: connectedUser,
                hasQr: Boolean(currentQr)
            }))
        }

        // 2.1 Grupos API (status de admin e comunidade em tempo real)
        if (url === '/api/grupos') {
            try {
                const groupAuthService = require('../services/groupAuthService')
                const client = groupAuthService.getClient()
                if (!client || typeof client.groupFetchAllParticipating !== 'function') {
                    res.writeHead(503, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify({ error: 'Client not ready' }))
                }
                const allGroups = await client.groupFetchAllParticipating()
                const botJids = groupAuthService.getBotJids(client)
                const result = Object.values(allGroups).map(g => {
                    const isBotAdmin = (g.participants || []).some(p => {
                        const isAdm = p.admin === 'admin' || p.admin === 'superadmin'
                        if (!isAdm) return false
                        const pj = groupAuthService.normalizeJid(p.id || p.jid || '')
                        return [...botJids].some(b => b && pj && b === pj)
                    })
                    return {
                        id: g.id,
                        subject: g.subject || '(sem nome)',
                        participantsCount: g.participants?.length || 0,
                        announce: Boolean(g.announce),
                        isCommunity: Boolean(g.isCommunity),
                        isCommunityAnnounce: Boolean(g.isCommunityAnnounce),
                        linkedParent: g.linkedParent || null,
                        isBotAdmin
                    }
                })
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
                return res.end(JSON.stringify(result, null, 2))
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ error: err.message }))
            }
        }

        // 2.2 Métricas do Sistema
        if (url === '/api/metricas') {
            const mem = process.memoryUsage()
            const dispatcher = require('../handlers/commandDispatcher')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({
                uptime: Math.floor(process.uptime()),
                memoryHeapMb: (mem.heapUsed / 1024 / 1024).toFixed(1),
                memoryRssMb: (mem.rss / 1024 / 1024).toFixed(1),
                canonicalCommands: dispatcher.getCommands().size,
                aliases: dispatcher.getAliases().size,
                totalTriggers: dispatcher.getCommands().size + dispatcher.getAliases().size,
                connected: isConnected,
                user: connectedUser
            }))
        }

        // 2.3 Controle de Autonomia dos Grupos
        if (url === '/api/auto/toggle') {
            try {
                const autoService = require('../services/autoContentService')
                const fullUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
                const jid = fullUrl.searchParams.get('jid')
                const state = fullUrl.searchParams.get('state')

                if (!jid) {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify({ error: 'JID obrigatório' }))
                }

                if (state === 'off') {
                    await autoService.desativar(jid)
                } else {
                    await autoService.ativar(jid)
                }

                res.writeHead(200, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ ok: true, jid, state }))
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ error: err.message }))
            }
        }

        // 2.4 Controle de Autonomia Global (Todos os grupos)
        if (url === '/api/auto/all') {
            try {
                const autoService = require('../services/autoContentService')
                const groupAuthService = require('../services/groupAuthService')
                const client = groupAuthService.getClient()
                const fullUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
                const state = fullUrl.searchParams.get('state')

                let result
                if (state === 'off') {
                    result = await autoService.desativarTodos(client)
                } else {
                    result = await autoService.ativarTodos(client)
                }

                res.writeHead(200, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ ok: true, state, result }))
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ error: err.message }))
            }
        }

        // 3. Imagem PNG direta
        if (url === '/qr.png') {
            if (!currentQr) {
                res.writeHead(404, { 'Content-Type': 'text/plain' })
                return res.end('QR Code não disponível ou já autenticado.')
            }
            try {
                const imgBuffer = await QRCode.toBuffer(currentQr, { width: 400, margin: 2 })
                res.writeHead(200, { 'Content-Type': 'image/png' })
                return res.end(imgBuffer)
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                return res.end('Erro ao gerar PNG do QR Code.')
            }
        }

        // 4. Página Web Interativa (Visualização no PC)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })

        let qrDataUrl = null
        if (currentQr) {
            try {
                qrDataUrl = await QRCode.toDataURL(currentQr, { width: 320, margin: 2 })
            } catch (e) {
                logger.warn(`[QR SERVER] Não gerei a imagem do QR para a página: ${e.message}`)
            }
        }

        let bodyHtml = ''
        if (isConnected) {
            bodyHtml = `
                <div style="background:#064e3b; border: 1px solid #059669; color:white; padding:24px; border-radius:14px; margin-top:20px; text-align:left;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:20px;">🟢 BOT OPERACIONAL & CONECTADO</h2>
                        <span style="background:#047857; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600;">WHATSAPP ONLINE</span>
                    </div>
                    <p style="margin:10px 0 0 0; opacity:0.9; font-size:14px;">Identificador: <strong>${connectedUser || getBotName()}</strong></p>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-top:16px;">
                    <div style="background:#1e293b; padding:16px; border-radius:12px; border:1px solid #334155;">
                        <div style="color:#94a3b8; font-size:12px;">Comandos & Aliases</div>
                        <div style="font-size:22px; font-weight:bold; color:#38bdf8; margin-top:4px;">30.000</div>
                        <div style="color:#64748b; font-size:11px;">10k cmd · 20k alias</div>
                    </div>
                    <div style="background:#1e293b; padding:16px; border-radius:12px; border:1px solid #334155;">
                        <div style="color:#94a3b8; font-size:12px;">Memória em Uso</div>
                        <div style="font-size:22px; font-weight:bold; color:#a855f7; margin-top:4px;">${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} MB</div>
                        <div style="color:#64748b; font-size:11px;">Baixo consumo</div>
                    </div>
                    <div style="background:#1e293b; padding:16px; border-radius:12px; border:1px solid #334155;">
                        <div style="color:#94a3b8; font-size:12px;">Uptime Ativo</div>
                        <div style="font-size:22px; font-weight:bold; color:#34d399; margin-top:4px;">${Math.floor(process.uptime() / 60)}m</div>
                        <div style="color:#64748b; font-size:11px;">Iniciado com sucesso</div>
                    </div>
                </div>

                <div style="background:#1e293b; border:1px solid #334155; padding:20px; border-radius:14px; margin-top:20px; text-align:left;">
                    <h3 style="margin:0 0 12px 0; font-size:16px; color:#f1f5f9;">⚡ Gestão de Autonomia dos Grupos (Skycode & Geral)</h3>
                    <p style="color:#94a3b8; font-size:13px; margin:0 0 16px 0;">Controle em lote o envio automático de vagas, notícias, balcão anti-golpe e tabelas de futebol.</p>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button onclick="controlAll('on')" style="background:#2563eb; color:white; border:none; padding:10px 16px; border-radius:8px; font-weight:600; cursor:pointer;">🟢 Ativar Autonomia em Todos</button>
                        <button onclick="controlAll('off')" style="background:#dc2626; color:white; border:none; padding:10px 16px; border-radius:8px; font-weight:600; cursor:pointer;">🔴 Desativar em Todos</button>
                    </div>
                    <div id="actionStatus" style="margin-top:10px; font-size:13px; color:#38bdf8; display:none;"></div>
                </div>

                <script>
                    function controlAll(state) {
                        const status = document.getElementById('actionStatus');
                        status.style.display = 'block';
                        status.innerText = 'Processando comando...';
                        fetch('/api/auto/all?state=' + state, { method: 'POST' })
                            .then(r => r.json())
                            .then(data => {
                                status.innerText = state === 'on' ? '✅ Autonomia ativada em todos os grupos com sucesso!' : '🔴 Autonomia desativada em todos os grupos!';
                                setTimeout(() => { status.style.display = 'none'; }, 4000);
                            })
                            .catch(err => {
                                status.innerText = '❌ Erro: ' + err.message;
                            });
                    }
                </script>
            `
        } else if (qrDataUrl) {
            bodyHtml = `
                <div style="background:#f8fafc; border:2px dashed #3b82f6; padding:25px; border-radius:16px; display:inline-block; margin-top:15px;">
                    <img src="${qrDataUrl}" alt="QR Code WhatsApp" style="border-radius:8px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" />
                    <p style="color:#1e293b; font-weight:600; margin-top:15px;">📲 Abra o WhatsApp > Aparelhos Conectados > Conectar Aparelho</p>
                </div>
            `
        } else {
            bodyHtml = `
                <div style="background:#fef3c7; color:#92400e; padding:25px; border-radius:12px; margin-top:20px;">
                    <h3 style="margin:0;">⏳ Aguardando geração do QR Code...</h3>
                    <p style="margin-top:10px;">O servidor está inicializando a conexão com o WhatsApp. A página será atualizada automaticamente.</p>
                </div>
            `
        }

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getBotName()} — Painel de Controle & QR</title>
    ${isConnected ? '' : '<meta http-equiv="refresh" content="3">'}
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1120; color: #f8fafc; padding: 40px 20px; margin:0; }
        .container { max-width: 680px; margin: 0 auto; background: #0f172a; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.6); border: 1px solid #1e293b; }
        h1 { color: #60a5fa; margin-top: 0; }
        .badge { background: #1e293b; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #94a3b8; border:1px solid #334155; }
    </style>
</head>
<body>
    <div class="container">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <h1 style="margin:0;">🤖 ${getBotName()}</h1>
            <span class="badge">Painel Executivo Web // GOAT</span>
        </div>
        ${bodyHtml}
    </div>
</body>
</html>`

        res.end(html)
    })

    server.listen(port, '0.0.0.0', () => {
        logger.info(`🌐 [QR SERVER] Painel Web do QR Code disponível em: http://0.0.0.0:${port}`)
    })

    serverInstance = server
    return server
}

function updateQr(qrString) {
    currentQr = qrString
    isConnected = false
}

function setConnected(user) {
    isConnected = true
    connectedUser = user
    currentQr = null
}

function stopQrServer() {
    if (serverInstance) {
        serverInstance.close()
        serverInstance = null
    }
}

module.exports = {
    setPagamentoHandler,
    startQrServer,
    updateQr,
    setConnected,
    stopQrServer
}

