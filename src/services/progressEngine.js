/**
 * Live Progress Engine
 *
 * Gerencia a máquina de estados e renderização visual de progresso em tempo real
 * para operações de mídia e downloads:
 *
 * CREATED → SEARCHING → ANALYZING → QUEUED → DOWNLOADING → PROCESSING → UPLOADING → COMPLETED
 */

const logger = require('../core/logger')

const PROGRESS_STATES = {
    CREATED: 'CREATED',
    SEARCH: 'SEARCHING',
    SEARCHING: 'SEARCHING',
    ANALYZE: 'ANALYZING',
    ANALYZING: 'ANALYZING',
    QUEUE: 'QUEUED',
    QUEUED: 'QUEUED',
    DOWNLOAD: 'DOWNLOADING',
    DOWNLOADING: 'DOWNLOADING',
    PROCESS: 'PROCESSING',
    PROCESSING: 'PROCESSING',
    UPLOAD: 'UPLOADING',
    UPLOADING: 'UPLOADING',
    COMPLETE: 'COMPLETED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    ERROR: 'ERROR'
}

/**
 * Gera uma barra visual de progresso Unicode com porcentagem alinhada
 * @param {number} percent - Valor de 0 a 100
 * @param {number} barLength - Comprimento da barra (padrão: 10 caracteres)
 * @returns {string} Ex: "███████░░░  72%"
 */
function renderProgressBar(percent = 0, barLength = 10) {
    const clamped = Math.max(0, Math.min(100, isNaN(percent) ? 0 : percent))
    const filled = Math.round((clamped / 100) * barLength)
    const empty = Math.max(0, barLength - filled)
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    const pctStr = String(Math.round(clamped)).padStart(3, ' ') + '%'
    return `${bar} ${pctStr}`
}

/**
 * Formata o card visual completo do Progress Engine
 */
function formatProgressDashboard({
    title = 'Mídia',
    platform = 'Web Media',
    currentState = PROGRESS_STATES.SEARCHING,
    progressMap = {},
    eta = '--:--',
    elapsedFormatted = '00:00',
    currentSize = null,
    totalSize = null,
    speed = null,
    jobId = null
}) {
    const normState = PROGRESS_STATES[currentState] || currentState
    const pSearch = progressMap.search !== undefined ? progressMap.search : (normState === PROGRESS_STATES.SEARCHING ? 80 : 100)
    const pAnalyze = progressMap.analyze !== undefined ? progressMap.analyze : ([PROGRESS_STATES.SEARCHING, PROGRESS_STATES.CREATED].includes(normState) ? 0 : (normState === PROGRESS_STATES.ANALYZING ? 70 : 100))
    const pQueue = progressMap.queue !== undefined ? progressMap.queue : ([PROGRESS_STATES.SEARCHING, PROGRESS_STATES.ANALYZING, PROGRESS_STATES.CREATED].includes(normState) ? 0 : 100)
    const pDownload = progressMap.download !== undefined ? progressMap.download : (progressMap.downloadPercent !== undefined ? progressMap.downloadPercent : ([PROGRESS_STATES.SEARCHING, PROGRESS_STATES.ANALYZING, PROGRESS_STATES.QUEUED, PROGRESS_STATES.CREATED].includes(normState) ? 0 : (normState === PROGRESS_STATES.DOWNLOADING ? 60 : 100)))
    const pProcess = progressMap.process !== undefined ? progressMap.process : ([PROGRESS_STATES.SEARCHING, PROGRESS_STATES.ANALYZING, PROGRESS_STATES.QUEUED, PROGRESS_STATES.DOWNLOADING, PROGRESS_STATES.CREATED].includes(normState) ? 0 : (normState === PROGRESS_STATES.PROCESSING ? 50 : 100))
    const pUpload = progressMap.upload !== undefined ? progressMap.upload : (normState === PROGRESS_STATES.COMPLETED ? 100 : (normState === PROGRESS_STATES.UPLOADING ? 80 : 0))

    let downloadDetails = ''
    if (currentState === PROGRESS_STATES.DOWNLOADING) {
        let metrics = []
        if (currentSize && totalSize) metrics.push(`📦 ${currentSize} / ${totalSize}`)
        else if (totalSize) metrics.push(`📦 ${totalSize}`)
        if (speed) metrics.push(`⚡ ${speed}`)
        if (metrics.length > 0) {
            downloadDetails = `\n┃   ${metrics.join(' | ')}`
        }
    }

    let statusLine = ''
    if (currentState === PROGRESS_STATES.COMPLETED) {
        statusLine = `\n✅ *CONCLUÍDO COM SUCESSO!*`
    } else if (currentState === PROGRESS_STATES.CANCELLED) {
        statusLine = `\n🚫 *DOWNLOAD CANCELADO.*`
    } else if (currentState === PROGRESS_STATES.ERROR) {
        statusLine = `\n❌ *FALHA NO PROCESSAMENTO.*`
    }

    const cancelHint = jobId && ![PROGRESS_STATES.COMPLETED, PROGRESS_STATES.CANCELLED, PROGRESS_STATES.ERROR].includes(currentState)
        ? `\n_Para cancelar:_ \`.cancel ${jobId}\``
        : ''

    return `╭━━━〔 🎵 *PROCESSANDO MÍDIA* 〕━━━┈⊷
┃ 🌐 *Origem:* ${platform}
┃ 📌 *Título:* ${title.slice(0, 42)}
┣━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🔎 *Pesquisa*       ${renderProgressBar(pSearch)}
┃ 🔍 *Análise*        ${renderProgressBar(pAnalyze)}
┃ 📋 *Preparação*     ${renderProgressBar(pQueue)}
┃ 📥 *Download*       ${renderProgressBar(pDownload)}${downloadDetails}
┃ ⚙️ *Processamento*  ${renderProgressBar(pProcess)}
┃ 📤 *Upload*         ${renderProgressBar(pUpload)}
╰━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
⏱️ *ETA:* ${eta} | ⌛ *Decorrido:* ${elapsedFormatted}${statusLine}${cancelHint}`.trim()
}

/**
 * Sessão de rastreamento de progresso com atualização dinâmica via WhatsApp
 */
class ProgressSession {
    constructor({ client, from, initialMessage = null, title = 'Mídia', platform = 'Web Media', minUpdateIntervalMs = 1800, jobId = null }) {
        this.client = client
        this.from = from
        this.statusMessageKey = initialMessage?.key || null
        this.title = title
        this.platform = platform
        this.jobId = jobId || `job_${Date.now()}`
        this.minUpdateIntervalMs = minUpdateIntervalMs
        this.lastUpdateTimestamp = 0
        this.startTime = Date.now()
        this.currentState = PROGRESS_STATES.SEARCHING
        this.progressMap = {
            search: 0,
            analyze: 0,
            queue: 0,
            download: 0,
            process: 0,
            upload: 0
        }
        this.eta = '--:--'
        this.currentSize = null
        this.totalSize = null
        this.speed = null
        this.isClosed = false
    }

    setStatusMessageKey(key) {
        this.statusMessageKey = key
    }

    getElapsedFormatted() {
        const secs = Math.floor((Date.now() - this.startTime) / 1000)
        const mins = Math.floor(secs / 60)
        const remSecs = secs % 60
        return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`
    }

    getDashboardText() {
        return formatProgressDashboard({
            title: this.title,
            platform: this.platform,
            currentState: this.currentState,
            progressMap: this.progressMap,
            eta: this.eta,
            elapsedFormatted: this.getElapsedFormatted(),
            currentSize: this.currentSize,
            totalSize: this.totalSize,
            speed: this.speed,
            jobId: this.jobId
        })
    }

    async pushUpdate(force = false) {
        if (this.isClosed || !this.client || !this.from) return

        const now = Date.now()
        if (!force && (now - this.lastUpdateTimestamp < this.minUpdateIntervalMs)) {
            return
        }

        this.lastUpdateTimestamp = now
        const text = this.getDashboardText()

        try {
            if (this.statusMessageKey) {
                await this.client.sendMessage(this.from, {
                    text,
                    edit: this.statusMessageKey
                })
            } else {
                const sent = await this.client.sendMessage(this.from, { text })
                if (sent?.key) {
                    this.statusMessageKey = sent.key
                }
            }
        } catch (err) {
            logger.debug(`[PROGRESS ENGINE] Aviso na atualização de mensagem: ${err.message}`)
        }
    }

    setSearch(percent = 100) {
        this.currentState = PROGRESS_STATES.SEARCHING
        this.progressMap.search = percent
        return this.pushUpdate()
    }

    setAnalyze(percent = 100) {
        this.currentState = PROGRESS_STATES.ANALYZING
        this.progressMap.search = 100
        this.progressMap.analyze = percent
        return this.pushUpdate()
    }

    setQueue(pos = 1) {
        this.currentState = PROGRESS_STATES.QUEUED
        this.progressMap.search = 100
        this.progressMap.analyze = 100
        this.progressMap.queue = 100
        this.eta = `Fila #${pos}`
        return this.pushUpdate(true)
    }

    setDownload(percent, { eta = null, currentSize = null, totalSize = null, speed = null } = {}) {
        this.currentState = PROGRESS_STATES.DOWNLOADING
        this.progressMap.search = 100
        this.progressMap.analyze = 100
        this.progressMap.queue = 100
        this.progressMap.download = percent
        if (eta) this.eta = eta
        if (currentSize) this.currentSize = currentSize
        if (totalSize) this.totalSize = totalSize
        if (speed) this.speed = speed
        return this.pushUpdate()
    }

    setProcess(percent = 100) {
        this.currentState = PROGRESS_STATES.PROCESSING
        this.progressMap.search = 100
        this.progressMap.analyze = 100
        this.progressMap.queue = 100
        this.progressMap.download = 100
        this.progressMap.process = percent
        this.eta = 'Finalizando...'
        return this.pushUpdate(true)
    }

    setUpload(percent = 100) {
        this.currentState = PROGRESS_STATES.UPLOADING
        this.progressMap.search = 100
        this.progressMap.analyze = 100
        this.progressMap.queue = 100
        this.progressMap.download = 100
        this.progressMap.process = 100
        this.progressMap.upload = percent
        this.eta = 'Enviando...'
        return this.pushUpdate(true)
    }

    async setComplete() {
        this.currentState = PROGRESS_STATES.COMPLETED
        this.progressMap = { search: 100, analyze: 100, queue: 100, download: 100, process: 100, upload: 100 }
        this.eta = '00:00'
        await this.pushUpdate(true)
        this.isClosed = true
    }

    async setCancel() {
        this.currentState = PROGRESS_STATES.CANCELLED
        this.eta = 'Cancelado'
        await this.pushUpdate(true)
        this.isClosed = true
    }

    async setError(errMsg = 'Falha no processamento') {
        this.currentState = PROGRESS_STATES.ERROR
        this.eta = 'Erro'
        this.isClosed = true
    }
}

module.exports = {
    PROGRESS_STATES,
    renderProgressBar,
    formatProgressDashboard,
    ProgressSession
}
