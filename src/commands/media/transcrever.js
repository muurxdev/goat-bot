/**
 * Comando .transcrever
 * Transcreve áudios e mensagens de voz em texto com suporte a:
 * - Transcrição instantânea em memória (Whisper Groq Cloud / Gemini 2.0 Flash)
 * - Transcrição de áudios longos de qualquer duração em segundo plano
 * - Subcomandos executivos: .transcrever resumo, .transcrever traduzir [idioma], .transcrever status
 * - Diagnóstico inteligente e ficha técnica da mídia quando não houver chaves de IA
 */

const transcricaoLonga = require('../../services/transcricaoLonga')
const mediaService = require('../../services/mediaService')
const aiService = require('../../services/aiService')
const transcriptionService = require('../../services/transcriptionService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'transcrever',
    aliases: ['ouvir', 'stt', 'transcricao', 'audiotexto', 'vozpratexto', 'transcreveraudio'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Transcreve áudios e mensagens de voz em texto (Whisper Cloud / Gemini), com resumo ou tradução',
    usage: '[resumo | traduzir <idioma> | status]',
    examples: [
        ' — responda a um áudio e eu transcrevo em texto',
        'resumo — transcreve e resume os pontos essenciais do áudio',
        'traduzir en — transcreve e traduz para o inglês',
        'status — mostra as transcrições em andamento'
    ],
    cooldownMs: 3000,
    execute: async ({ from, reply, client, info, quotedMsg, args = [], sender, isOwner }) => {
        const sub = String(args[0] || '').toLowerCase().trim()
        const botName = getBotName()

        // 1. Subcomando STATUS
        if (sub === 'status') {
            const lista = transcricaoLonga.situacao(from)
            if (!lista.length) return reply('🎙️ Nenhuma transcrição em andamento por aqui.')
            const linhas = lista.map((t, i) => {
                const andamento = t.total ? `${t.feitos}/${t.total} trechos` : 'na fila'
                return `${i + 1}. ${transcricaoLonga.formatarDuracao(t.duracaoSeg)} de áudio — ${andamento}`
            })
            return reply(`🎙️ *Transcrições em andamento*\n${linhas.join('\n')}`)
        }

        // Localiza o nó de áudio: na mensagem citada OU na própria mensagem
        const audioNode = quotedMsg?.audioMessage
            || quotedMsg?.videoMessage
            || quotedMsg?.documentMessage
            || info?.message?.audioMessage
            || info?.message?.videoMessage
            || (info?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage)

        if (!audioNode) {
            let helpDoc = `╔══════════════════════════════╗\n`
            helpDoc += `║    🎙️ *TRANSCRIÇÃO DE VOZ* 🎙️    ║\n`
            helpDoc += `╚══════════════════════════════╝\n\n`
            helpDoc += `Responda a um áudio, mensagem de voz ou vídeo com:\n\n`
            helpDoc += `• \`.transcrever\` — Transcreve o áudio integralmente\n`
            helpDoc += `• \`.transcrever resumo\` — Transcreve e gera resumo executivo\n`
            helpDoc += `• \`.transcrever traduzir en\` — Transcreve e traduz para inglês (ou espanhol, etc.)\n`
            helpDoc += `• \`.transcrever status\` — Consulta a fila de áudios longos\n\n`
            helpDoc += `👑 *${botName}*`
            return reply(helpDoc.trim())
        }

        const isResumo = sub === 'resumo' || args.includes('resumo')
        const isTraduzir = sub === 'traduzir' || args.includes('traduzir')
        const targetLang = isTraduzir ? (args[1] || 'inglês') : null

        await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

        try {
            // Reconstrói o wrapper de mensagem para download
            const wrapper = quotedMsg
                ? { message: quotedMsg, key: info.key }
                : info
            const ehVideo = audioNode === (quotedMsg?.videoMessage || info?.message?.videoMessage)
            const buffer = await mediaService.downloadWhatsAppMedia(wrapper, ehVideo ? 'video' : 'audio', client)

            if (!buffer || !buffer.length) {
                return reply('❌ O arquivo de áudio está vazio ou corrompido no WhatsApp. Mande de novo e tente outra vez.')
            }

            const mimetype = audioNode.mimetype || (ehVideo ? 'video/mp4' : 'audio/ogg')
            const tamanhoBytes = buffer.length
            const tamanhoFormatado = tamanhoBytes < 1024 * 1024
                ? `${(tamanhoBytes / 1024).toFixed(1)} KB`
                : `${(tamanhoBytes / (1024 * 1024)).toFixed(2)} MB`

            const duracaoSeg = Math.max(1, Math.round(tamanhoBytes / 3500))
            const duracaoFormatada = transcricaoLonga.formatarDuracao(duracaoSeg)

            // 2. Se nenhuma chave de Speech-to-Text estiver configurada:
            // Apresenta a ficha técnica completa sem mentir ou acusar erro de abertura!
            if (!transcriptionService.hasSttProvider()) {
                await require('../../services/media/avisoDownload').reagir(client, from, info, 'ℹ️')
                let ficha = `╔══════════════════════════════╗\n`
                ficha += `║    🎙️ *ÁUDIO DETECTADO (STT)*   ║\n`
                ficha += `╚══════════════════════════════╝\n\n`
                ficha += `📊 *Ficha Técnica da Mensagem:*\n`
                ficha += `• *Formato:* ${mimetype}\n`
                ficha += `• *Tamanho do Arquivo:* ${tamanhoFormatado}\n`
                ficha += `• *Duração Estimada:* ~${duracaoFormatada}\n`
                ficha += `• *Status da Mídia:* ✅ Arquivo baixado e íntegro em memória!\n\n`
                ficha += `💡 *Como ativar a Transcrição Instantânea:*\n`
                ficha += `Para transcrever a fala em texto automaticamente, adicione uma chave gratuita no arquivo \`.env\`:\n\n`
                ficha += `• \`GROQ_API_KEY=gsk_...\` (Altamente recomendado: Whisper Large V3 grátis e instantâneo)\n`
                ficha += `• \`GEMINI_API_KEY=AIza...\` (Multimodal Google Gemini 2.0 Flash)\n\n`
                ficha += `👑 *${botName}*`
                return reply(ficha.trim())
            }

            // 3. Transcrição direta instantânea em nuvem (Groq Whisper / Gemini Audio) para áudios até 10MB
            if (buffer.length <= 10 * 1024 * 1024) {
                try {
                    const direto = await aiService.transcribeAudioDirect(buffer, mimetype)
                    if (direto && direto.text && direto.text.trim()) {
                        await require('../../services/media/avisoDownload').reagir(client, from, info, '✅')
                        let textoBase = direto.text.trim()

                        // A. Modo Resumo
                        if (isResumo) {
                            let resumoPrompt = `Faça um resumo executivo em português dos tópicos e pontos centrais falados nesta mensagem de voz:\n\n"${textoBase}"\n\nResponda em tópicos diretos e objetivos.`
                            let resumoTexto = ''
                            try {
                                resumoTexto = await aiService.askAI(resumoPrompt)
                            } catch (_) {
                                resumoTexto = textoBase
                            }

                            let card = `╔══════════════════════════════╗\n`
                            card += `║    🎙️ *TRANSCRIÇÃO & RESUMO* 🎙️    ║\n`
                            card += `╚══════════════════════════════╝\n\n`
                            card += `📝 *Transcrição Literal:*\n${textoBase}\n\n`
                            card += `📌 *Resumo dos Pontos Principais:*\n${resumoTexto}\n\n`
                            card += `⚙️ *Motor STT:* ${direto.engine}\n`
                            card += `👑 *${botName}*`
                            return reply(card)
                        }

                        // B. Modo Tradução
                        if (isTraduzir) {
                            let tradPrompt = `Traduza a seguinte transcrição de áudio para ${targetLang}:\n\n"${textoBase}"\n\nRetorne apenas a tradução.`
                            let tradTexto = ''
                            try {
                                tradTexto = await aiService.askAI(tradPrompt)
                            } catch (_) {
                                tradTexto = textoBase
                            }

                            let card = `╔══════════════════════════════╗\n`
                            card += `║   🎙️ *TRANSCRIÇÃO & TRADUÇÃO* 🎙️   ║\n`
                            card += `╚══════════════════════════════╝\n\n`
                            card += `📝 *Original (Falado):*\n${textoBase}\n\n`
                            card += `🌐 *Tradução (${targetLang}):*\n${tradTexto}\n\n`
                            card += `⚙️ *Motor STT:* ${direto.engine}\n`
                            card += `👑 *${botName}*`
                            return reply(card)
                        }

                        // C. Modo Padrão
                        let card = `╔══════════════════════════════╗\n`
                        card += `║    🎙️ *TRANSCRIÇÃO DE ÁUDIO* 🎙️    ║\n`
                        card += `╚══════════════════════════════╝\n\n`
                        card += `📝 *Texto Falado:*\n${textoBase}\n\n`
                        card += `⚙️ *Motor:* ${direto.engine}\n`
                        card += `👑 *${botName}*`
                        return reply(card)
                    }
                } catch (sttErr) {
                    logger.warn(`[TRANSCREVER] Transcrição direta falhou: ${sttErr.message}`)
                }
            }

            // 4. Fallback para fila de segundo plano para áudios longos
            const r = await transcricaoLonga.enfileirar({ client, from, info, buffer, remetente: sender, ehDono: Boolean(isOwner) })
            if (r.ok) return undefined
            if (r.motivo === 'limite') {
                return reply('🎙️ Você já tem 3 transcrições em processamento. Assim que uma terminar eu aceito outra.')
            }

            return reply('❌ O processador de áudio não conseguiu converter esse arquivo no momento. Tente reenviar.')
        } catch (err) {
            logger.error('[TRANSCREVER ERROR]', err)
            return reply('❌ Ocorreu um erro ao processar o áudio. Tente reenviar.')
        }
    }
}
