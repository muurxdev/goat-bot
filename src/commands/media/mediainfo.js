/**
 * Comando .mediainfo — ficha técnica completa de um arquivo ou link.
 *
 * Uso sem marcar ninguém: basta ARRASTAR (responder) a mensagem com a mídia e
 * mandar `.mediainfo`. Também vale na legenda da própria mídia, ou com um link
 * (aí mostra os melhores formatos que a plataforma oferece, sem baixar).
 *
 * A legenda dos downloads continua com o resumo; aqui vai tudo o que o arquivo
 * informa — ver src/services/media/fichaTecnica.js.
 */

const fs = require('fs')
const path = require('path')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const F = require('../../utils/formato')
const { formatarTamanho } = require('../../utils/tamanho')

// Acima disso não baixo para analisar: a VPS tem disco e memória contados.
// Mostro o que o próprio WhatsApp informa sobre o arquivo.
const LIMITE_ANALISE = Number(process.env.MEDIAINFO_MAX_BYTES || 400 * 1024 * 1024)

const TIPOS_MIDIA = ['videoMessage', 'imageMessage', 'audioMessage', 'stickerMessage', 'documentMessage', 'ptvMessage']
const ENVELOPES = ['ephemeralMessage', 'viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension', 'documentWithCaptionMessage', 'editedMessage']

/** Abre os envelopes do WhatsApp (temporária, visualização única…). */
function desembrulhar(msg, prof = 0) {
    if (!msg || prof > 4) return { msg, visuUnica: false }
    for (const env of ENVELOPES) {
        if (msg[env]?.message) {
            const r = desembrulhar(msg[env].message, prof + 1)
            return { msg: r.msg, visuUnica: r.visuUnica || /viewOnce/.test(env) }
        }
    }
    return { msg, visuUnica: false }
}

/** Primeira mídia da mensagem: { chave, no } ou null. */
function acharMidia(msg) {
    if (!msg) return null
    const chave = TIPOS_MIDIA.find(k => msg[k])
    return chave ? { chave, no: msg[chave] } : null
}

/** Extensão para o arquivo temporário a partir do MIME. */
function extensao(mime, chave) {
    const m = String(mime || '').split(';')[0].trim()
    const mapa = {
        'video/mp4': 'mp4', 'video/3gpp': '3gp', 'video/quicktime': 'mov', 'video/webm': 'webm', 'video/x-matroska': 'mkv',
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic',
        'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/aac': 'aac', 'audio/wav': 'wav', 'audio/flac': 'flac',
        'application/pdf': 'pdf'
    }
    return mapa[m] || (chave === 'stickerMessage' ? 'webp' : 'bin')
}

/** O que o próprio WhatsApp diz do arquivo — sai mesmo sem baixar. */
function dadosDaMensagem(chave, no, visuUnica) {
    const l = []
    const add = (e, r, v) => { if (v !== null && v !== undefined && v !== '' && v !== false) l.push(`${e} *${r}:* ${v}`) }
    const tipo = {
        videoMessage: no.gifPlayback ? 'GIF (vídeo em loop)' : 'vídeo',
        ptvMessage: 'vídeo de bolinha',
        imageMessage: 'foto',
        audioMessage: no.ptt ? 'nota de voz' : 'áudio',
        stickerMessage: no.isAnimated ? 'figurinha animada' : 'figurinha',
        documentMessage: 'documento (arquivo original, sem compressão do WhatsApp)'
    }[chave]
    add('📨', 'Enviado como', tipo)
    add('📄', 'Nome', no.fileName)
    add('🏷️', 'MIME', no.mimetype)
    add('💾', 'Tamanho declarado', Number(no.fileLength) > 0 ? formatarTamanho(Number(no.fileLength)) : null)
    add('⏱️', 'Duração declarada', Number(no.seconds) > 0 ? `${no.seconds} s` : null)
    add('📐', 'Dimensões declaradas', no.width && no.height ? `${no.width}×${no.height} px` : null)
    add('📑', 'Páginas', Number(no.pageCount) > 0 ? no.pageCount : null)
    add('👁️', 'Visualização única', visuUnica ? 'sim' : null)
    add('🤖', 'Figurinha feita por IA', no.isAiSticker ? 'sim' : null)
    return l
}

module.exports = {
    name: 'mediainfo',
    // ".ficha" também chega aqui quando responde a uma mídia (ver general/dossie.js).
    aliases: ['fichamidia', 'infomidia', 'midiainfo', 'infoarquivo', 'dadosarquivo', 'dadosmidia', 'metadados', 'exif', 'fichaarquivo', 'fichatecnica',
        'fichavideo', 'fichaaudio', 'fichafoto', 'infovideo', 'infoaudio', 'infofoto', 'infoimagem', 'dadosvideo', 'propriedades', 'arquivoinfo'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Ficha técnica completa de vídeo, áudio, foto, figurinha ou documento: codec, resolução, fps, taxa, amostragem e tudo mais',
    usage: '(responda a uma mídia) | <link>',
    examples: [
        ' — respondendo a um vídeo, foto, áudio, figurinha ou documento',
        'https://youtu.be/xxxx — melhores formatos que o link oferece'
    ],
    cooldownMs: 5000,
    execute: async ({ info, quotedMsg, quotedSender, from, client, reply, directText, quotedText, sender, prefix = '.' }) => {
        // 1. Mídia: a da mensagem respondida (arrastada) ou a da própria mensagem.
        const respondida = quotedMsg ? desembrulhar(quotedMsg) : { msg: null, visuUnica: false }
        const propria = desembrulhar(info?.message)
        const alvoResp = acharMidia(respondida.msg)
        const alvoProprio = alvoResp ? null : acharMidia(propria.msg)
        const alvo = alvoResp || alvoProprio
        const visuUnica = alvoResp ? respondida.visuUnica : propria.visuUnica

        if (alvo) {
            const { chave, no } = alvo
            const naMensagem = dadosDaMensagem(chave, no, visuUnica)
            const declarado = Number(no.fileLength) || 0

            if (declarado > LIMITE_ANALISE) {
                return reply(F.tela({
                    emoji: '🔬',
                    titulo: 'Arquivo grande demais para abrir',
                    intro: `Esse arquivo tem ${formatarTamanho(declarado)}; eu abro até ${formatarTamanho(LIMITE_ANALISE)}. Isto é o que o WhatsApp informa sobre ele:`,
                    secoes: [{ emoji: '📨', titulo: 'Na mensagem', linhas: naMensagem }],
                    prefix
                }))
            }

            // A chave da mensagem respondida vem do contextInfo (id e autor).
            const ctx = propria.msg && Object.values(propria.msg).find(m => m && typeof m === 'object' && m.contextInfo)?.contextInfo
            const embrulho = alvoResp
                ? { key: { remoteJid: from, id: ctx?.stanzaId, participant: quotedSender || ctx?.participant, fromMe: false }, message: { [chave]: no } }
                : { key: info.key, message: { [chave]: no } }

            const arquivo = path.join(tempDir, `ficha_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extensao(no.mimetype, chave)}`)
            try {
                await react(client, from, info, '🔬')
                const ficha = require('../../services/media/fichaTecnica')
                await ficha.baixarMidiaParaArquivo(embrulho, client, arquivo, LIMITE_ANALISE)
                const { fichaDoArquivo } = ficha
                const origem = { stickerMessage: 'Figurinha', ptvMessage: 'Vídeo' }[chave]
                    || (chave === 'audioMessage' && no.ptt ? 'Nota de voz' : null)
                    || (chave === 'videoMessage' && no.gifPlayback ? 'GIF' : null)
                const texto = await fichaDoArquivo(arquivo, { nome: no.fileName || null, mimetype: no.mimetype || null, origem, naMensagem })
                return reply(texto)
            } catch (err) {
                logger.warn(`[MEDIAINFO] Não analisei a mídia (${chave}) em ${from}: ${err.message}`)
                return reply(F.tela({
                    emoji: '⚠️',
                    titulo: 'Não consegui abrir essa mídia',
                    intro: 'O WhatsApp não me entregou o arquivo (mídia antiga ou apagada do servidor costuma dar isso). Isto é o que a mensagem informa:',
                    secoes: [{ emoji: '📨', titulo: 'Na mensagem', linhas: naMensagem }],
                    dica: 'Se a mídia for recente, reenvie e responda de novo.',
                    prefix
                }))
            } finally {
                try { if (fs.existsSync(arquivo)) fs.unlinkSync(arquivo) } catch (err) { logger.warn(`[MEDIAINFO] Não apaguei ${arquivo}: ${err.message}`) }
            }
        }

        // 2. Link: no próprio pedido ou na mensagem respondida.
        const link = (String(directText || '').match(/https?:\/\/\S+/) || String(quotedText || '').match(/https?:\/\/\S+/) || [])[0]
        if (link) {
            try {
                await react(client, from, info, '🔬')
                const { fichaDoLink } = require('../../services/media/fichaTecnica')
                return reply(await fichaDoLink(link, { userJid: sender }))
            } catch (err) {
                logger.warn(`[MEDIAINFO] Ficha do link ${link} falhou: ${err.message}`)
                const { falaDeErro } = require('../../services/media/mediaErrors')
                return reply(falaDeErro(err, { alvo: link, acao: 'ler os formatos de' }))
            }
        }

        // 3. Nada para analisar: explica o uso.
        return reply(F.tela({
            emoji: '🔬',
            titulo: 'Ficha técnica de arquivo',
            intro: 'Mostro tudo o que um arquivo informa: codec, resolução em pixels, fps, taxa de bits, amostragem, canais, cor, HDR, EXIF da foto e metadados.',
            secoes: [{ emoji: '✍️', titulo: 'Como usar', linhas: [
                `• Arraste (responda) um vídeo, foto, áudio, figurinha ou documento e mande ${F.cmd(prefix, 'mediainfo')}`,
                `• Ou mande ${F.cmd(prefix, 'mediainfo')} na legenda da própria mídia`,
                `• ${F.cmd(prefix, 'mediainfo', '<link>')} — o melhor formato que o link oferece`
            ] }],
            dica: 'Não precisa marcar ninguém: basta responder a mensagem.',
            prefix
        }))
    }
}

/** Reação de "analisando". Detalhe visual: falha aqui não atrapalha nada. */
async function react(client, from, info, emoji) {
    if (!client?.sendMessage || !info?.key) return
    try {
        await client.sendMessage(from, { react: { text: emoji, key: info.key } })
    } catch (err) {
        logger.debug(`[MEDIAINFO] Reação não saiu: ${err.message}`)
    }
}
