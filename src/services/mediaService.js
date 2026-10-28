/**
 * Media Hub Service
 * Processamento e conversão de áudio, vídeo, imagens e figurinhas com transparência total
 */

const fs = require('fs')
const path = require('path')
const { spawn, spawnSync, execFile } = require('child_process')
const sharp = require('sharp')
const crypto = require('crypto')
const https = require('https')
const { downloadContentFromMessage, downloadMediaMessage, getMediaKeys } = require('@whiskeysockets/baileys')
const { tempDir } = require('../config/paths')
const { addExif } = require('../utils/stickerUtils')
const logger = require('../core/logger')
const { getBotName } = require('../config/botConfig')

/**
 * Baixa e descriptografa mídia do WhatsApp diretamente via HTTPS (IPv4) caso a API de fetch falhe
 */
async function downloadEncryptedViaHttps(downloadUrl, mediaKey, type) {
    if (!downloadUrl || !mediaKey) {
        throw new Error('URL ou mediaKey ausentes para download HTTPS direto')
    }

    const { cipherKey, iv } = await getMediaKeys(mediaKey, type)

    const encBuffer = await new Promise((resolve, reject) => {
        try {
            const u = new URL(downloadUrl)
            const req = https.get(u, {
                headers: {
                    'Origin': 'https://web.whatsapp.com',
                    'User-Agent': 'WhatsApp/2.24.1.1',
                    'Accept': '*/*'
                },
                family: 4,
                timeout: 15000
            }, (res) => {
                if (res.statusCode >= 400) {
                    return reject(new Error(`HTTP ${res.statusCode} ao baixar mídia do WhatsApp`))
                }
                const chunks = []
                res.on('data', chunk => chunks.push(chunk))
                res.on('end', () => resolve(Buffer.concat(chunks)))
            })
            req.on('error', reject)
            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Timeout ao conectar ao CDN do WhatsApp'))
            })
        } catch (urlErr) {
            reject(urlErr)
        }
    })

    if (!encBuffer || encBuffer.length <= 10) {
        throw new Error('Dados criptografados inválidos recebidos do CDN')
    }

    const cipherText = encBuffer.slice(0, encBuffer.length - 10)
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv)
    return Buffer.concat([decipher.update(cipherText), decipher.final()])
}

/**
 * Baixa mídia de forma ultra-resiliente (trata mensagens diretas, citadas, miniaturas e reupload)
 * @param {object} messageWrapper - Objeto contendo o payload da mensagem ({ message: { ... } } ou mediaMsg)
 * @param {string} mediaType - 'sticker' | 'image' | 'video' | 'audio'
 * @param {object} [client] - Instância do Baileys socket para reupload se necessário
 * @returns {Promise<Buffer>}
 */
async function downloadWhatsAppMedia(messageWrapper, mediaType = 'image', client = null) {
    if (!messageWrapper) {
        throw new Error('Nenhuma mensagem ou mídia fornecida para download')
    }

    // 1. Tenta usar downloadMediaMessage se messageWrapper for um objeto com chave message
    if (messageWrapper?.message) {
        try {
            const buffer = await downloadMediaMessage(
                messageWrapper,
                'buffer',
                {},
                client ? { logger, reuploadRequest: (msg) => client.updateMediaMessage(msg) } : undefined
            )
            if (buffer && buffer.length > 0) return buffer
        } catch (err) {
            logger.warn(`[DOWNLOAD MEDIA] downloadMediaMessage falhou (${err.message}), tentando downloadContentFromMessage...`)
        }
    }

    // 2. Extrai o nó de mídia direto, desembrulhando envelopes view-once ou efêmeros
    let mediaNode = messageWrapper
    if (messageWrapper?.message) {
        let m = messageWrapper.message
        while (
            m?.viewOnceMessage?.message ||
            m?.viewOnceMessageV2?.message ||
            m?.viewOnceMessageV2Extension?.message ||
            m?.ephemeralMessage?.message ||
            m?.documentWithCaptionMessage?.message
        ) {
            m = m.viewOnceMessage?.message ||
                m.viewOnceMessageV2?.message ||
                m.viewOnceMessageV2Extension?.message ||
                m.ephemeralMessage?.message ||
                m.documentWithCaptionMessage?.message
        }
        mediaNode = m.stickerMessage || m.imageMessage || m.videoMessage || m.audioMessage || m.documentMessage || m
    }

    // 3. Verifica se o nó possui directPath ou thumbnailDirectPath
    let downloadTarget = { ...mediaNode }
    let actualType = mediaType

    if (!downloadTarget.url && downloadTarget.thumbnailDirectPath) {
        downloadTarget = {
            directPath: downloadTarget.thumbnailDirectPath,
            mediaKey: downloadTarget.mediaKey
        }
        actualType = 'thumbnail-link'
    } else if (!downloadTarget.url && downloadTarget.directPath) {
        downloadTarget = {
            directPath: downloadTarget.directPath,
            mediaKey: downloadTarget.mediaKey
        }
    }

    try {
        const stream = await downloadContentFromMessage(downloadTarget, actualType)
        const bufferArray = []
        for await (const chunk of stream) {
            bufferArray.push(chunk)
        }
        const finalBuf = Buffer.concat(bufferArray)
        if (finalBuf.length > 0) return finalBuf
    } catch (streamErr) {
        logger.warn(`[DOWNLOAD MEDIA] downloadContentFromMessage falhou (${streamErr.message}), tentando HTTPS fallback com IPv4...`)

        // 4. FALLBACK ULTRA-RESILIENTE: Download HTTPS direto via IPv4 e decriptação AES
        const candidateUrls = []
        if (downloadTarget.url) candidateUrls.push(downloadTarget.url)
        if (downloadTarget.directPath) {
            candidateUrls.push(`https://mmg.whatsapp.net${downloadTarget.directPath}`)
            candidateUrls.push(`https://mms.whatsapp.net${downloadTarget.directPath}`)
        }
        if (downloadTarget.thumbnailDirectPath) {
            candidateUrls.push(`https://mmg.whatsapp.net${downloadTarget.thumbnailDirectPath}`)
        }

        const mKey = downloadTarget.mediaKey || mediaNode?.mediaKey
        if (mKey && candidateUrls.length > 0) {
            for (const candUrl of candidateUrls) {
                try {
                    const decryptedBuf = await downloadEncryptedViaHttps(candUrl, mKey, actualType === 'thumbnail-link' ? 'image' : actualType)
                    if (decryptedBuf && decryptedBuf.length > 0) {
                        logger.info(`[DOWNLOAD MEDIA] Mídia recuperada com sucesso via HTTPS fallback (${candUrl.slice(0, 40)}...)`)
                        return decryptedBuf
                    }
                } catch (fallbackErr) {
                    logger.warn(`[DOWNLOAD MEDIA] Falha na URL candidata (${candUrl.slice(0, 35)}...): ${fallbackErr.message}`)
                }
            }
        }

        throw streamErr
    }
    throw new Error('Buffer de mídia vazio recebido do WhatsApp')
}

/**
 * Converte um buffer de imagem ou vídeo curto em uma figurinha WebP sem bordas pretas
 * @param {Buffer} buffer - Buffer do arquivo de mídia
 * @param {boolean} isAnimated - Se a mídia é um vídeo/GIF animado
 * @param {string} packname - Nome do pacote de figurinhas
 * @param {string} author - Autor da figurinha
 * @returns {Promise<Buffer>} Buffer do WebP formatado com metadados
 */
async function criarFigurinha(buffer, isAnimated = false, packname, author) {
    if (!packname) packname = getBotName()
    if (!author) author = getBotName()
    const id = Date.now() + '_' + Math.random().toString(36).substring(2, 7)

    // 1. Figurinhas Estáticas: Usa Sharp para transparência alfa real e zero bordas pretas
    if (!isAnimated) {
        try {
            // q90 fica nítido em 512 px; se passar da referência de 100 KB do
            // WhatsApp para figurinha estática, refaz em q75.
            const base = sharp(buffer).resize(512, 512, {
                fit: 'contain',
                kernel: 'lanczos3',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            let webpBuffer = await base.clone().webp({ quality: 90, alphaQuality: 100, effort: 5 }).toBuffer()
            if (webpBuffer.length > 100 * 1024) {
                webpBuffer = await base.clone().webp({ quality: 75, alphaQuality: 90, effort: 6 }).toBuffer()
            }

            return await addExif(webpBuffer, packname, author)
        } catch (sharpErr) {
            logger.warn('[MEDIA SERVICE] Sharp falhou, tentando fallback com FFmpeg:', sharpErr.message)
        }
    }

    // 2. Figurinhas animadas: libwebp_anim com controle de peso.
    if (isAnimated) return criarFigurinhaAnimada(buffer, id, packname, author)

    // 3. Fallback da estática (sharp falhou): FFmpeg com fundo transparente
    const inputPath = path.join(tempDir, `media_in_${id}.jpg`)
    const outputPath = path.join(tempDir, `media_out_${id}.webp`)
    fs.writeFileSync(inputPath, buffer)
    try {
        await rodarFfmpeg(['-y', '-i', inputPath,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
            '-c:v', 'libwebp', '-lossless', '0', '-q:v', '80', '-preset', 'picture', '-an', outputPath], 60000)
        if (!fs.existsSync(outputPath)) throw new Error('Arquivo de saída WebP não encontrado')
        return await addExif(fs.readFileSync(outputPath), packname, author)
    } finally {
        apagarTemporario(inputPath)
        apagarTemporario(outputPath)
    }
}

/** Referência do WhatsApp para figurinha animada; acima disso algumas versões não animam. */
const PESO_MAX_ANIMADA = 500 * 1024

/**
 * Tentativas da mais bonita para a mais leve. O libwebp antigo gravava cada quadro
 * inteiro e sem controle de peso: um vídeo de 8 s de celular dava 650-785 KB
 * (auditoria de mídia, 2026-09-17). O libwebp_anim reaproveita o que não mudou
 * entre quadros, e o laço desce qualidade e fps até caber.
 */
const TENTATIVAS_ANIMADA = [
    { q: 70, fps: 15, seg: 8 },
    { q: 50, fps: 12, seg: 7 },
    { q: 35, fps: 10, seg: 6 }
]

async function criarFigurinhaAnimada(buffer, id, packname, author) {
    const inputPath = path.join(tempDir, `media_in_${id}.mp4`)
    const outputPath = path.join(tempDir, `media_out_${id}.webp`)
    fs.writeFileSync(inputPath, buffer)
    try {
        let melhor = null
        // Cada passada custa uns 4-6 s em 1 vCPU; se a primeira veio muito pesada,
        // pula direto para a mais leve em vez de passar pelas três.
        for (let i = 0; i < TENTATIVAS_ANIMADA.length; i++) {
            const t = TENTATIVAS_ANIMADA[i]
            await rodarFfmpeg(['-y', '-i', inputPath, '-t', String(t.seg),
                '-vf', `fps=${t.fps},scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
                '-c:v', 'libwebp_anim', '-lossless', '0', '-q:v', String(t.q), '-compression_level', '4',
                '-loop', '0', '-an', '-fps_mode', 'passthrough', outputPath], 120000)
            if (!fs.existsSync(outputPath)) throw new Error('Arquivo de saída WebP não encontrado')
            melhor = fs.readFileSync(outputPath)
            if (melhor.length <= PESO_MAX_ANIMADA) break
            logger.debug(`[MEDIA SERVICE] Figurinha animada com ${Math.round(melhor.length / 1024)} KB em q${t.q}/${t.fps}fps, tentando mais leve`)
            if (i === 0 && melhor.length > PESO_MAX_ANIMADA * 1.8) i = TENTATIVAS_ANIMADA.length - 2
        }
        if (melhor.length > PESO_MAX_ANIMADA) {
            logger.warn(`[MEDIA SERVICE] Figurinha animada ficou com ${Math.round(melhor.length / 1024)} KB mesmo na tentativa mais leve`)
        }
        return await addExif(melhor, packname, author)
    } finally {
        apagarTemporario(inputPath)
        apagarTemporario(outputPath)
    }
}

/** Roda o ffmpeg sem shell (caminhos com aspas ou espaço não quebram o comando). */
function rodarFfmpeg(args, timeoutMs) {
    return new Promise((resolve, reject) => {
        execFile('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { timeout: timeoutMs, maxBuffer: 4 * 1024 * 1024 }, (err, _out, stderr) => {
            if (err) {
                logger.error(`[MEDIA SERVICE] FFmpeg falhou: ${String(stderr || err.message).slice(0, 300)}`)
                return reject(new Error('Falha na conversão com FFmpeg'))
            }
            resolve()
        })
    })
}

function apagarTemporario(arquivo) {
    try {
        if (fs.existsSync(arquivo)) fs.unlinkSync(arquivo)
    } catch (err) {
        logger.warn(`[MEDIA SERVICE] Não consegui apagar o temporário ${path.basename(arquivo)}: ${err.message}`)
    }
}

/**
 * Remove arquivos temporários antigos do diretório temp/
 * @param {number} maxAgeMs - Idade máxima em milissegundos (padrão: 30 minutos)
 */
function limparArquivosTemporarios(maxAgeMs = 30 * 60 * 1000) {
    if (!fs.existsSync(tempDir)) return
    const now = Date.now()

    const isStale = p => {
        try {
            return now - fs.statSync(p).mtimeMs > maxAgeMs
        } catch (_) {
            return true
        }
    }

    const removeStaleDir = dirPath => {
        if (!fs.existsSync(dirPath)) return 0
        let removed = 0
        for (const entry of fs.readdirSync(dirPath)) {
            const entryPath = path.join(dirPath, entry)
            try {
                const stats = fs.statSync(entryPath)
                if (stats.isDirectory()) {
                    if (entry === 'media' || isStale(entryPath)) {
                        fs.rmSync(entryPath, { recursive: true, force: true })
                        removed++
                    } else {
                        removed += removeStaleDir(entryPath)
                    }
                } else if (isStale(entryPath)) {
                    fs.unlinkSync(entryPath)
                    removed++
                }
            } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:312: ${errIgnorado.message}`) }
        }
        return removed
    }

    try {
        let count = 0
        for (const entry of fs.readdirSync(tempDir)) {
            const entryPath = path.join(tempDir, entry)
            try {
                const stats = fs.statSync(entryPath)
                if (stats.isDirectory()) {
                    if (entry === 'media' || isStale(entryPath)) {
                        count += removeStaleDir(entryPath)
                    }
                } else if (isStale(entryPath)) {
                    fs.unlinkSync(entryPath)
                    count++
                }
            } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:331: ${errIgnorado.message}`) }
        }
        if (count > 0) {
            logger.info(`🧹 Limpeza temporária: ${count} arquivos antigos removidos de ${tempDir}`)
        }
    } catch (err) {
        logger.error('Erro na limpeza de arquivos temporários:', err)
    }
}

/**
 * Converte uma figurinha WebP em imagem (estática) ou vídeo MP4 em alta resolução (animada)
 * @param {Buffer} buffer - Buffer do WebP da figurinha
 * @param {boolean} [isAnimatedHint=false] - Sugestão se a figurinha é animada vinda do Baileys
 * @returns {Promise<{ type: 'image' | 'video', buffer: Buffer, isGif?: boolean }>}
 */
async function converterFigurinhaParaMidia(buffer, isAnimatedHint = false) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error("Buffer de figurinha inválido.");
    }

    let isAnimated = Boolean(isAnimatedHint);

    // 1. Verificação direta por headers e chunks WebP VP8X / ANIM / ANMF
    if (!isAnimated && buffer.length > 20 && buffer.slice(0, 4).toString() === "RIFF" && buffer.slice(8, 12).toString() === "WEBP") {
        if (buffer.slice(12, 16).toString() === "VP8X") {
            const flags = buffer[20];
            if (flags & 0x02) isAnimated = true;
        }
        if (!isAnimated && (buffer.indexOf(Buffer.from("ANIM")) !== -1 || buffer.indexOf(Buffer.from("ANMF")) !== -1)) {
            isAnimated = true;
        }
    }

    // 2. Verificação secundária via Sharp Animated Metadata
    if (!isAnimated) {
        try {
            const meta = await sharp(buffer, { animated: true }).metadata();
            if (meta.pages && meta.pages > 1) {
                isAnimated = true;
            }
        } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:372: ${errIgnorado.message}`) }
    }

    const id = Date.now() + "_" + Math.random().toString(36).substring(2, 7);

    // CASO 1: FIGURINHA ANIMADA ➔ CONVERTE PARA VÍDEO MP4 EM ALTA RESOLUÇÃO (720x720 / 30fps)
    if (isAnimated) {
        const inputWebpPath = path.join(tempDir, `sticker_in_${id}.webp`);
        const inputGifPath = path.join(tempDir, `sticker_in_${id}.gif`);
        const outputMp4Path = path.join(tempDir, `sticker_out_${id}.mp4`);

        const cleanup = () => {
            try { if (fs.existsSync(inputWebpPath)) fs.unlinkSync(inputWebpPath); } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:384: ${errIgnorado.message}`) }
            try { if (fs.existsSync(inputGifPath)) fs.unlinkSync(inputGifPath); } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:385: ${errIgnorado.message}`) }
            try { if (fs.existsSync(outputMp4Path)) fs.unlinkSync(outputMp4Path); } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:386: ${errIgnorado.message}`) }
        };

        const runFfmpeg = (ffmpegArgs) => new Promise((resolve) => {
            const proc = spawn('ffmpeg', ffmpegArgs, { stdio: 'ignore' });
            proc.on('close', (code) => resolve(code === 0 && fs.existsSync(outputMp4Path) && fs.statSync(outputMp4Path).size > 0));
            proc.on('error', () => resolve(false));
        });

        // Método A: Converter WebP para GIF animado com Sharp, e então GIF para MP4 via FFmpeg
        try {
            const gifBuffer = await sharp(buffer, { animated: true }).gif().toBuffer();
            fs.writeFileSync(inputGifPath, gifBuffer);
            const okA = await runFfmpeg([
                '-y', '-i', inputGifPath,
                '-vf', 'scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast', '-movflags', '+faststart', '-r', '30',
                outputMp4Path
            ]);
            if (okA) {
                const videoBuffer = fs.readFileSync(outputMp4Path);
                cleanup();
                return { type: "video", buffer: videoBuffer, isGif: true };
            }
        } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:403: ${errIgnorado.message}`) }

        // Método B: FFmpeg direto com libwebp_anim
        try {
            fs.writeFileSync(inputWebpPath, buffer);
            const okB = await runFfmpeg([
                '-y', '-vcodec', 'libwebp_anim', '-i', inputWebpPath,
                '-vf', 'scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast', '-movflags', '+faststart', '-r', '30',
                outputMp4Path
            ]);
            if (okB) {
                const videoBuffer = fs.readFileSync(outputMp4Path);
                cleanup();
                return { type: "video", buffer: videoBuffer, isGif: true };
            }
        } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:414: ${errIgnorado.message}`) }

        // Método C: FFmpeg padrão de entrada WebP
        try {
            if (!fs.existsSync(inputWebpPath)) fs.writeFileSync(inputWebpPath, buffer);
            const okC = await runFfmpeg([
                '-y', '-i', inputWebpPath,
                '-vf', 'scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast', '-movflags', '+faststart', '-r', '30',
                outputMp4Path
            ]);
            if (okC) {
                const videoBuffer = fs.readFileSync(outputMp4Path);
                cleanup();
                return { type: "video", buffer: videoBuffer, isGif: true };
            }
        } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:425: ${errIgnorado.message}`) }

        cleanup();
    }

    // CASO 2: FIGURINHA ESTÁTICA ➔ CONVERTE PARA IMAGEM PNG FULL HD (1080x1080)
    try {
        const imgBuffer = await sharp(buffer)
            .resize(1080, 1080, { fit: "inside", withoutEnlargement: false })
            .png({ quality: 100 })
            .toBuffer();

        return {
            type: "image",
            buffer: imgBuffer
        };
    } catch (sharpErr) {
        const inputPath = path.join(tempDir, `sticker_static_in_${id}.webp`);
        const outputPath = path.join(tempDir, `sticker_static_out_${id}.png`);
        fs.writeFileSync(inputPath, buffer);

        return new Promise((resolve, reject) => {
            const proc = spawn('ffmpeg', [
                '-y', '-i', inputPath,
                '-vf', 'scale=1080:1080:force_original_aspect_ratio=decrease',
                outputPath
            ], { stdio: 'ignore' });

            proc.on('close', (code) => {
                try {
                    if (code === 0 && fs.existsSync(outputPath)) {
                        const pngBuf = fs.readFileSync(outputPath);
                        resolve({ type: "image", buffer: pngBuf });
                    } else {
                        reject(sharpErr);
                    }
                } catch (e) {
                    reject(e);
                } finally {
                    try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:458: ${errIgnorado.message}`) }
                    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch (errIgnorado) { logger.warn(`[MEDIASERVICE] Falha ignorada em src/services/mediaService.js:459: ${errIgnorado.message}`) }
                }
            });
            proc.on('error', reject);
        });
    }
}

module.exports = {
    downloadWhatsAppMedia,
    criarFigurinha,
    converterFigurinhaParaMidia,
    limparArquivosTemporarios
}
