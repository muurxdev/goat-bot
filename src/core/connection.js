/**
 * WhatsApp Baileys Connection Manager
 * Gerencia ciclo de vida da conexão, autenticação, eventos e reconexão com backoff
 */

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { sessaoDir } = require('../config/paths')
const { handleIncomingMessage, invalidateGroupCache } = require('../handlers/messageHandler')
const groupAuthService = require('../services/groupAuthService')
const { traduzirConteudo } = require('../services/loreService')
const { completarPrevia } = require('../services/media/miniatura')
const { startQrServer, updateQr, setConnected } = require('./qrServer')
const logger = require('./logger')

let clientInstance = null
let reconnectTimeout = null
let reconnectDelayMs = 2000
let isShuttingDown = false

/**
 * Tenta atualizar o yt-dlp dentro do canal nightly (best-effort, não bloqueante).
 * O canal nightly acompanha as mudanças das plataformas (ex: correções do TikTok)
 * mais rápido que o estável. Falha silenciosa se sem permissão de escrita.
 */
function updateYtDlpOnce() {
    try {
        spawn('yt-dlp', ['--update-to', 'nightly'], { stdio: 'ignore' }).on('error', () => {})
    } catch (errIgnorado) { logger.warn(`[CONNECTION] Falha ignorada em src/core/connection.js:32: ${errIgnorado.message}`) }
}

/**
 * Inicia a conexão com o WhatsApp usando Baileys
 * @returns {Promise<object>} Instância do cliente Baileys
 */
async function startBot() {
    if (isShuttingDown) {
        logger.warn('[BOOT] Inicialização cancelada: processo em encerramento.')
        return null
    }

    // Inicializa o servidor Web de QR Code
    startQrServer()

    // Mantém o yt-dlp atualizado para acompanhar mudanças das plataformas
    updateYtDlpOnce()

    if (!fs.existsSync(sessaoDir)) {
        fs.mkdirSync(sessaoDir, { recursive: true })
    }

    logger.info(`[WHATSAPP] Carregando credenciais de sessão em: ${sessaoDir}`)
    const { state, saveCreds } = await useMultiFileAuthState(sessaoDir)
    const { version, isLatest } = await fetchLatestBaileysVersion()

    logger.info(`[WHATSAPP] Versão Baileys: v${version.join('.')} (isLatest: ${isLatest})`)

    const client = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: true,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
        // Era 0 ("espera para sempre"). O Baileys guarda a conexão de mídia
        // numa promessa única (`mediaConn`): quando a consulta `media_conn`
        // ficou sem resposta, em 2026-09-21, TODO envio de mídia do bot passou a
        // esperar para sempre — .dossie e .perfil paravam no ⏳, junto com
        // menus em imagem, figurinhas e downloads. 60 s é o padrão do Baileys.
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
        mediaUploadTimeoutMs: 300000
    })

    // Tradutor do Reino no ponto de saída.
    //
    // Envolver aqui, e não em cada comando, é o que torna a regra completa: os
    // ~63 arquivos que chamam sendMessage direto e toda legenda de mídia passam
    // por este ponto. Só os campos que o usuário lê (`text`, `caption`) são
    // tocados; mídia, reações e o resto do envelope seguem intactos.
    //
    // Aqui também entra a prévia nítida de imagem e vídeo (miniatura.js): o
    // Baileys sozinho gera uma de 32 px que aparece borrada até a mídia baixar.
    const enviarOriginal = client.sendMessage.bind(client)
    // A conexão de mídia do Baileys fica guardada numa promessa: se a consulta
    // dela estourou o tempo, a promessa rejeitada também fica guardada e TODO
    // envio de mídia seguinte falha, até o socket ser recriado. Então, no
    // primeiro envio de mídia que estourar o tempo, o socket é recriado (a
    // reconexão automática abaixo cuida do resto). Uma vez só por socket.
    let socketReiniciado = false
    const ehMidia = c => Boolean(c && (c.image || c.video || c.audio || c.document || c.sticker))
    client.sendMessage = async (jid, conteudo, opcoes) => {
        const traduzido = traduzirConteudo(conteudo)
        try {
            return await enviarOriginal(jid, await completarPrevia(traduzido), opcoes)
        } catch (err) {
            const estourou = /timed out/i.test(String(err?.message || '')) || err?.output?.statusCode === DisconnectReason.timedOut
            if (estourou && ehMidia(conteudo) && !socketReiniciado) {
                socketReiniciado = true
                logger.error(`[WHATSAPP] Envio de mídia estourou o tempo em ${jid}: a conexão de mídia travou. Recriando o socket.`)
                try {
                    client.end(new Error('conexão de mídia travada'))
                } catch (errFim) {
                    logger.error(`[WHATSAPP] Não consegui encerrar o socket travado: ${errFim.message}`)
                }
            }
            throw err
        }
    }

    clientInstance = client

    // Vincula o cliente Baileys ao serviço de autenticação de grupos
    groupAuthService.attach(client)

    // 1. Atualização de credenciais de autenticação
    client.ev.on('creds.update', saveCreds)

    // Pareamento por código: alternativa ao QR para quando não dá para escanear
    // (o painel web fica preso em 127.0.0.1 na VPS). Um pedido por socket — o
    // evento de QR se renova a cada ~20 s, e pedir de novo a cada renovação
    // invalidaria o código que a pessoa está digitando no celular.
    const { pairingNumber } = require('../config/env')
    let codigoPedido = false

    // 2. Atualização de status da conexão
    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr && pairingNumber && !state.creds.registered) {
            // O painel web continua recebendo o QR: código e QR são duas portas
            // para a mesma sessão, e quem abrir o painel não pode dar com página vazia.
            updateQr(qr)
            if (!codigoPedido) {
                codigoPedido = true
                try {
                    const codigo = await client.requestPairingCode(pairingNumber)
                    const legivel = String(codigo).match(/.{1,4}/g).join('-')
                    logger.info('==================================================')
                    logger.info(`🔑 [PAREAMENTO] Código para o número ${pairingNumber}: ${legivel}`)
                    logger.info('📲 No celular do bot: WhatsApp › Aparelhos conectados › Conectar aparelho › Conectar com número de telefone')
                    logger.info('⏳ O código expira em poucos minutos; se expirar, o bot gera outro na próxima tentativa.')
                    logger.info('==================================================')
                } catch (errPar) {
                    logger.error(`[PAREAMENTO] Falha ao pedir código para ${pairingNumber}: ${errPar.message}`)
                }
            }
            return
        }

        if (qr) {
            updateQr(qr)
            console.log('\n==================================================')
            console.log('📲 [WHATSAPP] ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:')
            console.log('🌐 Ou acesse pelo navegador no PC: http://<IP_DA_VPS>:3000')
            console.log('==================================================\n')
            try {
                const qrcodeTerminal = require('qrcode-terminal')
                qrcodeTerminal.generate(qr, { small: true })
            } catch (e) {
                logger.info(`[WHATSAPP QR STRING]: ${qr}`)
            }
            console.log('\n==================================================\n')
        }

        if (connection === 'connecting') {
            logger.info('[WHATSAPP] 🔄 Conectando aos servidores do WhatsApp...')
        }

        if (connection === 'open') {
            setConnected(client.user?.id || 'Bot')

            // Nova sessão/relançamento: descarta metadata de grupos obsoletos
            groupAuthService.invalidateAll()

            logger.info('==================================================')
            logger.info('🚀 [READY] Bot CONECTADO COM SUCESSO!')
            logger.info(`👤 Usuário Conectado: ${client.user?.id || 'Bot'}`)
            logger.info('==================================================')
            reconnectDelayMs = 2000 // Reseta o delay de reconexão

            // Inicializa agendador de timers persistentes e monitor ativo de aluguel
            try {
                const persistentScheduler = require('../services/persistentScheduler')
                persistentScheduler.init(client)
            } catch (errSched) {
                logger.error('[SCHEDULER] Falha ao iniciar agendador persistente:', errSched)
            }

            try {
                const rentalWorker = require('../services/rentalWorker')
                rentalWorker.start(client)
            } catch (errRent) {
                logger.error('[RENTAL WORKER] Falha ao iniciar monitor de aluguel:', errRent)
            }

            try {
                const groupScheduleService = require('../services/groupScheduleService')
                groupScheduleService.init(client)
            } catch (errSchedGrp) {
                logger.error('[GROUP SCHEDULE WORKER] Falha ao iniciar monitor de agenda de grupos:', errSchedGrp)
            }

            // Transcrições longas que ficaram pela metade (reinício, deploy) continuam sozinhas.
            // Atrasa um pouco para o socket assentar antes de qualquer envio.
            setTimeout(() => {
                try {
                    require('../services/transcricaoLonga').retomarPendentes(client)
                } catch (errTr) {
                    logger.warn(`[TRANSCRICAO] Não retomei as pendentes: ${errTr.message}`)
                }
            }, 8000)

            // Inventário dos grupos + provisionamento.
            //
            // O bot pode estar em dezenas de grupos, mas só ficava configurado
            // naqueles onde alguém já tinha falado. Nos demais, TODO módulo
            // nascia OFF: o bot lia tudo e não respondia nada, sem nenhum sinal
            // de que era isso. Aqui a lista real do WhatsApp é a fonte da
            // verdade — todo grupo é conferido e provisionado no boot.
            setTimeout(async () => {
                try {
                    const moduleState = require('../services/moduleStateService')
                    const todos = await client.groupFetchAllParticipating()
                    const grupos = Object.values(todos || {})

                    let novos = 0
                    for (const g of grupos) {
                        if (moduleState.provisionIfNew(g.id)) {
                            novos++
                            logger.info(`   ➕ "${g.subject || g.id}" provisionado (estava mudo)`)
                        }
                    }

                    logger.info(`📋 [GRUPOS] ${grupos.length} grupo(s) no WhatsApp | ${novos} provisionado(s) agora`)

                    // Teste de envio pontual: grava `configs.global.testeEnvioJid`
                    // com o JID de um grupo e o bot manda UMA mensagem lá no
                    // próximo boot, limpando a flag em seguida. Serve para
                    // separar "o bot não recebe" de "o bot não consegue enviar",
                    // que de fora do processo não dá para distinguir.
                    try {
                        const dataService = require('../services/dataService')
                        const cfgs = dataService.getConfigsData()
                        const alvoTeste = cfgs.global?.testeEnvioJid
                        if (alvoTeste) {
                            delete cfgs.global.testeEnvioJid
                            await dataService.saveConfigsData(cfgs)
                            await client.sendMessage(alvoTeste, {
                                text: '🔧 *Teste de diagnóstico*\n\nSe você está vendo isto, o bot CONSEGUE enviar neste grupo.\n\nResponda com `.ping` para fecharmos o outro lado do teste.'
                            })
                            logger.info(`[TESTE ENVIO] Mensagem de diagnóstico enviada para ${alvoTeste}`)
                        }
                    } catch (errTeste) {
                        logger.error(`[TESTE ENVIO] Falhou: ${errTeste.message}`)
                    }

                    // Relógio do conteúdo automático — só depois de conectar,
                    // porque ele precisa do cliente para enviar.
                    try {
                        require('../services/autoContentService').iniciar(client)
                    } catch (errAuto) {
                        logger.warn(`[AUTO] Não consegui iniciar o relógio: ${errAuto.message}`)
                    }
                    if (grupos.length) {
                        for (const g of grupos) {
                            const n = moduleState.listModules(g.id).filter(m => m.enabled).length
                            // `announce` = só admin fala: se o bot não for admin,
                            // ele fica MUDO ali por regra do grupo, não por bug.
                            // `ephemeral` = mensagens temporárias.
                            const flags = []
                            if (g.announce) flags.push('🔇 só-admin-fala')
                            if (g.ephemeralDuration) flags.push(`⏳ temporária ${Math.round(g.ephemeralDuration / 3600)}h`)
                            if (g.isCommunity || g.isCommunityAnnounce) flags.push('📢 comunidade')
                            const extra = flags.length ? `  [${flags.join(' · ')}]` : ''
                            logger.info(`   ${n === 0 ? '🔴' : '🟢'} ${String(g.subject || '(sem nome)').slice(0, 30).padEnd(32)} ${n} mód  ${g.id}${extra}`)
                        }
                    }
                } catch (err) {
                    logger.warn(`[GRUPOS] Não consegui inventariar os grupos: ${err.message}`)
                }
            }, 4000)

            // Conecta o manipulador de pagamentos do webhook Stripe ao WhatsApp
            try {
                const { setPagamentoHandler } = require('./qrServer')
                setPagamentoHandler(async ({ jid, creditos, saldo, centavos, autoAtivado, dias, pacote }) => {
                    try {
                        const { getBotName } = require('../config/botConfig')
                        const botNome = getBotName()
                        const reais = (Number(centavos || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        let aviso = `╔══════════════════════════════╗\n`
                        aviso += `║   💳 *PAGAMENTO CONFIRMADO!*   ║\n`
                        aviso += `╚══════════════════════════════╝\n\n`
                        aviso += `Olá! Seu pagamento no valor de *${reais}* foi aprovado com sucesso.\n\n`
                        if (autoAtivado) {
                            aviso += `✅ *Aluguel ativado automaticamente!* O bot já está liberado para uso neste alvo.\n`
                            if (dias) aviso += `⏱️ *Duração adicionada:* ${dias >= 36500 ? 'Vitalício' : `${dias} dias`}\n\n`
                        } else {
                            aviso += `🎟️ *Créditos Adicionados:* +${creditos}\n`
                            aviso += `💰 *Novo Saldo Total:* ${saldo} créditos\n\n`
                            aviso += `💡 _Para ativar ou estender o aluguel:_\n`
                            aviso += `• \`.reativar pv <dias>\` (para liberar seu Privado)\n`
                            aviso += `• \`.reativar grupo <dias>\` (para liberar o Grupo)\n`
                            aviso += `• \`.reativar combo <dias>\` (para Grupo + PV)\n\n`
                        }
                        aviso += `_Obrigado por apoiar o ${botNome}!_ 👑`
                        await client.sendMessage(jid, { text: aviso.trim() })
                    } catch (errNotif) {
                        logger.warn('[PAYMENT NOTIF WARN] Falha ao notificar comprador via WhatsApp:', errNotif.message)
                    }
                })
            } catch (errHook) {
                logger.warn('[PAYMENT HANDLER HOOK WARN]', errHook.message)
            }
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut

            logger.warn(`[WHATSAPP] Conexão encerrada. Código de status: ${statusCode || 'desconhecido'}`)

            if (statusCode === DisconnectReason.loggedOut) {
                // 401 com a sessão NUNCA registrada não é logout: é pareamento
                // abandonado (código ou QR expirou sem uso). A credencial pela metade
                // fica em sessao/ e todo reconectar volta 401 — o bot travava ali até
                // alguém limpar a pasta na mão. Sem sessão real a perder, recomeça limpo.
                if (!state.creds.registered) {
                    logger.warn('[WHATSAPP] Pareamento expirou sem ser concluído. Descartando a credencial incompleta e gerando novo código/QR...')
                    try {
                        for (const nome of fs.readdirSync(sessaoDir)) {
                            fs.rmSync(path.join(sessaoDir, nome), { recursive: true, force: true })
                        }
                    } catch (errLimpa) {
                        logger.error(`[WHATSAPP] Falha ao limpar sessão incompleta: ${errLimpa.message}`)
                        clientInstance = null
                        return
                    }
                    clearTimeout(reconnectTimeout)
                    reconnectTimeout = setTimeout(() => {
                        startBot().catch(err => logger.error('[WHATSAPP] Erro ao reiniciar o pareamento:', err))
                    }, 5000)
                    return
                }
                logger.error('❌ [WHATSAPP] Sessão desconectada (Logged Out). Limpe a pasta sessao/ e gere um novo QR Code.')
                clientInstance = null
                return
            }

            if (shouldReconnect && !isShuttingDown) {
                logger.info(`[WHATSAPP] Tentando reconectar em ${reconnectDelayMs / 1000}s...`)
                clearTimeout(reconnectTimeout)
                reconnectTimeout = setTimeout(() => {
                    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30000)
                    startBot().catch(err => {
                        logger.error('[WHATSAPP] Erro na tentativa de reconexão:', err)
                    })
                }, reconnectDelayMs)
            }
        }
    })

    // 3. Recebimento de mensagens
    client.ev.on('messages.upsert', async (upsertData) => {
        try {
            await handleIncomingMessage(client, upsertData)
        } catch (err) {
            logger.error('[MESSAGE HANDLER ERROR]', err)
        }
    })

    // 4. Atualização de metadados dos grupos (admin mudado, título, etc.)
    client.ev.on('groups.update', (updates) => {
        for (const update of updates || []) {
            if (update?.id) {
                invalidateGroupCache(update.id)
                // .locknick: volta o nome do grupo se quem trocou não podia.
                require('../services/groupProtectionService').tratarAtualizacaoGrupo(client, update)
                    .catch(err => logger.error(`[LOCKNICK] Falha ao tratar a troca de dados de ${update.id}:`, err))
            }
        }
    })

    // 5. Mudanças de participantes (promovido/rebaixado/entrou/saiu)
    client.ev.on('group-participants.update', async (update) => {
        try {
            if (update?.id) {
                invalidateGroupCache(update.id)
                const { handleGroupParticipantsUpdate } = require('../handlers/groupEventsHandler')
                await handleGroupParticipantsUpdate(client, update)
            }
        } catch (err) {
            logger.error('[GROUP_PARTICIPANTS_UPDATE ERROR]', err)
        }
    })

    return client
}

/**
 * Retorna a instância atual do cliente Baileys
 */
function getClient() {
    return clientInstance
}

/**
 * Fecha a conexão de forma limpa
 */
async function closeBot() {
    isShuttingDown = true
    clearTimeout(reconnectTimeout)

    if (clientInstance) {
        logger.info('[WHATSAPP] Encerrando conexão do socket...')
        try {
            if (clientInstance.ws) {
                clientInstance.ws.close()
            }
        } catch (err) {
            logger.warn('[WHATSAPP] Aviso ao fechar socket:', err.message)
        }
        clientInstance = null
    }
}

module.exports = {
    startBot,
    getClient,
    closeBot
}
