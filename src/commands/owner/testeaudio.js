/**
 * Comando .testeaudio — manda o MESMO áudio em seis formatos, lado a lado, para o dono ver no
 * celular qual chega e como aparece.
 *
 * Existe porque o que o WhatsApp desenha não dá para saber de longe: o áudio com a prévia (capa
 * dentro da mensagem) aparecia como "enviado" no log e não chegava no celular do dono. Em vez de
 * adivinhar o próximo formato, o dono olha os seis e diz qual quer — e vira o AUDIO_NUMA_MENSAGEM.
 *
 * Exclusivo do Dono. Usa um tom de 6 s gerado na hora (nada é baixado).
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')

function gerarTom(arquivo) {
    return new Promise(resolve => {
        const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=523:duration=6',
            '-af', 'afade=t=in:d=0.3,afade=t=out:st=5.5:d=0.5', '-c:a', 'libmp3lame', '-b:a', '320k', arquivo])
        p.on('error', () => resolve(false))
        p.on('close', code => resolve(code === 0 && fs.existsSync(arquivo)))
    })
}

const pausa = ms => new Promise(r => setTimeout(r, ms))

module.exports = {
    name: 'testeaudio',
    aliases: ['audiotestes', 'formatosaudio', 'testarcapa'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Manda um áudio de teste em seis formatos (capa/informações) para você escolher o que aparece bem',
    usage: '',
    examples: [' — manda as seis variações no chat atual'],
    ownerOnly: true,
    cooldownMs: 15000,
    execute: async ({ client, from, info, reply, prefix = '.' }) => {
        const audioSender = require('../../services/media/audioSender')
        const { capaLeve, capaQuadrada, legendaDoAudio } = audioSender._internos

        const pasta = path.join(tempDir, 'testeaudio')
        fs.mkdirSync(pasta, { recursive: true })
        const mp3 = path.join(pasta, `tom_${Date.now()}.mp3`)
        const saidaVideo = path.join(pasta, `tom_${Date.now()}.mp4`)
        const capaJpg = path.join(pasta, `capa_${Date.now()}.jpg`)
        const apagar = () => {
            for (const f of [mp3, saidaVideo, capaJpg]) {
                try { if (fs.existsSync(f)) fs.unlinkSync(f) } catch (err) { logger.warn(`[TESTEAUDIO] Sobrou ${f}: ${err.message}`) }
            }
        }

        try {
            if (!(await gerarTom(mp3))) return reply('❌ Não consegui gerar o áudio de teste (ffmpeg).')
            const capa = await capaQuadrada(null, 'Teste de capa', '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')
            if (!capa) return reply('❌ Não consegui montar a capa de teste.')
            const leve = await capaLeve(capa)
            const ficha = legendaDoAudio({
                caption: '🎵 *Teste de capa*\nArtista: ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤\nDuração: 0:06\nArquivo: MP3 · 320 kbps · 0,2 MB\nOrigem: teste',
                title: 'Teste de capa', author: '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤', filePath: mp3, url: ''
            })
            const enviar = (conteudo, opcoes = {}) => client.sendMessage(from, conteudo, { quoted: info, mediaUploadTimeoutMs: 120000, ...opcoes })

            await reply([
                '🧪 *Teste de formatos de áudio*',
                'Vou mandar 6 mensagens, de *A* a *F*. Depois me diga quais chegaram e como aparecem (capa, texto, player).'
            ].join('\n'))

            // A — prévia com a capa em bytes (o que estava como padrão e não chegava)
            await enviar({
                audio: { url: mp3 }, mimetype: 'audio/mpeg', ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: 'A · prévia com a capa em bytes', body: 'Artista · 0:06\nMP3 · 320 kbps · 0,2 MB',
                        mediaType: 1, thumbnail: leve, renderLargerThumbnail: true,
                        sourceUrl: 'https://youtube.com', showAdAttribution: false
                    }
                }
            })
            await pausa(1500)

            // B — prévia só com o link da capa (como era antes da capa em bytes)
            await enviar({
                audio: { url: mp3 }, mimetype: 'audio/mpeg', ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: 'B · prévia com o link da capa', body: 'Artista · 0:06\nMP3 · 320 kbps · 0,2 MB',
                        mediaType: 1, thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                        renderLargerThumbnail: true, sourceUrl: 'https://youtube.com', showAdAttribution: false
                    }
                }
            })
            await pausa(1500)

            // C — prévia só com texto (sem imagem nenhuma)
            await enviar({
                audio: { url: mp3 }, mimetype: 'audio/mpeg', ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: 'C · prévia só com texto', body: 'Artista · 0:06\nMP3 · 320 kbps · 0,2 MB',
                        mediaType: 1, sourceUrl: 'https://youtube.com', showAdAttribution: false
                    }
                }
            })
            await pausa(1500)

            // D — arquivo com a capa na miniatura e as informações na legenda (uma mensagem)
            await enviar({
                document: { url: mp3 }, mimetype: 'audio/mpeg', fileName: 'D - teste de capa.mp3',
                caption: `*D · áudio como arquivo*\n${ficha}`,
                ...(leve ? { jpegThumbnail: leve } : {})
            })
            await pausa(1500)

            // E — a capa com as informações (imagem) e o áudio logo abaixo (padrão atual)
            await enviar({ image: capa, caption: `*E · capa + informações, depois o áudio*\n${ficha}` })
            await enviar({ audio: { url: mp3 }, mimetype: 'audio/mpeg', ptt: false })
            await pausa(1500)

            // F — o áudio num vídeo de imagem parada, com as informações na legenda (uma mensagem)
            fs.writeFileSync(capaJpg, capa)
            const ok = await new Promise(resolve => {
                const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '5', '-i', capaJpg, '-i', mp3,
                    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'veryfast', '-crf', '30',
                    '-pix_fmt', 'yuv420p', '-r', '5', '-g', '25', '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', saidaVideo])
                p.on('error', () => resolve(false))
                p.on('close', code => resolve(code === 0 && fs.existsSync(saidaVideo)))
            })
            if (ok) await enviar({ video: { url: saidaVideo }, caption: `*F · áudio num vídeo com a capa*\n${ficha}`, mimetype: 'video/mp4' })

            await reply([
                '✅ *Pronto — são 6 formatos:*',
                '• *A* áudio, capa dentro da mensagem (bytes)',
                '• *B* áudio, capa por link',
                '• *C* áudio, só texto na prévia',
                '• *D* arquivo com capa e legenda',
                '• *E* imagem com legenda + áudio (o padrão agora)',
                '• *F* vídeo de imagem parada com legenda',
                '',
                `Me diga qual você quer. Trocar é uma variável (\`AUDIO_NUMA_MENSAGEM\`), sem mexer no código. Hoje o padrão é *E*.`
            ].join('\n'))
        } catch (err) {
            logger.error('[TESTEAUDIO] Falhou', err)
            return reply('❌ O teste de formatos falhou no meio. Tente de novo.')
        } finally {
            // Dá tempo do upload terminar antes de apagar os arquivos temporários.
            setTimeout(apagar, 60000)
        }
        return undefined
    }
}
