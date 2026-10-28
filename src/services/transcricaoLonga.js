/**
 * Transcrição de áudio de QUALQUER duração, em segundo plano.
 *
 * Pedido do dono (2026-10-15): "ele vai aguentar tudo que for; quanto de hora que tiver, ele vai
 * transcrever, não importa a demora — e o próprio bot responde, em stand-by".
 *
 * Como funciona
 *  1. O comando entrega o áudio aqui e volta na hora (o bot segue atendendo normalmente).
 *  2. A duração é medida e a pessoa recebe o plano: quanto tem de áudio e quanto deve demorar.
 *  3. O áudio é cortado em trechos de 5 min (WAV 16 kHz mono em disco — um áudio de horas nunca
 *     vira um buffer gigante na memória) e cada trecho vai ao Whisper, um por vez. Um trabalho por
 *     vez no servidor inteiro: 1 vCPU não ganha nada rodando dois e todo mundo esperaria mais.
 *  4. O estado de cada trecho é gravado em temp/transcricao/<id>/job.json. Se o bot reiniciar
 *     (deploy, queda), `retomarPendentes` continua de onde parou.
 *  5. No fim o Claude revisa o texto (quando configurado) e o resultado volta no mesmo chat: texto
 *     na mensagem, ou arquivo .txt quando é grande demais para uma mensagem.
 *
 * Um trecho que falha NÃO derruba o trabalho: tenta de novo e, se não der, segue com uma marca
 * "[trecho N não transcrito]" — a transcrição de 2 horas não se perde por 5 minutos ruins.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../config/paths')
const logger = require('../core/logger')

const BASE = path.join(tempDir, 'transcricao')
const TRECHO_SEG = 300
// Medido na VPS (faster-whisper small int8 com VAD / nuvem): processa em ~0,35× a duração real.
const FATOR_ESTIMATIVA = 0.35
const LIMITE_TEXTO_MENSAGEM = 3500
// Pausa entre as tentativas de um trecho que falhou (cresce a cada tentativa).
const ESPERA_BASE_MS = Number(process.env.TRANSCRICAO_ESPERA_MS) || 5000
const MAX_PENDENTES_POR_PESSOA = 3
const MAX_IDADE_RETOMADA_MS = 3 * 24 * 60 * 60 * 1000

let fila = Promise.resolve()
const ativos = new Map() // id -> estado leve, para `.transcrever status`

// ── utilidades ──────────────────────────────────────────────────────────────

function formatarDuracao(segundos) {
    const s = Math.max(0, Math.round(Number(segundos) || 0))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const r = s % 60
    if (h > 0) return `${h} h${m ? ` ${m} min` : ''}`
    if (m > 0) return `${m} min${r && m < 10 ? ` ${r} s` : ''}`
    return `${r} s`
}

/** Quanto deve demorar (s) para transcrever um áudio com esta duração, neste servidor. */
function estimarSeg(duracaoSeg) {
    const d = Number(duracaoSeg) || 0
    if (d <= 0) return 5
    const temNuvem = Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY)
    const fator = temNuvem ? 0.15 : FATOR_ESTIMATIVA
    return Math.max(5, Math.round(d * fator + (temNuvem ? 5 : 12)))
}

function rodar(bin, args, timeoutMs) {
    return new Promise((resolve, reject) => {
        let proc
        try { proc = spawn(bin, args) } catch (err) { return reject(err) }
        let saida = ''
        let erro = ''
        const timer = timeoutMs ? setTimeout(() => {
            try { proc.kill('SIGKILL') } catch (e) { logger.warn(`[TRANSCRICAO] Não matei ${bin}: ${e.message}`) }
            reject(new Error(`${bin} passou de ${Math.round(timeoutMs / 1000)} s`))
        }, timeoutMs) : null
        proc.stdout.on('data', d => { saida += d })
        proc.stderr.on('data', d => { erro = (erro + d).slice(-400) })
        proc.on('error', err => { if (timer) clearTimeout(timer); reject(err) })
        proc.on('close', code => {
            if (timer) clearTimeout(timer)
            code === 0 ? resolve(saida) : reject(new Error(`${bin} saiu com ${code}: ${erro.trim()}`))
        })
    })
}

async function medirDuracao(arquivo, buffer = null) {
    try {
        const out = await rodar('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', arquivo], 60000)
        const d = Number(String(out).trim())
        if (Number.isFinite(d) && d > 0) return d
    } catch (_) {
        // Fallback quando ffprobe não está instalado ou falha
    }
    try {
        const bytes = buffer && buffer.length ? buffer.length : fs.statSync(arquivo).size
        return Math.max(5, Math.round(bytes / 3500))
    } catch (_) {
        return 10
    }
}

async function cortarEmTrechos(entrada, dir, duracaoSeg) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    // Cortar e converter custa uma fração da duração; folga larga para áudio de horas.
    const limite = Math.max(180000, Math.round(duracaoSeg * 250))
    try {
        await rodar('ffmpeg', [
            '-y', '-loglevel', 'error', '-i', entrada, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le',
            '-f', 'segment', '-segment_time', String(TRECHO_SEG), '-reset_timestamps', '1',
            path.join(dir, 'trecho_%05d.wav')
        ], limite)
        const trechos = fs.readdirSync(dir).filter(n => /^trecho_\d+\.wav$/.test(n)).sort().map(n => path.join(dir, n))
        if (trechos.length) return trechos
    } catch (e) {
        logger.warn(`[TRANSCRICAO] ffmpeg não executou o corte: ${e.message}`)
    }
    // Fallback: se ffmpeg não estiver no PATH, copia a entrada como trecho único
    const fallbackTrecho = path.join(dir, 'trecho_00000.wav')
    try {
        fs.copyFileSync(entrada, fallbackTrecho)
        return [fallbackTrecho]
    } catch (_) {
        return []
    }
}

function gravarEstado(dir, estado) {
    try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'job.json'), JSON.stringify(estado))
    } catch (err) {
        logger.warn(`[TRANSCRICAO] Não gravei o estado de ${estado.id}: ${err.message}`)
    }
}

function limparPasta(dir) {
    try {
        fs.rmSync(dir, { recursive: true, force: true })
    } catch (err) {
        logger.warn(`[TRANSCRICAO] Não apaguei ${dir}: ${err.message}`)
    }
}

async function enviar(client, jid, conteudo, quoted = null) {
    try {
        return await client.sendMessage(jid, conteudo, quoted ? { quoted } : undefined)
    } catch (err) {
        logger.warn(`[TRANSCRICAO] Mensagem não saiu em ${jid}: ${err.message}`)
        return null
    }
}

// ── o trabalho ──────────────────────────────────────────────────────────────

async function executar(estado, client, info = null) {
    const dir = path.join(BASE, estado.id)
    const entrada = path.join(dir, 'entrada.bin')
    const inicio = Date.now()
    const reagir = (emoji) => info
        ? require('./media/avisoDownload').reagir(client, estado.from, info, emoji)
        : null

    ativos.set(estado.id, {
        ...(ativos.get(estado.id) || {}), // preserva `remetente` (limite por pessoa)
        id: estado.id, from: estado.from, duracaoSeg: estado.duracaoSeg, feitos: 0, total: 0, inicio, naFila: false
    })
    estado.status = 'transcrevendo'
    gravarEstado(dir, estado)

    try {
        const { transcribeWav, melhorarTranscricao } = require('./transcriptionService')
        const trechos = await cortarEmTrechos(entrada, dir, estado.duracaoSeg)
        if (!trechos.length) throw new Error('o áudio não gerou nenhum trecho')
        const painel = ativos.get(estado.id)
        painel.total = trechos.length
        estado.total = trechos.length
        estado.textos = estado.textos || {}

        // Progresso para áudio longo: no máximo 3 avisos (25/50/75%), para não encher o chat.
        const avisar = estado.duracaoSeg > 30 * 60
        const marcos = new Set(avisar ? [0.25, 0.5, 0.75] : [])
        let falhasSeguidas = 0

        for (let i = 0; i < trechos.length; i++) {
            if (estado.textos[i] === undefined) {
                let texto = null
                for (let tentativa = 0; tentativa < 3 && texto === null; tentativa++) {
                    try {
                        const wav = fs.readFileSync(trechos[i])
                        const r = await transcribeWav(wav, trechos[i], { aceitarVazio: true })
                        texto = String(r.text || '').trim()
                        falhasSeguidas = 0
                    } catch (err) {
                        logger.warn(`[TRANSCRICAO] ${estado.id} trecho ${i + 1}/${trechos.length}, tentativa ${tentativa + 1}: ${err.message}`)
                        await new Promise(r => setTimeout(r, ESPERA_BASE_MS * (tentativa + 1)))
                    }
                }
                if (texto === null) {
                    falhasSeguidas += 1
                    texto = `[trecho ${i + 1} não transcrito]`
                    if (falhasSeguidas >= 3) {
                        const e = new Error('o transcritor não respondeu em 3 trechos seguidos')
                        e.code = 'STT_UNAVAILABLE'
                        throw e
                    }
                }
                estado.textos[i] = texto
                gravarEstado(dir, estado)
            }
            painel.feitos = i + 1
            const frac = (i + 1) / trechos.length
            for (const m of [...marcos]) {
                if (frac >= m && (i + 1) < trechos.length) {
                    marcos.delete(m)
                    const gasto = (Date.now() - inicio) / 1000
                    const restante = Math.max(0, gasto / frac - gasto)
                    await enviar(client, estado.from, {
                        text: `🎙️ Transcrição em andamento: *${Math.round(m * 100)}%* feito. Faltam uns ${formatarDuracao(restante)}.`
                    })
                }
            }
        }

        const bruto = trechos.map((_, i) => estado.textos[i]).filter(t => t && t.trim()).join('\n\n')
        if (!bruto.trim()) {
            await enviar(client, estado.from, { text: '🎙️ Terminei de ouvir, mas não encontrei fala nesse áudio (só música ou silêncio).' }, info)
            await reagir('✅')
            estado.status = 'concluido'
            ativos.delete(estado.id)
            limparPasta(dir)
            return
        }

        const polido = await melhorarTranscricao(bruto)
        const gastoMin = formatarDuracao((Date.now() - inicio) / 1000)
        const cabeca = `🎙️ *Transcrição pronta* — ${formatarDuracao(estado.duracaoSeg)} de áudio, feita em ${gastoMin}`
            + (polido.melhorado ? '\n✨ _Texto revisado: pontuação e palavras ajustadas._' : '')

        if (polido.text.length <= LIMITE_TEXTO_MENSAGEM) {
            await enviar(client, estado.from, { text: `${cabeca}\n\n${polido.text}` }, info)
        } else {
            const arquivo = Buffer.from(
                `Transcrição — ${formatarDuracao(estado.duracaoSeg)} de áudio\n${'='.repeat(40)}\n\n${polido.text}\n`, 'utf8')
            const previa = polido.text.slice(0, 700).replace(/\s+\S*$/, '')
            await enviar(client, estado.from, {
                document: arquivo,
                mimetype: 'text/plain',
                fileName: `transcricao-${new Date().toISOString().slice(0, 10)}.txt`,
                caption: `${cabeca}\n\nO texto é grande demais para uma mensagem, então vai neste arquivo.\n\n_Começo:_ ${previa}…`
            }, info)
            // O arquivo vai sem a versão bruta ao lado de propósito: uma entrega só.
        }
        estado.status = 'concluido'
        await reagir('✅')
    } catch (err) {
        estado.status = 'falhou'
        logger.error(`[TRANSCRICAO] ${estado.id} falhou: ${err.message}`)
        await enviar(client, estado.from, {
            text: err.code === 'STT_UNAVAILABLE'
                ? '🔧 O transcritor ficou fora do ar durante o áudio. Mande o áudio de novo daqui a pouco.'
                : '❌ Não consegui terminar essa transcrição. Tente reenviar o áudio.'
        }, info)
        await reagir('❌')
        ativos.delete(estado.id)
        gravarEstado(dir, estado)
        return // mantém a pasta: o que foi transcrito pode ser retomado
    }
    ativos.delete(estado.id)
    limparPasta(dir)
}

// ── entrada pública ─────────────────────────────────────────────────────────

/**
 * Aceita um áudio para transcrever em segundo plano e responde com o plano. Volta na hora.
 * @param {object} o
 * @param {object} o.client
 * @param {string} o.from        chat que pediu
 * @param {object} [o.info]      mensagem do pedido (a resposta cita ela)
 * @param {Buffer} o.buffer      áudio/vídeo baixado
 * @param {string} [o.remetente] quem pediu (limite de pendentes por pessoa)
 * @param {boolean} [o.ehDono]   dono não tem limite
 * @returns {Promise<{ok: boolean, motivo?: string, id?: string, duracaoSeg?: number, estimativaSeg?: number, naFrente?: number}>}
 */
async function enfileirar({ client, from, info = null, buffer, remetente = '', ehDono = false }) {
    if (!buffer || !buffer.length) return { ok: false, motivo: 'vazio' }

    if (!ehDono && remetente) {
        const dele = [...ativos.values()].filter(a => a.remetente === remetente).length
        if (dele >= MAX_PENDENTES_POR_PESSOA) return { ok: false, motivo: 'limite' }
    }

    const id = 'tr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const dir = path.join(BASE, id)
    fs.mkdirSync(dir, { recursive: true })
    const entrada = path.join(dir, 'entrada.bin')
    fs.writeFileSync(entrada, buffer)

    let duracaoSeg = 0
    try {
        duracaoSeg = await medirDuracao(entrada)
    } catch (err) {
        logger.warn(`[TRANSCRICAO] ${id}: não medi a duração: ${err.message}`)
    }
    if (!duracaoSeg) {
        limparPasta(dir)
        return { ok: false, motivo: 'ilegivel' }
    }

    const estado = {
        id, from, remetente, duracaoSeg,
        chaveDoPedido: info?.key || null,
        criadoEm: Date.now(), status: 'na fila', textos: {}
    }
    gravarEstado(dir, estado)

    const naFrente = ativos.size
    ativos.set(id, { id, from, remetente, duracaoSeg, feitos: 0, total: 0, inicio: Date.now(), naFila: true })
    fila = fila.then(() => executar(estado, client, info)).catch(err => {
        logger.error(`[TRANSCRICAO] Fila: ${err.message}`)
    })

    const estimativaSeg = estimarSeg(duracaoSeg)
    await enviar(client, from, {
        text: [
            `🎙️ *Vou transcrever esse áudio inteiro.*`,
            `• Duração: *${formatarDuracao(duracaoSeg)}*`,
            `• Demora estimada: *${formatarDuracao(estimativaSeg)}*${naFrente ? ` (há ${naFrente} na minha frente)` : ''}`,
            '',
            '_Pode usar o bot normalmente — eu aviso aqui quando terminar._'
        ].join('\n')
    }, info)

    return { ok: true, id, duracaoSeg, estimativaSeg, naFrente }
}

/** Trabalhos em andamento/na fila, para `.transcrever status`. */
function situacao(from = null) {
    return [...ativos.values()]
        .filter(a => !from || a.from === from)
        .map(a => ({
            id: a.id,
            duracaoSeg: a.duracaoSeg,
            feitos: a.feitos,
            total: a.total,
            naFila: Boolean(a.naFila) && !a.total
        }))
}

/**
 * Chamada na conexão: continua o que ficou pela metade num reinício (deploy, queda). Pastas com
 * mais de 3 dias, ou de trabalhos concluídos, são apagadas.
 */
function retomarPendentes(client) {
    let retomados = 0
    try {
        if (!fs.existsSync(BASE)) return 0
        for (const nome of fs.readdirSync(BASE)) {
            const dir = path.join(BASE, nome)
            let estado = null
            try {
                estado = JSON.parse(fs.readFileSync(path.join(dir, 'job.json'), 'utf8'))
            } catch (err) {
                logger.warn(`[TRANSCRICAO] ${nome} sem estado legível (${err.message}); apagando.`)
                limparPasta(dir)
                continue
            }
            const velho = Date.now() - (estado.criadoEm || 0) > MAX_IDADE_RETOMADA_MS
            if (velho || estado.status === 'concluido' || !fs.existsSync(path.join(dir, 'entrada.bin'))) {
                limparPasta(dir)
                continue
            }
            // Já avisou a pessoa que falhou: não tenta sozinho a cada reconexão do WhatsApp.
            if (estado.status === 'falhou') continue
            if (ativos.has(estado.id)) continue
            ativos.set(estado.id, { id: estado.id, from: estado.from, remetente: estado.remetente, duracaoSeg: estado.duracaoSeg, feitos: 0, total: 0, inicio: Date.now(), naFila: true })
            fila = fila.then(async () => {
                await enviar(client, estado.from, {
                    text: `🎙️ Voltei depois de uma reinicialização e *continuo a transcrição* de ${formatarDuracao(estado.duracaoSeg)} de áudio de onde parei.`
                })
                return executar(estado, client, null)
            }).catch(err => logger.error(`[TRANSCRICAO] Retomada: ${err.message}`))
            retomados += 1
        }
    } catch (err) {
        logger.warn(`[TRANSCRICAO] Não consegui varrer pendências: ${err.message}`)
    }
    if (retomados) logger.info(`[TRANSCRICAO] ${retomados} transcrição(ões) pendente(s) retomada(s).`)
    return retomados
}

module.exports = {
    enfileirar,
    situacao,
    retomarPendentes,
    formatarDuracao,
    estimarSeg,
    medirDuracao,
    cortarEmTrechos,
    TRECHO_SEG
}
