/**
 * Guarda de disco para downloads grandes.
 *
 * A VPS tem ~22 GB livres. Um download de 3 GB no yt-dlp ocupa MAIS que 3 GB
 * enquanto roda: o vídeo e o áudio vêm em arquivos separados e o merge do ffmpeg
 * escreve um terceiro arquivo antes de apagar os dois. Na prática é preciso
 * reservar ~2,5x o tamanho final.
 *
 * Sem essa guarda, encher o disco não quebra só o download: derruba o SQLite,
 * o log e a sessão do Baileys junto. Melhor recusar antes de começar.
 */

const fs = require('fs')
const logger = require('../../core/logger')

// Folga que nunca deve ser consumida por mídia — espaço de respiro para
// banco, logs e sessão do WhatsApp.
const RESERVA_BYTES = Number(process.env.MEDIA_DISK_RESERVE_BYTES || 3 * 1024 * 1024 * 1024)

// Multiplicador do tamanho final para cobrir os arquivos temporários do merge.
const FATOR_MERGE = 2.5

const gb = b => (b / 1024 ** 3).toFixed(1)

/**
 * Espaço livre no volume que contém `caminho`.
 * @returns {Promise<{livre:number, total:number}|null>} null se não der para medir
 */
async function espacoLivre(caminho) {
    try {
        // fs.statfs existe a partir do Node 18.15 — este projeto exige >= 22.5.
        const st = await fs.promises.statfs(caminho)
        return {
            livre: st.bsize * st.bavail,
            total: st.bsize * st.blocks
        }
    } catch (e) {
        // Sistemas de arquivo exóticos ou permissão negada: seguimos sem a guarda
        // em vez de bloquear o download, mas deixamos rastro.
        logger.warn(`[DISK GUARD] Não consegui medir ${caminho}: ${e.message}`)
        return null
    }
}

/**
 * Há espaço para baixar um arquivo de `tamanhoEstimado` bytes?
 * @returns {Promise<{ok:boolean, motivo?:string, livre?:number, preciso?:number}>}
 */
async function temEspacoPara(tamanhoEstimado, caminho) {
    const info = await espacoLivre(caminho)
    if (!info) return { ok: true }   // não deu para medir: não bloqueia

    const preciso = Math.ceil(tamanhoEstimado * FATOR_MERGE) + RESERVA_BYTES
    if (info.livre >= preciso) return { ok: true, livre: info.livre, preciso }

    return {
        ok: false,
        livre: info.livre,
        preciso,
        motivo: `Preciso de ~${gb(preciso)} GB livres (arquivo de ${gb(tamanhoEstimado)} GB + merge + reserva) ` +
                `e só há ${gb(info.livre)} GB no disco.`
    }
}

/**
 * Remove arquivos de mídia antigos do diretório temporário.
 * O caminho do Drive baixa arquivos de GB; se um upload falhar no meio, o
 * arquivo fica órfão e o disco enche em poucos dias.
 *
 * @param {string} dir
 * @param {number} idadeMaximaMs padrão 6h
 * @returns {Promise<{removidos:number, bytesLiberados:number}>}
 */
async function limparAntigos(dir, idadeMaximaMs = 6 * 60 * 60 * 1000) {
    let removidos = 0
    let bytesLiberados = 0
    const limite = Date.now() - idadeMaximaMs

    let entradas
    try {
        entradas = await fs.promises.readdir(dir)
    } catch (e) {
        logger.warn(`[DISK GUARD] Não consegui listar ${dir}: ${e.message}`)
        return { removidos, bytesLiberados }
    }

    for (const nome of entradas) {
        const alvo = `${dir}/${nome}`
        try {
            const st = await fs.promises.stat(alvo)
            if (!st.isFile() || st.mtimeMs > limite) continue
            await fs.promises.unlink(alvo)
            removidos++
            bytesLiberados += st.size
        } catch (e) {
            // Arquivo em uso ou já removido por outro processo: seguir adiante.
            logger.warn(`[DISK GUARD] Não removi ${nome}: ${e.message}`)
        }
    }

    if (removidos) {
        logger.info(`[DISK GUARD] ${removidos} arquivo(s) antigos removidos — ${gb(bytesLiberados)} GB liberados`)
    }
    return { removidos, bytesLiberados }
}

module.exports = { espacoLivre, temEspacoPara, limparAntigos, RESERVA_BYTES, FATOR_MERGE }
