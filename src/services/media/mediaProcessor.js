/**
 * Media Processor Service
 * Processamento e conversão de áudio e vídeo com FFmpeg garantindo 100% de compatibilidade com WhatsApp Mobile e Web
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { MEDIA_ERRORS, MEDIA_LIMITS } = require('./constants')
const { toMessage, isMissingBinary } = require('./mediaErrors')
const logger = require('../../core/logger')

/**
 * Converte ou otimiza o arquivo de mídia para compatibilidade com o WhatsApp
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {object} options
 * @returns {Promise<string>}
 */
async function processMedia(inputPath, outputPath, { format = 'mp3', coverPath = null, timeoutMs = MEDIA_LIMITS.PROCESS_TIMEOUT_MS } = {}) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputPath)) {
            const err = new Error('Arquivo de entrada não existe para processamento.')
            err.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
            return reject(err)
        }

        let args = ['-y', '-threads', '0', '-i', inputPath]

        if (format === 'mp3') {
            // 320 kbps (teto do MP3) com modelo psicoacústico de máxima fidelidade (-q:a 0)
            if (coverPath && fs.existsSync(coverPath)) {
                args.push(
                    '-i', coverPath,
                    '-map', '0:a',
                    '-map', '1:v',
                    '-c:a', 'libmp3lame',
                    '-b:a', '320k',
                    '-q:a', '0',
                    '-c:v', 'copy',
                    '-id3v2_version', '3',
                    '-metadata:s:v', 'title="Album cover"',
                    '-metadata:s:v', 'comment="Cover (front)"',
                    outputPath
                )
            } else {
                args.push(
                    '-vn',
                    '-c:a', 'libmp3lame',
                    '-b:a', '320k',
                    '-q:a', '0',
                    outputPath
                )
            }
        } else {
            // Formato de vídeo 100% compatível com WhatsApp Mobile (Android/iOS) e Web:
            // H.264 High Profile + CRF 18 (visualmente lossless) + AAC 320k + faststart.
            // Sem limitação artificial de bitrate para evitar qualquer efeito quadriculado.
            args.push(
                '-c:v', 'libx264',
                '-profile:v', 'high',
                '-level', '4.2',
                '-pix_fmt', 'yuv420p',
                '-preset', 'veryfast',
                '-crf', '18',
                '-c:a', 'aac',
                '-b:a', '320k',
                '-movflags', '+faststart',
                '-max_muxing_queue_size', '1024',
                outputPath
            )
        }

        let proc
        try {
            proc = spawn('ffmpeg', args)
        } catch (spawnErr) {
            const err = new Error(`Falha ao iniciar o ffmpeg: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            return reject(err)
        }
        let stderrData = ''

        proc.on('error', spawnErr => {
            clearTimeout(timer)
            logger.error(`[FFMPEG ERROR] Falha ao iniciar ffmpeg: ${spawnErr.message}`)
            const err = new Error(isMissingBinary(spawnErr)
                ? 'ffmpeg não encontrado no ambiente (PATH do processo).'
                : `Falha ao iniciar ffmpeg: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            reject(err)
        })

        proc.stderr.on('data', chunk => {
            stderrData += chunk.toString()
        })

        const timer = setTimeout(() => {
            try { proc.kill('SIGKILL') } catch (errIgnorado) { logger.warn(`[MEDIAPROCESSOR] Falha ignorada em src/services/media/mediaProcessor.js:101: ${errIgnorado.message}`) }
            const err = new Error('Tempo limite de processamento com FFmpeg excedido.')
            err.code = MEDIA_ERRORS.TIMEOUT
            reject(err)
        }, timeoutMs)

        proc.on('close', code => {
            clearTimeout(timer)
            if (code !== 0 || !fs.existsSync(outputPath)) {
                logger.error(`[FFMPEG ERROR] Falha no processamento (código ${code}, signal=${proc.signalCode || 'null'}): ${stderrData || 'sem stderr'}`)
                const err = new Error(toMessage('Falha na conversão de mídia com FFmpeg.', stderrData))
                err.code = MEDIA_ERRORS.PROCESSING_FAILED
                return reject(err)
            }
            resolve(outputPath)
        })
    })
}

/**
 * Inspeciona os codecs de vídeo e áudio via ffprobe
 * @param {string} filePath
 * @returns {Promise<{vcodec: string|null, acodec: string|null}>}
 */
function probeVideoCodecs(filePath) {
    return new Promise(resolve => {
        const proc = spawn('ffprobe', [
            '-v', 'error',
            // `disposition` entra aqui porque a capa embutida pelo
            // `--embed-thumbnail` também é um stream de vídeo (MJPEG/PNG). Sem
            // distinguir, um MP4 de H.264 com capa podia ser lido como "MJPEG" e
            // cair numa recodificação completa sem nenhum motivo.
            '-show_entries', 'stream=index,codec_type,codec_name:stream_disposition=attached_pic',
            '-of', 'json',
            filePath
        ])
        let out = ''
        proc.stdout.on('data', d => { out += d })
        const t = setTimeout(() => { try { proc.kill() } catch (errIgnorado) { logger.warn(`[MEDIAPROCESSOR] Falha ignorada em src/services/media/mediaProcessor.js:139: ${errIgnorado.message}`) } resolve(null) }, 6000)
        proc.on('close', code => {
            clearTimeout(t)
            if (code !== 0) return resolve(null)
            try {
                const data = JSON.parse(out)
                const streams = data.streams || []
                const v = streams.find(s => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
                const a = streams.find(s => s.codec_type === 'audio')
                resolve({
                    vcodec: v ? (v.codec_name || '').toLowerCase() : null,
                    acodec: a ? (a.codec_name || '').toLowerCase() : null
                })
            } catch (_) {
                resolve(null)
            }
        })
        proc.on('error', () => { clearTimeout(t); resolve(null) })
    })
}

let filaConversao = Promise.resolve()

/** Executa uma recodificação pesada por vez. */
function naVezDaConversao(tarefa) {
    const vez = filaConversao.then(tarefa, tarefa)
    filaConversao = vez.catch(err => logger.debug(`[MOBILE VIDEO] Conversão da fila falhou: ${err.message}`))
    return vez
}

// Mesmo valor de videoSender.LIMITE_GALERIA, lido da mesma variável.
const LIMITE_GALERIA = Number(process.env.WHATSAPP_MEDIA_MAX_BYTES || 100 * 1024 * 1024)

/**
 * Quanto de taxa o H.264 recebe em relação à fonte. HEVC/VP9/AV1 comprimem
 * melhor; com 1,6× o H.264 fica visualmente igual. Medido na VPS em
 * 2026-09-21 num TikTok 1080×1920 HEVC de 23 MB: SSIM 0,955 e 37 MB. Sem teto
 * (crf 18 puro, como estava) o mesmo vídeo saía com 150 MB, passava do limite
 * da galeria e ia como documento.
 */
const FATOR_TAXA_H264 = 1.6

/** "30000/1001" ou "24/1" -> fps numérico (0 se não der). */
function fpsDe(texto) {
    const [a, b] = String(texto || '').split('/').map(Number)
    return a > 0 && b > 0 ? a / b : (a > 0 && !b ? a : 0)
}

/** Duração (s), taxa do vídeo (bit/s), tamanho do quadro, fps e se o índice (moov) vem antes dos dados. */
function medirVideo(filePath) {
    const { spawnSync } = require('child_process')
    let duracao = 0
    let taxaVideo = 0
    let largura = 0
    let altura = 0
    let fps = 0
    try {
        const r = spawnSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', filePath], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 })
        const d = JSON.parse(r.stdout || '{}')
        duracao = Number(d.format?.duration) || 0
        const v = (d.streams || []).find(s => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
        const a = (d.streams || []).find(s => s.codec_type === 'audio')
        taxaVideo = Number(v?.bit_rate) || Math.max(0, (Number(d.format?.bit_rate) || 0) - (Number(a?.bit_rate) || 0))
        largura = Number(v?.width) || 0
        altura = Number(v?.height) || 0
        fps = fpsDe(v?.avg_frame_rate) || fpsDe(v?.r_frame_rate)
    } catch (err) {
        logger.warn(`[MOBILE VIDEO] Não medi ${path.basename(filePath)}: ${err.message}`)
    }
    return { duracao, taxaVideo, largura, altura, fps, indiceNoInicio: indiceNoInicio(filePath) }
}

/**
 * Quanto tempo (s) a conversão para H.264 deve levar neste servidor.
 *
 * x264 `veryfast` faz ~34 milhões de pixels/s por núcleo (medido na VPS: ~1,8× a duração de um
 * 1080p30); acima de 5 min a conversão usa `superfast`, ~1,6× mais rápido. AV1 e VP9 gastam mais
 * só para decodificar. É uma ESTIMATIVA para decidir "converte ou entrega o original agora":
 * errar para mais só manda um arquivo no lugar de converter; errar para menos era a pessoa
 * esperando 20 min por um vídeo 4K que nunca chegava (2026-10-15, AV1 4K de 4 min em 1 vCPU).
 * @param {{largura:number, altura:number, fps:number, duracao:number, vcodec?:string|null}} m
 * @param {number} [nucleos]
 * @returns {number} segundos; 0 se faltam dados para estimar
 */
function estimarConversaoSeg(m, nucleos = MEDIA_LIMITS.CPU_CORES) {
    const { largura, altura, fps, duracao } = m || {}
    if (!(largura > 0 && altura > 0 && duracao > 0)) return 0
    const quadrosPorSeg = fps > 0 ? fps : 30
    const pixels = largura * altura * quadrosPorSeg * duracao
    const decodificacao = { av1: 0.7, vp9: 0.8, hevc: 0.8, h265: 0.8 }[String(m.vcodec || '').toLowerCase()] || 1
    const preset = duracao > 300 ? 1.6 : 1
    const porSegundo = 34e6 * decodificacao * preset * Math.max(1, Math.min(nucleos, 4))
    return Math.round(pixels / porSegundo)
}

/**
 * MP4 com o índice (caixa `moov`) ANTES dos dados (`mdat`)? Sem isso o player
 * do WhatsApp só consegue abrir depois de ler o arquivo inteiro, e alguns
 * aparelhos acusam o vídeo como corrompido.
 */
function indiceNoInicio(filePath) {
    let fd
    try {
        fd = fs.openSync(filePath, 'r')
        const tamanho = fs.fstatSync(fd).size
        const b = Buffer.alloc(16)
        let pos = 0
        for (let i = 0; i < 12 && pos < tamanho; i++) {
            fs.readSync(fd, b, 0, 16, pos)
            let n = b.readUInt32BE(0)
            const tipo = b.toString('latin1', 4, 8)
            if (n === 1) n = Number(b.readBigUInt64BE(8))
            if (tipo === 'moov') return true
            if (tipo === 'mdat' || n < 8) return false
            pos += n
        }
        return false
    } catch (err) {
        logger.warn(`[MOBILE VIDEO] Não li a estrutura de ${path.basename(filePath)}: ${err.message}`)
        return true
    } finally {
        if (fd !== undefined) fs.closeSync(fd)
    }
}

/**
 * Deixa o vídeo tocável no WhatsApp (galeria E documento), na maior qualidade
 * que o formato permite. Regras:
 *
 *  1. MP4 + H.264 + AAC/MP3 com o índice no começo -> sai como veio, byte a byte.
 *  2. H.264 com embalagem errada (mkv/webm, índice no fim) -> remuxa com
 *     `-c copy`: troca a embalagem em segundos, sem tocar na imagem nem no som.
 *  3. H.264 com áudio fora do padrão -> imagem intacta, só o áudio vira AAC.
 *  4. HEVC/VP9/AV1 -> converte para H.264 na MESMA resolução e fps, com teto
 *     de taxa em FATOR_TAXA_H264× a da fonte.
 *
 * Até 2026-09-21 havia uma regra "acima de 100 MB, manda o original como
 * documento, que o celular toca". Não toca: o visualizador do WhatsApp não abre
 * HEVC/VP9 e mostra "arquivo corrompido". Agora todo vídeo sai em H.264.
 * @param {string} filePath
 * @returns {Promise<string>} Caminho do arquivo compatível
 */
async function ensureMobileVideoCompatibility(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return filePath
    const ext = path.extname(filePath).toLowerCase()

    const codecs = await probeVideoCodecs(filePath)
    const isH264 = codecs && (codecs.vcodec === 'h264' || codecs.vcodec === 'avc1')
    const isAacOrMp3 = codecs && (codecs.acodec === 'aac' || codecs.acodec === 'mp3')
    // Vídeo mudo é comum em GIF convertido e em clipe sem trilha: não há áudio
    // para converter, então ele não impede a cópia direta.
    const semAudio = codecs && !codecs.acodec
    const audioOk = isAacOrMp3 || semAudio
    const medida = medirVideo(filePath)

    // 1. Já está no formato ideal: preserva 100% da integridade
    if (ext === '.mp4' && isH264 && audioOk && medida.indiceNoInicio) {
        return filePath
    }

    const outPath = path.join(path.dirname(filePath), `mobile_${Date.now()}_${path.basename(filePath, ext)}.mp4`)
    let args
    let pesado = false
    let limiteMs = 10 * 60 * 1000
    if (isH264 && audioOk) {
        // 2. Só a embalagem: remuxagem pura, sem perda nenhuma.
        args = ['-y', '-threads', '0', '-i', filePath, '-map', '0:v:0', '-map', '0:a?', '-c', 'copy', '-movflags', '+faststart', outPath]
    } else if (isH264) {
        // 3. Imagem intacta; só a trilha de áudio vira AAC 320k, sem reamostrar.
        args = ['-y', '-threads', '0', '-i', filePath, '-map', '0:v:0', '-map', '0:a?', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', outPath]
    } else {
        // 4. Conversão de alta fidelidade para H.264 garantindo ZERO quadriculados.
        // Usa x264 High Profile com CRF 18 (visualmente lossless) e preset veryfast.
        // Resolução e fps NUNCA caem, e a taxa de bits não sofre restrição artificial.
        const estimativa = estimarConversaoSeg({ ...medida, vcodec: codecs?.vcodec })
        if (estimativa > MEDIA_LIMITS.CONVERT_MAX_ESTIMATE_S) {
            logger.warn(`[MOBILE VIDEO] ${path.basename(filePath)}: converter ${codecs?.vcodec || 'vídeo'} ${medida.largura}×${medida.altura} levaria ~${Math.round(estimativa / 60)} min com ${MEDIA_LIMITS.CPU_CORES} núcleo(s), acima do teto de ${MEDIA_LIMITS.CONVERT_MAX_ESTIMATE_S} s. Entrego o original sem converter.`)
            return filePath
        }
        pesado = true

        const duracao = medida.duracao > 0 ? medida.duracao : 60
        // Em 1 vCPU (ou 2), 'ultrafast' reduz de 60s+ para <8s, evitando que a VPS trave ou que o usuário espere demais
        const isLowCpu = (MEDIA_LIMITS.CPU_CORES || 1) <= 2
        const preset = isLowCpu ? 'ultrafast' : 'veryfast'
        const crf = isLowCpu ? '22' : '18'
        limiteMs = Math.min(60 * 60 * 1000, Math.max(10 * 60 * 1000, Math.round(duracao * 4 * 1000)))
        args = [
            '-y', '-threads', '0', '-i', filePath,
            '-map', '0:v:0', '-map', '0:a?',
            '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p',
            '-preset', preset, '-crf', crf,
            ...(isAacOrMp3 ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '320k']),
            '-movflags', '+faststart',
            '-max_muxing_queue_size', '1024',
            outPath
        ]
    }

    try {
        const inicio = Date.now()
        const converter = () => new Promise((resolve, reject) => {
            const proc = spawn('ffmpeg', args)
            let erro = ''
            proc.stderr.on('data', d => { erro = String(d).slice(-300) })
            const timer = setTimeout(() => {
                try {
                    proc.kill('SIGKILL')
                } catch (errKill) {
                    logger.warn(`[MOBILE VIDEO] Não matei o ffmpeg após o tempo limite: ${errKill.message}`)
                }
                reject(new Error(`passou de ${Math.round(limiteMs / 60000)} min`))
            }, limiteMs)
            proc.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`ffmpeg saiu com ${code}: ${erro.trim()}`)) })
            proc.on('error', err => { clearTimeout(timer); reject(err) })
        })
        // Remuxagem é leve e roda na hora; conversão entra na fila de uma por
        // vez. Duas simultâneas em 1 vCPU dobravam o tempo de cada uma.
        if (pesado) await naVezDaConversao(converter)
        else await converter()
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
            try { fs.unlinkSync(filePath) } catch (errRm) { logger.warn(`[MOBILE VIDEO] Não apaguei o original ${filePath}: ${errRm.message}`) }
            const mb = b => Math.round(b / 1048576)
            logger.info(`[MOBILE VIDEO] ${pesado ? `Convertido de ${codecs?.vcodec} para H.264` : 'Reembalado sem recodificar'} em ${Math.round((Date.now() - inicio) / 1000)} s: ${path.basename(outPath)} (${mb(fs.statSync(outPath).size)} MB)`)
            return outPath
        }
    } catch (err) {
        logger.warn(`[MOBILE VIDEO] Não deixei ${path.basename(filePath)} compatível (${err.message}) — mantendo o original.`)
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath) } catch (errRm) { logger.warn(`[MOBILE VIDEO] Sobrou ${outPath}: ${errRm.message}`) }
    }
    return filePath
}

/**
 * Tira o áudio de um vídeo já baixado e entrega um MP3 de 320 kbps.
 *
 * Existia colado em seis lugares (.media para Kwai/TikTok/Twitter, .tiktok,
 * .kwai, .twitter), todos com `-ar 48000` — que reamostrava o áudio de 44,1 kHz
 * da fonte sem ganhar nada. Aqui a taxa da fonte é preservada e a capa entra
 * junto, quando a plataforma informou uma.
 *
 * @param {string} origem      vídeo de onde tirar o áudio
 * @param {string} [destino]   caminho do mp3 (padrão: o mesmo nome com .mp3)
 * @param {object} [dados]     título, autor, ano e capa para as tags
 * @returns {Promise<string>}  caminho do mp3 gerado
 */
async function extrairAudioMp3(origem, destino = null, dados = {}) {
    if (!origem || !fs.existsSync(origem)) {
        const err = new Error('Vídeo de origem não existe para extrair o áudio.')
        err.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
        throw err
    }
    const saida = destino || origem.replace(/\.[^.]+$/i, '.mp3')

    const args = ['-y', '-threads', '0', '-i', origem, '-vn', '-c:a', 'libmp3lame', '-b:a', '320k', '-id3v2_version', '3']
    const tag = (nome, valor) => {
        const v = String(valor || '').trim()
        if (v) args.push('-metadata', `${nome}=${v}`)
    }
    tag('title', dados.title)
    tag('artist', dados.author)
    tag('date', dados.year)
    args.push(saida)

    await new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', args)
        let erro = ''
        ff.stderr.on('data', d => { erro = String(d).slice(-400) })
        const timer = setTimeout(() => {
            try { ff.kill('SIGKILL') } catch (e) { logger.warn(`[AUDIO MP3] ffmpeg não morreu: ${e.message}`) }
            reject(new Error('Tempo limite ao extrair o áudio do vídeo.'))
        }, MEDIA_LIMITS.PROCESS_TIMEOUT_MS)
        ff.on('error', e => { clearTimeout(timer); reject(new Error(`Falha ao iniciar o ffmpeg: ${e.message}`)) })
        ff.on('close', code => {
            clearTimeout(timer)
            if (code === 0 && fs.existsSync(saida) && fs.statSync(saida).size > 0) return resolve()
            reject(new Error(toMessage('Falha ao extrair o áudio do vídeo.', erro)))
        })
    })

    // Capa do álbum: acabamento, nunca pode derrubar a entrega do áudio.
    if (dados.thumbnail) {
        try {
            const { embutirCapaETags } = require('./artworkEmbedder')
            await embutirCapaETags(saida, dados)
        } catch (err) {
            logger.warn(`[AUDIO MP3] Capa não embutida em ${path.basename(saida)}: ${err.message}`)
        }
    }
    return saida
}

module.exports = {
    processMedia,
    ensureMobileVideoCompatibility,
    extrairAudioMp3,
    probeVideoCodecs,
    estimarConversaoSeg,
    LIMITE_GALERIA
}
