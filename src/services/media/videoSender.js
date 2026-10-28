/**
 * Envio inteligente de vídeo no WhatsApp.
 *
 * DIRETRIZES:
 * 1. Até 100 MB  -> Manda direto como VÍDEO completo e original na conversa/galeria (sem rebaixar resolução nem comprimir).
 * 2. > 100 MB    -> Manda como DOCUMENTO / ARQUIVO na íntegra preservando 100% da qualidade original.
 * 3. > 2 GB      -> Sobe para o Google Drive 5TB com link da pasta e links de visualização/download direto.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const drive = require('../drive/googleDriveService')

// Limite para envio direto como vídeo (até 100 MB toca direto na conversa/galeria)
const LIMITE_GALERIA = Number(process.env.WHATSAPP_MEDIA_MAX_BYTES || 100 * 1024 * 1024)

// Limite para envio via documento/arquivo (até 2 GB)
const LIMITE_DOCUMENTO = Number(process.env.WHATSAPP_DOC_MAX_BYTES || 2000 * 1024 * 1024)

const { emMb, formatarTamanho } = require('../../utils/tamanho')

// Decimal, como o WhatsApp mostra no arquivo recebido (ver utils/tamanho.js).
const mb = b => emMb(b)

/**
 * Limite nominal para o texto: as constantes são binárias (100 MiB, 2000 MiB),
 * mas o usuário conhece "100 MB" e "2 GB".
 */
function limiteLegivel(bytes) {
    const mib = Number(bytes) / (1024 * 1024)
    if (mib >= 1000) return `${String(Math.round(mib / 100) / 10).replace('.', ',')} GB`
    return `${Math.round(mib)} MB`
}

function _ffmpeg(args, timeoutMs = 600000) {
    return new Promise(resolve => {
        const p = spawn('ffmpeg', args)
        const t = setTimeout(() => { try { p.kill() } catch (errIgnorado) { logger.warn(`[VIDEOSENDER] Falha ignorada em src/services/media/videoSender.js:41: ${errIgnorado.message}`) } resolve(false) }, timeoutMs)
        p.on('error', () => { clearTimeout(t); resolve(false) })
        p.on('close', code => { clearTimeout(t); resolve(code === 0) })
    })
}

/**
 * Função utilitária de compressão mantida para compatibilidade
 */
async function comprimirParaGaleria(origem, limiteBytes = LIMITE_GALERIA) {
    const saida = path.join(tempDir, `galeria_${Date.now()}.mp4`)
    const ok = await _ffmpeg([
        '-y', '-i', origem,
        '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.2', '-crf', '18', '-preset', 'veryfast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '320k',
        '-movflags', '+faststart',
        saida
    ])
    if (ok && fs.existsSync(saida)) return saida
    return null
}

/**
 * Sobe o arquivo original para o Drive, mostrando o progresso no WhatsApp.
 *
 * @returns {Promise<{visualizar:string, baixar:string, folderId:string, folderUrl:string}>}
 */
async function enviarParaDrive({ client, from, filePath, fileName, tamanho, mimeType = 'video/mp4' }) {
    const quota = await drive.getQuota()
    if (quota.livre < tamanho * 1.05) {
        throw new Error(`Sem espaço no Drive: faltam ${mb(tamanho - quota.livre)} MB`)
    }

    const status = await client.sendMessage(from, {
        text: `☁️ Enviando para o Drive… 0%\n${formatarTamanho(tamanho)}`
    })

    let ultimoMarco = 0
    const onProgress = (pct) => {
        if (pct < ultimoMarco + 10 && pct < 100) return
        ultimoMarco = pct
        client.sendMessage(from, {
            edit: status.key,
            text: `☁️ Enviando para o Drive… ${pct}%\n${formatarTamanho(tamanho)}`
        }).catch(e => logger.warn(`[VIDEO SENDER] Não editei o status: ${e.message}`))
    }

    const r = await drive.enviarECompartilhar({
        filePath, fileName, mimeType, onProgress
    })

    await client.sendMessage(from, {
        edit: status.key,
        text: `☁️ Envio para o Drive concluído · ${formatarTamanho(tamanho)}`
    }).catch(e => logger.warn(`[VIDEO SENDER] Não editei o status final: ${e.message}`))

    return {
        visualizar: r.visualizar,
        baixar: r.baixar,
        folderId: r.folderId,
        folderUrl: r.folderUrl
    }
}

// Container real -> tipo MIME. Desde que o download passou a buscar a maior
// resolução (2026-09-20), um vídeo pode chegar em MKV ou WebM — VP9 com Opus
// não cabe em MP4. Mandar isso como "video/mp4" chamado "x.mp4" é justamente o
// arquivo rotulado errado que dava tela preta no iPhone.
const TIPOS = { '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.webm': 'video/webm', '.mov': 'video/quicktime' }

/** Teto de legenda do WhatsApp para vídeo, foto e documento. */
const LIMITE_LEGENDA = 1024

/**
 * Ficha + nota ("mandei como arquivo porque…") na mesma legenda. Se passar do teto, a FICHA
 * encolhe e a nota fica inteira: é ela que explica por que o arquivo chegou como documento.
 */
function legendaComNota(ficha, nota) {
    const f = String(ficha || '').trim()
    const n = String(nota || '').trim()
    if (!f) return n
    if (!n) return f.length > LIMITE_LEGENDA ? f.slice(0, LIMITE_LEGENDA - 1) + '…' : f
    const folga = LIMITE_LEGENDA - n.length - 2
    if (folga < 40) return n.slice(0, LIMITE_LEGENDA)
    const corpo = f.length > folga ? f.slice(0, folga - 1) + '…' : f
    return corpo + '\n\n' + n
}

/** Extensão e MIME conferidos no arquivo que existe, não no nome pedido. */
function tipoReal(filePath, fileName) {
    const ext = path.extname(filePath).toLowerCase()
    const mimetype = TIPOS[ext] || 'video/mp4'
    const base = (fileName || path.basename(filePath)).replace(/\.[^.]+$/, '')
    return { ext: ext || '.mp4', mimetype, nome: `${base}${ext || '.mp4'}` }
}

/**
 * Envia o vídeo completo na íntegra.
 *
 * @param {object} o
 * @param {boolean} [o.preferirDocumento] usuário pediu envio como arquivo (flag -doc)
 * @returns {Promise<{modo:'video'|'documento'|'drive'|'recusado'}>}
 */
async function enviarVideo({ client, from, filePath, caption = '', info, fileName, preferirDocumento = false }) {
    // A ficha (`caption`) vai na legenda do próprio vídeo — a mesma mensagem da mídia.
    // Ficou de fora entre 2026-09-21 e 2026-10-15; o dono pediu de volta.
    const tamanho = fs.statSync(filePath).size
    const { ext, mimetype, nome } = tipoReal(filePath, fileName)
    // A reação ⏳ do início (avisoDownload) vira ✅: nenhuma mensagem de "pronto".
    const concluido = async () => require('./avisoDownload').reagir(client, from, info, '✅')
    // Mede e registra o que está saindo (resolução, fps, codec, taxas).
    require('./conferirQualidade').conferirQualidade(filePath, { tipo: 'vídeo', origem: nome })

    const comoDocumento = async (nota) => {
        const uploadTimeoutMs = Math.min(1800000, Math.max(600000, Math.round((tamanho / (1024 * 1024)) * 2500)))
        await client.sendMessage(from, {
            document: { url: filePath },
            mimetype,
            fileName: nome,
            caption: legendaComNota(caption, nota)
        }, { quoted: info, mediaUploadTimeoutMs: uploadTimeoutMs })
        await concluido()
        return { modo: 'documento' }
    }

    // 0. Arquivos maiores que 2GB (Teto máximo do WhatsApp) -> Google Drive 5TB
    if (tamanho > LIMITE_DOCUMENTO) {
        if (drive.isConfigured()) {
            try {
                const linkDrive = await enviarParaDrive({ client, from, filePath, fileName: nome, tamanho, mimeType: mimetype })
                let docMsg = `☁️ Pronto! O arquivo passou de ${limiteLegivel(LIMITE_DOCUMENTO)}, então coloquei no Drive:\n`
                docMsg += `• *Assistir:* ${linkDrive.visualizar}\n`
                docMsg += `• *Baixar:* ${linkDrive.baixar}\n`
                if (linkDrive.folderUrl) docMsg += `• *Pasta:* ${linkDrive.folderUrl}\n`
                docMsg += `\n*Arquivo:* ${nome} · ${formatarTamanho(tamanho)}`
                if (caption) docMsg += `\n\n${caption}`

                await client.sendMessage(from, { text: docMsg.trim() }, { quoted: info })
                await concluido()
                return { modo: 'drive', drive: linkDrive }
            } catch (err) {
                logger.error(`[VIDEO SENDER] Falha ao enviar "${nome}" (${formatarTamanho(tamanho)}) para o Drive: ${err.message}`)
                const semEspaco = /sem espaço/i.test(err.message || '')
                await client.sendMessage(from, {
                    text: semEspaco
                        ? `⚠️ O Drive está sem espaço para esse vídeo de ${formatarTamanho(tamanho)}. Tente de novo mais tarde.`
                        : `❌ Não consegui colocar esse vídeo de ${formatarTamanho(tamanho)} no Drive. Tente de novo mais tarde.`
                }, { quoted: info })
                return { modo: 'recusado' }
            }
        } else {
            await client.sendMessage(from, {
                text: `⚠️ Esse vídeo tem ${formatarTamanho(tamanho)} e passa do limite de ${limiteLegivel(LIMITE_DOCUMENTO)} do WhatsApp, então não consigo enviar por aqui.`
            }, { quoted: info })
            return { modo: 'recusado' }
        }
    }

    // 1. Até 100MB: manda DIRETO como VÍDEO completo e original na conversa! Sem compressão, sem perda!
    //    (Nesse tamanho o arquivo já passou pelo ensureMobileVideoCompatibility
    //    e é MP4 tocável; se ainda assim não for, vai como arquivo, com o tipo
    //    certo, em vez de virar um vídeo que não abre.)
    // O codec decide também: VP9/AV1/HEVC que a conversão não deu conta (4K em
    // 1 vCPU estoura o tempo) chegaria como vídeo que não abre no celular.
    let codecVideo = null
    try {
        const c = await require('./mediaProcessor').probeVideoCodecs(filePath)
        codecVideo = c ? c.vcodec : null
    } catch (err) {
        logger.warn(`[VIDEO SENDER] Não conferi o codec de ${nome}: ${err.message}`)
    }
    const codecDaGaleria = !codecVideo || codecVideo === 'h264' || codecVideo === 'avc1'

    if (tamanho <= LIMITE_GALERIA && !preferirDocumento && ext === '.mp4' && codecDaGaleria) {
        await client.sendMessage(from, {
            video: { url: filePath },
            caption: legendaComNota(caption, ''),
            mimetype
        }, { quoted: info, mediaUploadTimeoutMs: 300000 })
        await concluido()
        return { modo: 'video' }
    }

    // 2. Acima de 100MB e até 2GB, container que a galeria não toca, ou pedido
    //    explícito com -doc: manda via ARQUIVO / DOCUMENTO, íntegro.
    if (tamanho > LIMITE_GALERIA) {
        return comoDocumento(`📦 Mandei como arquivo porque passa de ${limiteLegivel(LIMITE_GALERIA)} — assim chega completo, na qualidade original.`)
    }
    if (ext !== '.mp4') {
        return comoDocumento(`📦 Mandei como arquivo: esse vídeo veio em ${ext.replace('.', '').toUpperCase()} e não consegui converter a tempo. O WhatsApp não abre esse formato: salve e abra num player como o VLC.`)
    }
    if (!codecDaGaleria && !preferirDocumento) {
        const { nomeCodec } = require('./formatResolver')
        return comoDocumento(`📦 Mandei como arquivo: o vídeo está em ${nomeCodec(codecVideo)} e a conversão para o formato do WhatsApp não terminou a tempo. O WhatsApp não abre esse formato: salve e abra num player como o VLC.`)
    }
    return comoDocumento('📦 Mandei como arquivo, como você pediu.')
}

module.exports = { enviarVideo, comprimirParaGaleria, LIMITE_GALERIA, LIMITE_DOCUMENTO }
