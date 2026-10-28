/**
 * Confere e registra a qualidade do que foi entregue.
 *
 * Pedido do dono (2026-09-21): "tem que verificar sempre que a qualidade esteja
 * no máximo, tanto do áudio quanto do vídeo". Cada envio passa por aqui: o
 * arquivo é medido com ffprobe e o log diz exatamente o que chegou
 * (resolução, fps, codec, taxas). Se algo ficou abaixo do teto possível — áudio
 * abaixo de 320 kbps, vídeo que não é H.264 —, a linha sai como AVISO, para dar
 * para achar o caminho que perdeu qualidade.
 *
 * Nunca bloqueia o envio: é medição, não trava.
 */

const logger = require('../../core/logger')

/** Teto do MP3 (a taxa máxima que o formato aceita). */
const TETO_MP3_KBPS = 320

/**
 * @param {string} filePath
 * @param {object} [o]
 * @param {'vídeo'|'áudio'} [o.tipo]
 * @param {string} [o.origem] de onde veio (TikTok, YouTube…), só para o log
 * @returns {{ ok: boolean, resumo: string, avisos: string[] } | null}
 */
function conferirQualidade(filePath, { tipo = 'vídeo', origem = '' } = {}) {
    try {
        const { probeMedia, qualityLabel, nomeCodec, rotuloTaxa, rotuloAmostragem } = require('./formatResolver')
        const p = probeMedia(filePath)
        if (!p) return null
        const avisos = []
        const partes = []
        if (tipo === 'vídeo' && p.hasVideo) {
            partes.push(`${qualityLabel(p.height, p.width)} ${p.width}×${p.height}`, p.fps ? `${p.fps} fps` : null, nomeCodec(p.vcodec), rotuloTaxa(p.totalBitrateKbps))
            if (!['h264', 'avc1'].includes(String(p.vcodec))) avisos.push(`vídeo em ${nomeCodec(p.vcodec)}, o WhatsApp não toca`)
        }
        if (p.acodec) {
            partes.push(`áudio ${nomeCodec(p.acodec)} ${rotuloTaxa(p.bitrateKbps) || '?'} ${rotuloAmostragem(p.sampleRateHz) || ''}`.trim())
            if (tipo === 'áudio' && p.acodec === 'mp3' && p.bitrateKbps && p.bitrateKbps < TETO_MP3_KBPS - 10) {
                avisos.push(`MP3 em ${p.bitrateKbps} kbps, abaixo do teto de ${TETO_MP3_KBPS}`)
            }
        } else if (tipo === 'vídeo') {
            partes.push('sem áudio')
        }
        const resumo = partes.filter(Boolean).join(' · ')
        const onde = origem ? ` (${origem})` : ''
        if (avisos.length) logger.warn(`[QUALIDADE] ${tipo}${onde} ABAIXO DO MÁXIMO: ${resumo} — ${avisos.join('; ')}`)
        else logger.info(`[QUALIDADE] ${tipo}${onde} entregue: ${resumo}`)
        return { ok: avisos.length === 0, resumo, avisos }
    } catch (err) {
        logger.warn(`[QUALIDADE] Não medi ${filePath}: ${err.message}`)
        return null
    }
}

module.exports = { conferirQualidade, TETO_MP3_KBPS }
