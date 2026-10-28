/**
 * Multi-Platform Media Engine Orchestrator
 * Arquitetura unificada para resolução, pesquisa, download, conversão e upload
 */

const { EventEmitter } = require('events')
const path = require('path')
const fs = require('fs')
const {
    PLATFORMS,
    MEDIA_TYPES,
    FORMATS,
    QUALITIES,
    MEDIA_ERRORS,
    MEDIA_LIMITS,
    parseEnvMs
} = require('./constants')
const {
    validateUrl,
    looksLikeUrl,
    normalizeInput,
    detectPlatform,
    resolveProvider,
    normalizeUrl,
    extractMetadata
} = require('./mediaResolver')
const { searchMedia, formatSearchResults, formatDuration } = require('./mediaSearch')
const { resolveDownloadFormat } = require('./formatResolver')
const { downloadMedia, cancelDownload, cleanupJobDir } = require('./mediaDownloader')
const { processMedia } = require('./mediaProcessor')
const { uploadMedia } = require('./mediaUploader')
const { checkMediaEnv, isYtDlpAvailable, isFfmpegAvailable, runVersion } = require('./mediaEnvCheck')
const { lastErrorLines, toMessage, isMissingBinary } = require('./mediaErrors')
const logger = require('../../core/logger')

class MediaEngine extends EventEmitter {
    constructor() {
        super()
        this.activeJobs = new Map()
    }

    /**
     * Emite um evento de fase do pipeline (SEARCH_STARTED, DOWNLOAD_PROGRESS, etc.)
     * preservando os eventos legados usados pelas telas existentes.
     * @param {object} payload - { jobId?, input?, phase, ...dados }
     */
    emitPhase({ jobId = null, input = null, phase, ...data }) {
        const payload = { phase, ...data }
        if (jobId) payload.jobId = jobId
        if (input) payload.input = input
        this.emit('media.phase', payload)
    }

    /**
     * Cria e registra um novo Job de Mídia
     */
    createJob({ userId, chatId, source, requestedFormat = FORMATS.MP3, requestedQuality = QUALITIES.BEST, type = MEDIA_TYPES.AUDIO, duration = 0, metadata = null }) {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        const job = {
            id: jobId,
            userId,
            chatId,
            source,
            platform: detectPlatform(source) || PLATFORMS.GENERIC,
            type,
            requestedFormat,
            requestedQuality,
            duration: Number(duration) || 0,
            metadata: metadata || null,
            status: 'PENDING',
            tempDir: null,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        this.activeJobs.set(jobId, job)
        return job
    }

    /**
     * Executa pesquisa textual de faixas e vídeos
     */
    async search(query, options = {}) {
        this.emitPhase({ input: query, phase: 'SEARCH_STARTED' })
        this.emit('media.search', { query, status: 'SEARCHING' })
        try {
            const results = await searchMedia(query, options)
            this.emitPhase({ input: query, phase: 'SEARCH_COMPLETED', count: results.length })
            this.emit('media.search', { query, status: 'COMPLETED', count: results.length })
            return results
        } catch (err) {
            this.emitPhase({ input: query, phase: 'SEARCH_FAILED', error: err.code })
            this.emit('media.error', { query, error: err })
            throw err
        }
    }

    /**
     * Resolve e extrai metadados de uma URL ou termo
     */
    async resolve(urlOrQuery, options = {}) {
        this.emitPhase({ input: urlOrQuery, phase: 'ANALYSIS_STARTED' })
        this.emit('media.analyze', { input: urlOrQuery, status: 'ANALYZING' })
        try {
            const meta = await extractMetadata(urlOrQuery, options)
            this.emitPhase({ input: urlOrQuery, phase: 'ANALYSIS_COMPLETED', platform: meta.platform })
            this.emit('media.analyze', { input: urlOrQuery, status: 'COMPLETED', metadata: meta })
            return meta
        } catch (err) {
            this.emitPhase({ input: urlOrQuery, phase: 'ANALYSIS_FAILED', error: err.code })
            this.emit('media.error', { input: urlOrQuery, error: err })
            throw err
        }
    }

    /**
     * Executa o ciclo completo de download e processamento de um Job
     */
    async processJob(job, { onProgress = null } = {}) {
        job.status = 'ANALYZING'
        job.updatedAt = Date.now()
        this.emitPhase({ jobId: job.id, phase: 'ANALYSIS_STARTED' })

        // 1. Extração de Metadados se ainda não existirem
        if (!job.metadata) {
            job.metadata = await this.resolve(job.source)
            job.platform = job.metadata.platform
        }
        if (job.metadata && job.metadata.duration && !job.duration) {
            job.duration = Number(job.metadata.duration) || 0
        }
        this.emitPhase({ jobId: job.id, phase: 'ANALYSIS_COMPLETED' })

        job.status = 'DOWNLOADING'
        job.updatedAt = Date.now()
        this.emitPhase({ jobId: job.id, phase: 'DOWNLOAD_STARTED' })

        // 2. Download seguro da mídia
        let downloadResult = null
        try {
            downloadResult = await downloadMedia(job, (p) => {
                this.emitPhase({ jobId: job.id, phase: 'DOWNLOAD_PROGRESS', ...p })
                this.emit('media.download', { jobId: job.id, ...p })
                if (onProgress) onProgress(p)
            })
        } catch (downloadErr) {
            job.status = 'FAILED'
            job.updatedAt = Date.now()
            this.emitPhase({ jobId: job.id, phase: 'FAILED', error: downloadErr.code })
            this.emit('media.error', { jobId: job.id, error: downloadErr })
            this.cleanup(job.id)
            throw downloadErr
        }

        this.emitPhase({ jobId: job.id, phase: 'DOWNLOAD_COMPLETED', size: downloadResult.size })

        job.status = 'PROCESSING'
        job.updatedAt = Date.now()
        this.emitPhase({ jobId: job.id, phase: 'PROCESSING_STARTED' })
        this.emit('media.process', { jobId: job.id, status: 'PROCESSING' })

        job.status = 'COMPLETED'
        job.updatedAt = Date.now()
        this.emitPhase({ jobId: job.id, phase: 'PROCESSING_COMPLETED' })
        this.emitPhase({ jobId: job.id, phase: 'COMPLETED' })
        this.emit('media.complete', { jobId: job.id, result: downloadResult })

        return downloadResult
    }

    /**
     * Cancela um Job ativo
     */
    cancel(jobId) {
        const cancelled = cancelDownload(jobId)
        const job = this.activeJobs.get(jobId)
        if (job) {
            job.status = 'CANCELLED'
            job.updatedAt = Date.now()
        }
        this.cleanup(jobId)
        this.emitPhase({ jobId, phase: 'CANCELLED' })
        this.emit('media.cancelled', { jobId })
        return cancelled
    }

    /**
     * Remove diretório temporário do Job
     */
    cleanup(jobId) {
        const job = this.activeJobs.get(jobId)
        if (job && job.tempDir) {
            cleanupJobDir(job.tempDir)
        }
        this.activeJobs.delete(jobId)
    }
}

// Instância singleton principal
const mediaEngine = new MediaEngine()

// Exportações retrocompatíveis para serviços existentes
module.exports = {
    MediaEngine,
    mediaEngine,
    PLATFORMS,
    MEDIA_TYPES,
    FORMATS,
    QUALITIES,
    MEDIA_ERRORS,
    MEDIA_LIMITS,
    parseEnvMs,
    validateUrl,
    looksLikeUrl,
    normalizeInput,
    detectPlatform,
    resolveProvider,
    normalizeUrl,
    extractMetadata,
    searchMedia,
    formatSearchResults,
    formatDuration,
    resolveDownloadFormat,
    downloadMedia: async (options) => {
        const dur = options.duration || (options.metadata && options.metadata.duration) || 0
        const job = mediaEngine.createJob({
            userId: options.userJid || options.userId,
            source: options.url,
            requestedFormat: options.format || FORMATS.MP3,
            requestedQuality: options.quality || QUALITIES.BEST,
            duration: dur,
            metadata: options.metadata || null
        })
        if (options.userJid) job.user = options.userJid
        return mediaEngine.processJob(job, { onProgress: options.onProgress })
    },
    uploadMedia,
    checkMediaEnv,
    isYtDlpAvailable,
    isFfmpegAvailable,
    runVersion,
    lastErrorLines,
    toMessage,
    isMissingBinary
}

