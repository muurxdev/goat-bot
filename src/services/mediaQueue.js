/**
 * Prioritized Media Job Queue System
 * Gerencia a concorrência global, prioridade por nível de usuário, limites por usuário e retentativas
 */

const { EventEmitter } = require('events')
const { MEDIA_ERRORS, MEDIA_LIMITS } = require('./media/constants')
const logger = require('../core/logger')

const QUEUE_PRIORITIES = {
    HIGH: 3,    // OWNER, BOT_ADMIN
    MEDIUM: 2,  // TRUSTED, GROUP_ADMIN
    LOW: 1      // USER
}

// Erros que não fazem sentido tentar de novo (causa definitiva)
const NON_RETRYABLE_ERRORS = new Set([
    MEDIA_ERRORS.CANCELLED,
    MEDIA_ERRORS.SECURITY_VIOLATION,
    MEDIA_ERRORS.MEDIA_NOT_FOUND,
    MEDIA_ERRORS.NO_RESULTS,
    MEDIA_ERRORS.INVALID_URL,
    MEDIA_ERRORS.UNSUPPORTED_PLATFORM,
    MEDIA_ERRORS.FORMAT_UNAVAILABLE,
    MEDIA_ERRORS.FILE_TOO_LARGE,
    MEDIA_ERRORS.DURATION_TOO_LONG,
    MEDIA_ERRORS.UPLOAD_FAILED,
    MEDIA_ERRORS.EXECUTABLE_NOT_FOUND,
    'RATE_LIMITED'
])

class MediaQueue extends EventEmitter {
    constructor({ maxConcurrency = 2, defaultTimeoutMs = 180000, maxRetries = 0 } = {}) {
        super()
        this.maxConcurrency = maxConcurrency
        this.defaultTimeoutMs = defaultTimeoutMs
        this.maxRetries = maxRetries
        this.activeCount = 0
        this.queue = []
        this.activeJobs = new Map()
        this.history = []
    }

    /**
     * Adiciona um trabalho de download à fila com prioridade e controle de limites
     * @param {object} taskData
     * @param {string} [taskData.id] - ID opcional do job
     * @param {string} taskData.url - URL ou termo de busca
     * @param {string} taskData.format - Formato ('mp3', 'mp4')
     * @param {string} taskData.user - JID do solicitante
     * @param {number} [taskData.priority=1] - Prioridade (1: LOW, 2: MEDIUM, 3: HIGH)
     * @param {Function} taskData.runFn - Função assíncrona executora
     * @param {number} [taskData.timeoutMs] - Timeout individual
     * @param {number} [taskData.duration] - Duração em segundos da mídia
     * @param {number} [taskData.retries] - Tentativas permitidas
     * @returns {Promise<any>}
     */
    async enqueue({ id, url, format, user, priority = QUEUE_PRIORITIES.LOW, runFn, timeoutMs = null, duration = null, retries = null }) {
        // Validação de limite de jobs concorrentes por usuário (usuários comuns: máx 1)
        if (priority === QUEUE_PRIORITIES.LOW) {
            const userActiveOrQueued = this.getUserPendingCount(user)
            if (userActiveOrQueued >= 2) {
                const err = new Error('Você já possui downloads em processamento na fila. Aguarde a conclusão antes de solicitar novos.')
                err.code = 'RATE_LIMITED'
                throw err
            }
        }

        const maxTimeout = MEDIA_LIMITS.MAX_DOWNLOAD_TIMEOUT_MS || (90 * 60 * 1000)
        let effectiveTimeout = timeoutMs
        if (!effectiveTimeout) {
            const durSec = Number(duration) || 0
            if (durSec > 0) {
                effectiveTimeout = Math.min(
                    maxTimeout,
                    Math.max(this.defaultTimeoutMs, Math.round(durSec * 1500))
                )
            } else if (format === 'mp4') {
                // Vídeo sem duração conhecida (Instagram, Pinterest, link genérico,
                // YouTube sem metadados): 10 minutos. Antes a linha de cima dava o teto
                // e esta o sobrescrevia com 3 minutos, cortando vídeos maiores no meio.
                effectiveTimeout = Math.min(maxTimeout, Math.max(this.defaultTimeoutMs || 0, 10 * 60 * 1000))
            } else {
                effectiveTimeout = this.defaultTimeoutMs
            }
        }

        const jobId = id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        const job = {
            id: jobId,
            url,
            format,
            user,
            priority,
            runFn,
            duration,
            timeoutMs: effectiveTimeout,
            retriesLeft: retries !== null ? retries : this.maxRetries,
            status: 'QUEUED',
            enqueuedAt: Date.now(),
            startedAt: null,
            finishedAt: null
        }

        return new Promise((resolve, reject) => {
            job.resolve = resolve
            job.reject = reject

            // Insere na fila ordenando por prioridade decrescente (HIGH -> MEDIUM -> LOW)
            this.insertSorted(job)
            this.emit('job.enqueued', { jobId: job.id, user: job.user, position: this.getJobPosition(job.id) })

            this.processNext()
        })
    }

    insertSorted(job) {
        let inserted = false
        for (let i = 0; i < this.queue.length; i++) {
            if (job.priority > this.queue[i].priority) {
                this.queue.splice(i, 0, job)
                inserted = true
                break
            }
        }
        if (!inserted) {
            this.queue.push(job)
        }
    }

    async processNext() {
        if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
            return
        }

        const job = this.queue.shift()
        this.activeCount++
        this.activeJobs.set(job.id, job)
        job.status = 'PROCESSING'
        job.startedAt = Date.now()

        this.emit('job.started', { jobId: job.id, user: job.user })
        logger.info(`[MEDIA QUEUE] Executando job ${job.id} (Prio: ${job.priority}, User: ${job.user}). Ativos: ${this.activeCount}, Aguardando: ${this.queue.length}`)

        // Watchdog de Timeout
        let isTimedOut = false
        const timer = setTimeout(() => {
            isTimedOut = true
            const err = new Error(`Job ${job.id} excedeu o tempo limite de execução (${Math.round(job.timeoutMs / 1000)}s).`)
            err.code = 'TIMEOUT'
            err.isQueueWatchdog = true
            this.handleJobFailure(job, err)
        }, job.timeoutMs)

        try {
            const result = await job.runFn()
            clearTimeout(timer)
            if (isTimedOut) return

            job.status = 'COMPLETED'
            job.finishedAt = Date.now()
            this.emit('job.completed', { jobId: job.id, durationMs: job.finishedAt - job.startedAt })
            job.resolve(result)
        } catch (err) {
            clearTimeout(timer)
            if (isTimedOut) return
            await this.handleJobFailure(job, err)
        } finally {
            this.activeCount--
            this.activeJobs.delete(job.id)
            this.archiveJob(job)
            this.processNext()
        }
    }

    async handleJobFailure(job, err) {
        // Se foi o watchdog da fila (tempo máximo atingido), não tenta de novo para evitar loop infinito
        const isExhaustiveTimeout = err && err.isQueueWatchdog
        const retryable = job.retriesLeft > 0 && !NON_RETRYABLE_ERRORS.has(err.code) && !isExhaustiveTimeout
        if (retryable) {
            job.retriesLeft--
            logger.warn(`[MEDIA QUEUE] Erro no job ${job.id} (${err.code || 'sem-código'}). Tentando novamente (${job.retriesLeft} restantes)...`)
            job.status = 'QUEUED'
            this.insertSorted(job)
        } else {
            job.status = 'FAILED'
            job.error = err
            job.finishedAt = Date.now()
            this.emit('job.failed', { jobId: job.id, error: err })
            job.reject(err)
        }
    }

    cancel(jobId) {
        // 1. Remove da fila de espera se estiver aguardando
        const queueIdx = this.queue.findIndex(j => j.id === jobId)
        if (queueIdx !== -1) {
            const [job] = this.queue.splice(queueIdx, 1)
            job.status = 'CANCELLED'
            const err = new Error('Job cancelado na fila.')
            err.code = 'CANCELLED'
            job.reject(err)
            this.archiveJob(job)
            return true
        }

        // 2. Se estiver em execução ativa
        const active = this.activeJobs.get(jobId)
        if (active) {
            active.status = 'CANCELLED'
            const err = new Error('Job cancelado durante a execução.')
            err.code = 'CANCELLED'
            active.reject(err)
            return true
        }

        return false
    }

    /** Job esperando ou em execução com esse código (null se já saiu da fila). */
    getJob(jobId) {
        return this.queue.find(j => j.id === jobId) || this.activeJobs.get(jobId) || null
    }

    getJobPosition(jobId) {
        const idx = this.queue.findIndex(j => j.id === jobId)
        return idx !== -1 ? idx + 1 : 0
    }

    getUserPendingCount(user) {
        let count = 0
        for (const job of this.queue) {
            if (job.user === user) count++
        }
        for (const [_, job] of this.activeJobs) {
            if (job.user === user) count++
        }
        return count
    }

    getStats() {
        return {
            activeWorkers: this.activeCount,
            maxConcurrency: this.maxConcurrency,
            queueLength: this.queue.length,
            pendingJobs: this.queue.map(j => ({
                id: j.id,
                user: j.user,
                priority: j.priority,
                format: j.format,
                queuedForMs: Date.now() - j.enqueuedAt
            })),
            activeJobs: Array.from(this.activeJobs.values()).map(j => ({
                id: j.id,
                user: j.user,
                priority: j.priority,
                runningForMs: Date.now() - j.startedAt
            }))
        }
    }

    archiveJob(job) {
        this.history.push({
            id: job.id,
            user: job.user,
            status: job.status,
            priority: job.priority,
            durationMs: (job.finishedAt || Date.now()) - (job.startedAt || job.enqueuedAt)
        })
        if (this.history.length > 50) this.history.shift()
    }

    getStatus() {
        return {
            active: this.activeCount,
            queued: this.queue.length,
            totalHistory: this.history.length
        }
    }
}

const mediaQueue = new MediaQueue({ maxConcurrency: 4 })

module.exports = {
    MediaQueue,
    mediaQueue,
    QUEUE_PRIORITIES
}
