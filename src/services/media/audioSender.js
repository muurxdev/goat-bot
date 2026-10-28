/**
 * Envio inteligente de áudio no WhatsApp.
 *
 * DIRETRIZES:
 * 1. Até 100 MB  -> Manda direto como áudio completo e original na conversa (sem compressão/perda).
 * 2. > 100 MB    -> Manda como arquivo/documento na íntegra (ou partes se solicitado com -partes).
 * 3. > 2 GB      -> Sobe para o Google Drive 5TB com links de streaming e pasta.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const drive = require('../drive/googleDriveService')
const { getBotName } = require('../../config/botConfig')

// Limite prático do áudio tocável no WhatsApp (até 100 MB toca direto)
const LIMITE_AUDIO = Number(process.env.WHATSAPP_AUDIO_MAX_BYTES || 100 * 1024 * 1024)

// Limite de envio via documento/arquivo (até 2 GB)
const LIMITE_DOCUMENTO = Number(process.env.WHATSAPP_DOC_MAX_BYTES || 2000 * 1024 * 1024)

// Duração de cada parte quando o usuário pede divisão com -partes
const SEGUNDOS_POR_PARTE = Number(process.env.AUDIO_SPLIT_SECONDS || 15 * 60)

// Acima disso, dividir viraria dezenas de mensagens e floodaria o grupo
const MAX_PARTES = Number(process.env.AUDIO_MAX_PARTES || 12)

const { emMb, formatarTamanho } = require('../../utils/tamanho')

// Decimal, como o WhatsApp mostra no arquivo recebido (ver utils/tamanho.js).
const mb = b => emMb(b)

/** Limite nominal para o texto ("100 MB", "2 GB"); as constantes são binárias. */
function limiteLegivel(bytes) {
    const mib = Number(bytes) / (1024 * 1024)
    if (mib >= 1000) return `${String(Math.round(mib / 100) / 10).replace('.', ',')} GB`
    return `${Math.round(mib)} MB`
}

function _ffmpeg(args, timeoutMs = 900000) {
    return new Promise(resolve => {
        const p = spawn('ffmpeg', args)
        let erro = ''
        const t = setTimeout(() => {
            try { p.kill('SIGKILL') } catch (e) { logger.warn(`[AUDIO SENDER] ffmpeg não morreu no tempo limite: ${e.message}`) }
            resolve({ ok: false, erro: 'tempo limite do ffmpeg' })
        }, timeoutMs)
        p.stderr.on('data', d => { erro = String(d).slice(-400) })
        p.on('error', e => { clearTimeout(t); resolve({ ok: false, erro: e.message }) })
        p.on('close', code => { clearTimeout(t); resolve({ ok: code === 0, erro }) })
    })
}

/** Duração em segundos via ffprobe. Devolve 0 se não der para medir. */
function duracaoSegundos(filePath) {
    return new Promise(resolve => {
        const p = spawn('ffprobe', ['-v', 'quiet', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', filePath])
        let out = ''
        p.stdout.on('data', d => { out += d })
        p.on('error', () => resolve(0))
        p.on('close', () => resolve(Math.floor(Number(out.trim()) || 0)))
    })
}

/**
 * Divide o áudio em partes tocáveis, sem recodificar (`-c copy`): é quase
 * instantâneo e não perde qualidade.
 * @returns {Promise<string[]>} caminhos das partes, em ordem
 */
async function dividirEmPartes(origem, segundosPorParte = SEGUNDOS_POR_PARTE) {
    const dur = await duracaoSegundos(origem)
    if (!dur) return []

    const total = Math.ceil(dur / segundosPorParte)
    if (total > MAX_PARTES) {
        logger.warn(`[AUDIO SENDER] ${total} partes excede o máximo de ${MAX_PARTES} — não vou dividir`)
        return []
    }

    const dir = path.join(tempDir, `audio_partes_${Date.now()}`)
    fs.mkdirSync(dir, { recursive: true })

    const { ok, erro } = await _ffmpeg([
        '-y', '-i', origem,
        '-f', 'segment',
        '-segment_time', String(segundosPorParte),
        '-c', 'copy',
        '-reset_timestamps', '1',
        path.join(dir, 'parte_%03d.mp3')
    ])
    if (!ok) {
        logger.warn(`[AUDIO SENDER] Falha ao dividir: ${erro}`)
        try { fs.rmSync(dir, { recursive: true, force: true }) } catch (e) { logger.warn(`[AUDIO SENDER] Não limpei ${dir}: ${e.message}`) }
        return []
    }

    return fs.readdirSync(dir).sort().map(f => path.join(dir, f))
}

/** Sobe o original para o Drive mostrando progresso numa mensagem editada. */
async function enviarParaDrive({ client, from, filePath, fileName, tamanho }) {
    const quota = await drive.getQuota()
    if (quota.livre < tamanho * 1.05) {
        throw new Error(`Sem espaço no Drive: faltam ${mb(tamanho - quota.livre)} MB`)
    }

    const status = await client.sendMessage(from, {
        text: `☁️ Enviando para o Drive… 0%\n${formatarTamanho(tamanho)}`
    })

    let ultimoMarco = 0
    const onProgress = pct => {
        if (pct < ultimoMarco + 10 && pct < 100) return
        ultimoMarco = pct
        client.sendMessage(from, {
            edit: status.key,
            text: `☁️ Enviando para o Drive… ${pct}%\n${formatarTamanho(tamanho)}`
        }).catch(e => logger.warn(`[AUDIO SENDER] Não editei o status: ${e.message}`))
    }

    const r = await drive.enviarECompartilhar({
        filePath, fileName, mimeType: 'audio/mpeg', onProgress
    })

    await client.sendMessage(from, {
        edit: status.key, text: `☁️ Envio para o Drive concluído · ${formatarTamanho(tamanho)}`
    }).catch(e => logger.warn(`[AUDIO SENDER] Não editei o status final: ${e.message}`))

    return r
}

/** Fotos genéricas que alguns provedores devolvem no lugar da capa. */
const FOTO_GENERICA = /images\.unsplash\.com|placeholder|default[-_]?(cover|thumb)/i

/** Lado maior da capa anexada ao áudio. Maior que isso o WhatsApp recusa a prévia. */
const LADO_CAPA = 720

/** Um quadro de imagem de um arquivo (vídeo, ou a capa embutida no MP3), em JPEG. */
function quadroDe(caminho, { instante = null } = {}) {
    return new Promise(resolve => {
        if (!caminho || !fs.existsSync(caminho)) return resolve(null)
        const args = ['-v', 'error']
        if (instante !== null) args.push('-ss', String(instante))
        args.push('-i', caminho, '-an', '-frames:v', '1', '-f', 'image2', '-c:v', 'mjpeg', '-q:v', '2', 'pipe:1')
        const partes = []
        let ff
        try { ff = spawn('ffmpeg', args) } catch (err) {
            logger.warn(`[AUDIO SENDER] ffmpeg não iniciou para tirar a capa: ${err.message}`)
            return resolve(null)
        }
        const timer = setTimeout(() => { try { ff.kill('SIGKILL') } catch (e) { logger.warn(`[AUDIO SENDER] ffmpeg da capa não morreu: ${e.message}`) } }, 15000)
        ff.stdout.on('data', d => partes.push(d))
        ff.on('error', err => { clearTimeout(timer); logger.warn(`[AUDIO SENDER] Capa pelo ffmpeg falhou: ${err.message}`); resolve(null) })
        ff.on('close', () => {
            clearTimeout(timer)
            const buf = Buffer.concat(partes)
            resolve(buf.length > 500 ? buf : null)
        })
    })
}

/**
 * A capa do áudio como IMAGEM (Buffer), não como endereço.
 *
 * Até 2026-09-21 ia só `thumbnailUrl`, que o WhatsApp não desenha: o áudio
 * chegava com o ícone genérico de microfone/música. Ordem de preferência:
 *  1. a capa que a plataforma informou (a do vídeo, em alta);
 *  2. um quadro do próprio vídeo, quando o áudio foi tirado de um;
 *  3. a capa embutida no MP3.
 * @returns {Promise<Buffer|null>} JPEG de até 720 px
 */
async function capaDoAudio({ thumbnail, videoPath, filePath }) {
    let bruto = null
    const url = String(thumbnail || '').trim()
    if (url && /^https?:\/\//i.test(url) && !FOTO_GENERICA.test(url)) {
        try {
            // A capa pode vir de link genérico: confere cada salto (SSRF).
            const { buscarComSeguranca } = require('./urlSeguro')
            const { resposta } = await buscarComSeguranca(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0' } })
            if (resposta.ok) {
                const buf = Buffer.from(await resposta.arrayBuffer())
                if (buf.length > 500 && buf.length < 8 * 1024 * 1024) bruto = buf
            }
        } catch (err) {
            logger.warn(`[AUDIO SENDER] Capa da plataforma indisponível (${err.message}); tento pelo arquivo.`)
        }
    }
    if (!bruto && videoPath) bruto = (await quadroDe(videoPath, { instante: 2 })) || (await quadroDe(videoPath, { instante: 0 }))
    if (!bruto && filePath) bruto = await quadroDe(filePath)
    if (!bruto) return null
    try {
        const sharp = require('sharp')
        return await sharp(bruto, { failOn: 'none' }).rotate()
            .resize(LADO_CAPA, LADO_CAPA, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer()
    } catch (err) {
        logger.warn(`[AUDIO SENDER] Não consegui preparar a capa: ${err.message}`)
        return null
    }
}

/**
 * Linhas de informação que vão sob a capa, na própria mensagem do áudio:
 *   Cjota · 4:20
 *   MP3 · 320 kbps · 10,5 MB
 *   YouTube
 * Sem kHz e sem canais (pedido do dono, 2026-10-15): só o formato, a taxa em kbps e o tamanho.
 */
function infoDoAudio(filePath, { author = '', url = '' } = {}) {
    try {
        const { probeMedia, formatDuration, rotuloTaxa, formatBytes } = require('./formatResolver')
        const p = probeMedia(filePath)
        const artista = String(author || '').replace(/\s*-\s*Topic\s*$/i, '').trim()
        const duracao = p && p.durationSec > 0 ? formatDuration(p.durationSec) : ''
        const formato = (path.extname(filePath).replace('.', '') || (p && p.container) || '').toUpperCase()
        let tamanho = p && p.sizeBytes ? formatBytes(p.sizeBytes) : ''
        if (!tamanho) { try { tamanho = formatBytes(fs.statSync(filePath).size) } catch (e) { logger.warn(`[AUDIO SENDER] Sem tamanho de ${filePath}: ${e.message}`) } }
        let origem = ''
        if (url && /^https?:\/\//i.test(url)) {
            const nome = require('./plataformas').identificarLink(url).nome
            if (nome && nome !== 'Web') origem = nome
        }
        return [
            [artista, duracao].filter(Boolean).join(' · '),
            [formato, p ? rotuloTaxa(p.bitrateKbps) : null, tamanho].filter(Boolean).join(' · '),
            origem
        ].filter(Boolean)
    } catch (err) {
        logger.warn(`[AUDIO SENDER] Sem as informações do arquivo: ${err.message}`)
        return [String(author || '').trim()].filter(Boolean)
    }
}

/**
 * A capa pequena que vai DENTRO da mensagem (externalAdReply.thumbnail). É enviada em bytes, junto
 * do áudio, então precisa ser leve: 400 px e no máximo ~45 KB. A capa de 720 px (60–120 KB) é a que
 * acompanhava o áudio quando ele não chegou no celular na VPS nova (2026-10-15).
 * @param {Buffer} capa
 * @returns {Promise<Buffer|null>}
 */
async function capaLeve(capa) {
    if (!capa || !capa.length) return null
    try {
        const sharp = require('sharp')
        const tentativas = [[400, 72], [400, 58], [320, 55], [256, 50]]
        let melhor = null
        for (const [lado, qualidade] of tentativas) {
            melhor = await sharp(capa, { failOn: 'none' }).rotate()
                .resize(lado, lado, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: qualidade, mozjpeg: true })
                .toBuffer()
            if (melhor.length <= 45 * 1024) break
        }
        return melhor
    } catch (err) {
        logger.warn(`[AUDIO SENDER] Não deixei a capa leve: ${err.message}`)
        return null
    }
}

/**
 * Prévia que acompanha o próprio áudio, na MESMA mensagem: a capa grande no topo, o título e as
 * informações logo abaixo, e o player do áudio embaixo. Sem capa da plataforma, usa uma gerada com
 * o título — o áudio nunca sai sem imagem.
 * @returns {Promise<object|null>} contextInfo do Baileys
 */
async function previaDoAudio({ thumbnail, videoPath, filePath, title, author, url }) {
    let capa = await capaDoAudio({ thumbnail, videoPath, filePath })
    if (!capa) capa = await capaQuadrada(null, title, author)
    const leve = await capaLeve(capa)
    const linhas = infoDoAudio(filePath, { author, url })
    if (!leve && !linhas.length) return null
    return {
        externalAdReply: {
            title: String(title || '').trim().slice(0, 90) || 'Áudio',
            body: (linhas.join('\n') || getBotName()).slice(0, 220),
            mediaType: 1,
            ...(leve ? { thumbnail: leve, renderLargerThumbnail: true } : {}),
            ...(url ? { sourceUrl: url, mediaUrl: url } : {}),
            showAdAttribution: false
        }
    }
}

const LIMITE_LEGENDA = 1024
const LADO_CAPA_VIDEO = 720

/** Quebra o texto em linhas de até `max` caracteres (para a capa gerada). */
function quebrarEmLinhas(texto, max, maxLinhas) {
    const palavras = String(texto || '').split(/\s+/).filter(Boolean)
    const linhas = []
    let atual = ''
    for (const p of palavras) {
        if ((atual + ' ' + p).trim().length > max) { if (atual) linhas.push(atual); atual = p } else atual = (atual + ' ' + p).trim()
    }
    if (atual) linhas.push(atual)
    if (linhas.length > maxLinhas) { linhas.length = maxLinhas; linhas[maxLinhas - 1] = linhas[maxLinhas - 1].replace(/.{0,2}$/, '…') }
    return linhas
}

const escXml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/**
 * A capa que vira o quadro do vídeo: quadrada, 720 px. Com a capa da plataforma ela é só
 * enquadrada; sem capa, gera uma tela escura com o título (nunca deixa o áudio sem imagem).
 * @returns {Promise<Buffer|null>} JPEG
 */
async function capaQuadrada(capa, titulo, autor) {
    try {
        const sharp = require('sharp')
        if (capa && capa.length) {
            return await sharp(capa, { failOn: 'none' })
                .resize(LADO_CAPA_VIDEO, LADO_CAPA_VIDEO, { fit: 'contain', background: '#101010' })
                .jpeg({ quality: 88 }).toBuffer()
        }
        const tit = quebrarEmLinhas(titulo || 'Áudio', 22, 4)
        const aut = quebrarEmLinhas(autor || '', 30, 1)
        const linhasSvg = tit.map((l, i) => `<text x="360" y="${300 + i * 58}" text-anchor="middle" font-size="46" font-weight="700" fill="#ffffff">${escXml(l)}</text>`).join('')
        const autorSvg = aut.length ? `<text x="360" y="${300 + tit.length * 58 + 30}" text-anchor="middle" font-size="30" fill="#b9b9c9">${escXml(aut[0])}</text>` : ''
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b1055"/><stop offset="1" stop-color="#0f0c29"/></linearGradient></defs><rect width="720" height="720" fill="url(#g)"/><text x="360" y="200" text-anchor="middle" font-size="110" fill="#ffffff" opacity="0.85">♪</text>${linhasSvg}${autorSvg}</svg>`
        return await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer()
    } catch (err) {
        logger.warn(`[AUDIO SENDER] Não montei a capa do vídeo: ${err.message}`)
        return null
    }
}

/**
 * Manda capa + ficha + áudio numa MENSAGEM SÓ: um vídeo MP4 (imagem parada + o áudio em AAC 320k)
 * com a ficha na legenda. Devolve true se saiu; false para o chamador usar o caminho antigo.
 * Nada aqui lança: acabamento nunca pode impedir a entrega.
 */
async function audioComCapaEmUmaMensagem({ client, from, info, filePath, caption, thumbnail, videoPath, title, author }) {
    const pasta = path.join(tempDir, 'audio-capa')
    const id = 'ac_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
    const capaJpg = path.join(pasta, id + '.jpg')
    const saida = path.join(pasta, id + '.mp4')
    const limpar = () => {
        for (const f of [capaJpg, saida]) {
            try { if (fs.existsSync(f)) fs.unlinkSync(f) } catch (err) { logger.warn(`[AUDIO SENDER] Sobrou ${f}: ${err.message}`) }
        }
    }
    try {
        fs.mkdirSync(pasta, { recursive: true })
        const capaOriginal = await capaDoAudio({ thumbnail, videoPath, filePath })
        const imagem = await capaQuadrada(capaOriginal, title, author)
        if (!imagem) return false
        fs.writeFileSync(capaJpg, imagem)

        const dur = await duracaoSegundos(filePath)
        const limite = Math.max(120000, Math.round((dur || 0) * 500) + 60000)
        // 5 quadros/s e keyframe a cada 5 s: imagem parada custa quase nada e o aparelho ainda
        // consegue avançar a música. Áudio vai em AAC 320k — o MP3 de 320k passa sem perda audível.
        const r = await _ffmpeg([
            '-y', '-loglevel', 'error',
            '-loop', '1', '-framerate', '5', '-i', capaJpg,
            '-i', filePath,
            '-map', '0:v:0', '-map', '1:a:0',
            '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'veryfast', '-crf', '30',
            '-pix_fmt', 'yuv420p', '-r', '5', '-g', '25',
            '-c:a', 'aac', '-b:a', '320k',
            '-shortest', '-movflags', '+faststart', saida
        ], limite)
        if (!r.ok || !fs.existsSync(saida)) {
            logger.warn(`[AUDIO SENDER] Capa+áudio em um vídeo falhou (${r.erro}); sigo com ficha e áudio separados.`)
            return false
        }
        const tamanhoSaida = fs.statSync(saida).size
        if (tamanhoSaida > LIMITE_AUDIO) {
            logger.info(`[AUDIO SENDER] O vídeo com capa ficou com ${mb(tamanhoSaida)} MB (> ${mb(LIMITE_AUDIO)}); uso o caminho antigo.`)
            return false
        }

        const legenda = legendaDoAudio({ caption, title, author, filePath, url: '' })

        await client.sendMessage(from, {
            video: { url: saida },
            caption: legenda,
            mimetype: 'video/mp4'
        }, { quoted: info, mediaUploadTimeoutMs: 300000 })
        return true
    } catch (err) {
        logger.warn(`[AUDIO SENDER] Envio capa+ficha+áudio em uma mensagem falhou: ${err.message}`)
        return false
    } finally {
        limpar()
    }
}

/** A legenda (≤ 1024) que acompanha a capa: a ficha pronta, ou o essencial quando ela não vem. */
function legendaDoAudio({ caption, title, author, filePath, url }) {
    let legenda = String(caption || '').trim()
    if (!legenda) {
        const linhas = infoDoAudio(filePath, { author, url })
        legenda = [`🎵 *${String(title || 'Áudio').slice(0, 100)}*`, ...linhas].filter(Boolean).join('\n')
    }
    if (legenda.length > LIMITE_LEGENDA) legenda = legenda.slice(0, LIMITE_LEGENDA - 1).trimEnd() + '…'
    return legenda
}

/** A capa em JPEG para mandar como imagem: a da plataforma/vídeo, ou uma gerada com o título. */
async function imagemDaCapa({ thumbnail, videoPath, filePath, title, author }) {
    const original = await capaDoAudio({ thumbnail, videoPath, filePath })
    return original || await capaQuadrada(null, title, author)
}

/**
 * Modo "capa": a capa com as informações na legenda (UMA mensagem de imagem) e o áudio logo
 * abaixo. É o modo que SEMPRE chega — imagem com legenda e áudio liso são tipos que qualquer
 * WhatsApp entrega. Devolve false se a imagem não saiu (o chamador usa o caminho de texto).
 */
async function audioComCapaEmImagem({ client, from, info, filePath, nome, caption, thumbnail, videoPath, title, author, url }) {
    let imagem = null
    try {
        imagem = await imagemDaCapa({ thumbnail, videoPath, filePath, title, author })
        if (!imagem) return false
        await client.sendMessage(from, {
            image: imagem,
            caption: legendaDoAudio({ caption, title, author, filePath, url })
        }, { quoted: info })
    } catch (err) {
        logger.warn(`[AUDIO SENDER] A capa com as informações não saiu em ${from}: ${err.message}`)
        return false
    }
    await client.sendMessage(from, {
        audio: { url: filePath },
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: nome
    }, { quoted: info, mediaUploadTimeoutMs: 300000 })
    return true
}

/**
 * Modo "documento": o áudio como ARQUIVO, com a capa na miniatura e as informações na legenda —
 * tudo numa mensagem só. Não toca no player de áudio do chat (abre ao tocar), por isso não é o
 * padrão; existe para quem prefere uma mensagem única.
 */
async function audioComoDocumentoComCapa({ client, from, info, filePath, nome, caption, thumbnail, videoPath, title, author, url }) {
    try {
        const imagem = await imagemDaCapa({ thumbnail, videoPath, filePath, title, author })
        const leve = await capaLeve(imagem)
        await client.sendMessage(from, {
            document: { url: filePath },
            mimetype: 'audio/mpeg',
            fileName: nome,
            caption: legendaDoAudio({ caption, title, author, filePath, url }),
            ...(leve ? { jpegThumbnail: leve } : {})
        }, { quoted: info, mediaUploadTimeoutMs: 300000 })
        return true
    } catch (err) {
        logger.warn(`[AUDIO SENDER] O áudio como documento com capa falhou em ${from}: ${err.message}`)
        return false
    }
}

/**
 * Envia o áudio completo em qualidade máxima.
 *
 * O áudio sai com a capa real e o resumo (artista, duração, taxa) na prévia, e a
 * ficha em texto (`caption`) logo antes dele — áudio do WhatsApp não tem legenda.
 * Entre 2026-09-21 e 2026-10-15 a ficha ficou de fora a pedido do dono; ele pediu de volta.
 *
 * @param {object} o
 * @param {string} [o.caption]         ficha da mídia (texto antes do áudio; legenda em documento)
 * @param {string} [o.thumbnail]       capa da plataforma
 * @param {string} [o.videoPath]       vídeo de onde o áudio saiu (quadro de capa)
 * @param {boolean} [o.preferirPartes] força a divisão se pedido explicitamente
 * @returns {Promise<{modo:string}>}
 */
async function enviarAudio({ client, from, filePath, caption = '', info, fileName, preferirPartes = false, thumbnail = null, videoPath = null, title = '', author = '', url = '' }) {
    const tamanho = fs.statSync(filePath).size
    const nome = fileName || path.basename(filePath)
    const tituloLimpo = nome.replace(/\.[^.]+$/, '')
    // Como a capa e as informações acompanham o áudio (AUDIO_NUMA_MENSAGEM):
    //   capa (padrão)   — a capa com as informações na legenda (imagem) e o áudio liso logo abaixo.
    //                     Só usa tipos de mensagem que todo WhatsApp entrega.
    //   previa          — UMA mensagem: o áudio com a capa e as informações na prévia (externalAdReply).
    //                     NÃO é o padrão: o WhatsApp do dono descartava o áudio em silêncio
    //                     (o log dizia "enviado" e nada chegava), com capa de 720 px e de 400 px.
    //   documento       — UMA mensagem: o áudio como arquivo, capa na miniatura e informações na legenda.
    //   video           — UMA mensagem: o áudio num MP4 de imagem parada com a ficha na legenda.
    //   off             — ficha em texto e o áudio liso logo depois.
    const modo = ['capa', 'previa', 'documento', 'video', 'off'].includes(String(process.env.AUDIO_NUMA_MENSAGEM || '').toLowerCase())
        ? String(process.env.AUDIO_NUMA_MENSAGEM).toLowerCase()
        : 'capa'
    const previa = modo === 'previa'
        ? await previaDoAudio({ thumbnail, videoPath, filePath, title: title || tituloLimpo, author, url })
        : null
    const concluido = async () => require('./avisoDownload').reagir(client, from, info, '✅')
    // Mede e registra o que está saindo (taxa, amostragem, canais).
    require('./conferirQualidade').conferirQualidade(filePath, { tipo: 'áudio', origem: nome })

    // 0. Arquivos maiores que 2GB (Teto máximo do WhatsApp) -> Google Drive 5TB
    if (tamanho > LIMITE_DOCUMENTO) {
        if (drive.isConfigured()) {
            try {
                const r = await enviarParaDrive({ client, from, filePath, fileName: nome, tamanho })
                let docMsg = `☁️ Pronto! O arquivo passou de ${limiteLegivel(LIMITE_DOCUMENTO)}, então coloquei no Drive:\n`
                docMsg += `• *Ouvir:* ${r.visualizar}\n`
                docMsg += `• *Baixar:* ${r.baixar}\n`
                if (r.folderUrl) docMsg += `• *Pasta:* ${r.folderUrl}\n`
                docMsg += `\n*Arquivo:* ${tituloLimpo} · ${formatarTamanho(tamanho)}`
                if (caption) docMsg += `\n\n${caption}`
                await client.sendMessage(from, { text: docMsg.trim() }, { quoted: info })
                await concluido()
                return { modo: 'drive', drive: r }
            } catch (err) {
                logger.error(`[AUDIO SENDER] Falha ao enviar "${nome}" (${formatarTamanho(tamanho)}) para o Drive: ${err.message}`)
            }
        }
    }

    // 1a. Até 100MB, UMA mensagem só: capa + ficha + áudio. Áudio do WhatsApp não tem legenda, então
    //     o áudio vai num vídeo de imagem parada (a capa) e a ficha é a legenda desse vídeo — é o
    //     que o dono pediu em 2026-10-15 ("a capa, as informações e o áudio tudo junto, numa só").
    //     Se não der (ffmpeg, tamanho), cai no caminho antigo logo abaixo.
    if (tamanho <= LIMITE_AUDIO && !preferirPartes && (modo === 'capa' || modo === 'documento')) {
        const dados = { client, from, info, filePath, nome, caption, thumbnail, videoPath, title: title || tituloLimpo, author, url }
        const ok = modo === 'capa' ? await audioComCapaEmImagem(dados) : await audioComoDocumentoComCapa(dados)
        if (ok) {
            await concluido()
            return { modo: 'audio-' + modo }
        }
    }

    if (tamanho <= LIMITE_AUDIO && !preferirPartes && modo === 'video') {
        const combinado = await audioComCapaEmUmaMensagem({
            client, from, info, filePath, caption, thumbnail, videoPath, title: title || tituloLimpo, author
        })
        if (combinado) {
            await concluido()
            return { modo: 'audio-com-capa' }
        }
    }

    // 1. Até 100MB: manda DIRETO como áudio completo e original. Áudio do WhatsApp não tem
    //    legenda, então a ficha vai em texto logo antes (a capa viaja anexada ao próprio áudio).
    if (tamanho <= LIMITE_AUDIO && !preferirPartes) {
        // Com a prévia, as informações já vão na própria mensagem do áudio: nada de texto antes.
        if (caption && !previa) {
            try {
                await client.sendMessage(from, { text: caption }, { quoted: info })
            } catch (err) {
                // A ficha é acabamento: se ela falhar, o áudio ainda precisa chegar.
                logger.warn(`[AUDIO SENDER] A ficha não saiu em ${from}: ${err.message}`)
            }
        }
        await client.sendMessage(from, {
            audio: { url: filePath },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: nome,
            ...(previa ? { contextInfo: previa } : {})
        }, { quoted: info, mediaUploadTimeoutMs: 300000 })
        await concluido()
        return { modo: 'audio' }
    }

    logger.info(`[AUDIO SENDER] "${nome}" tem ${mb(tamanho)} MB — acima de ${mb(LIMITE_AUDIO)} MB`)

    // 2. Se o usuário explicitamente pediu para dividir em partes
    if (preferirPartes) {
        const partes = await dividirEmPartes(filePath)
        if (partes.length) {
            await client.sendMessage(from, {
                text: (caption ? caption + '\n\n' : '') +
                    `🎧 *${tituloLimpo}*\n` +
                    `Com ${formatarTamanho(tamanho)}, não cabe numa mensagem só. ` +
                    `Vou mandar em *${partes.length} partes* de uns ${Math.round(SEGUNDOS_POR_PARTE / 60)} min — todas tocam aqui.`
            }, { quoted: info })

            let enviadas = 0
            for (const [i, parte] of partes.entries()) {
                try {
                    await client.sendMessage(from, {
                        audio: { url: parte },
                        mimetype: 'audio/mpeg',
                        ptt: false,
                        fileName: `${tituloLimpo} (${i + 1} de ${partes.length}).mp3`,
                        ...(previa ? { contextInfo: previa } : {})
                    }, { mediaUploadTimeoutMs: 300000 })
                    enviadas++
                } catch (e) {
                    logger.warn(`[AUDIO SENDER] Parte ${i + 1}/${partes.length} falhou: ${e.message}`)
                }
            }

            try { fs.rmSync(path.dirname(partes[0]), { recursive: true, force: true }) } catch (e) {
                logger.warn(`[AUDIO SENDER] Não limpei as partes: ${e.message}`)
            }
            if (enviadas) await concluido()
            return { modo: 'partes', partes: enviadas }
        }
    }

    // 3. Maior que 100MB e até 2GB: manda como DOCUMENTO / ARQUIVO completo
    await client.sendMessage(from, {
        document: { url: filePath },
        mimetype: 'audio/mpeg',
        fileName: nome,
        caption: (caption ? caption + '\n\n' : '') +
            `📦 Mandei como arquivo porque passa de ${limiteLegivel(LIMITE_AUDIO)} — assim chega completo.`,
        // Documento também leva a capa, como miniatura do arquivo.
        ...(previa?.externalAdReply?.thumbnail ? { jpegThumbnail: previa.externalAdReply.thumbnail } : {})
    }, { quoted: info, mediaUploadTimeoutMs: 600000 })
    await concluido()
    return { modo: 'documento' }
}

module.exports = {
    enviarAudio, dividirEmPartes, duracaoSegundos, LIMITE_AUDIO, LIMITE_DOCUMENTO, SEGUNDOS_POR_PARTE,
    // usados por .testeaudio
    _internos: { previaDoAudio, capaLeve, capaQuadrada, imagemDaCapa, legendaDoAudio, infoDoAudio, audioComCapaEmUmaMensagem }
}
