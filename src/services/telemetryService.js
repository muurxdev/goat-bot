/**
 * Observability, Metrics & Health Telemetry Service
 * Rastreia latência de comandos, throughput, erros, integridade do SQLite e saúde do processo Node.js.
 */

const os = require('os')
const fs = require('fs')
const path = require('path')
const { getDatabase } = require('../database/connection')

const metrics = {
    startTime: Date.now(),
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    commands: new Map() // { [cmdName]: { count, errors, totalLatencyMs, minLatencyMs, maxLatencyMs, lastExecutedAt } }
}

/**
 * Registra a telemetria de execução de um comando
 */
function recordExecution(commandName, latencyMs = 0, success = true, error = null) {
    if (!commandName) return

    const name = commandName.toLowerCase()
    metrics.totalExecutions += 1

    if (success) {
        metrics.successfulExecutions += 1
    } else {
        metrics.failedExecutions += 1
    }

    const cmdMetric = metrics.commands.get(name) || {
        count: 0,
        errors: 0,
        totalLatencyMs: 0,
        minLatencyMs: Infinity,
        maxLatencyMs: 0,
        lastExecutedAt: null
    }

    cmdMetric.count += 1
    if (!success) cmdMetric.errors += 1
    cmdMetric.totalLatencyMs += latencyMs
    cmdMetric.minLatencyMs = Math.min(cmdMetric.minLatencyMs, latencyMs)
    cmdMetric.maxLatencyMs = Math.max(cmdMetric.maxLatencyMs, latencyMs)
    cmdMetric.lastExecutedAt = new Date().toISOString()

    metrics.commands.set(name, cmdMetric)
}

/**
 * Retorna os N comandos mais executados
 */
function getTopCommands(limit = 5) {
    const list = Array.from(metrics.commands.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        errors: data.errors,
        avgLatencyMs: Math.round(data.totalLatencyMs / (data.count || 1)),
        minLatencyMs: data.minLatencyMs === Infinity ? 0 : data.minLatencyMs,
        maxLatencyMs: data.maxLatencyMs,
        lastExecutedAt: data.lastExecutedAt
    }))

    return list.sort((a, b) => b.count - a.count).slice(0, limit)
}

/**
 * Retorna o sumário completo de métricas operacionais
 */
function getMetricsSummary() {
    const uptimeSec = Math.floor((Date.now() - metrics.startTime) / 1000)
    const successRate = metrics.totalExecutions > 0 
        ? ((metrics.successfulExecutions / metrics.totalExecutions) * 100).toFixed(1)
        : '100.0'

    const totalLatency = Array.from(metrics.commands.values()).reduce((acc, c) => acc + c.totalLatencyMs, 0)
    const overallAvgLatency = metrics.totalExecutions > 0 ? Math.round(totalLatency / metrics.totalExecutions) : 0

    return {
        uptimeSeconds: uptimeSec,
        totalExecutions: metrics.totalExecutions,
        successfulExecutions: metrics.successfulExecutions,
        failedExecutions: metrics.failedExecutions,
        successRatePercent: parseFloat(successRate),
        overallAvgLatencyMs: overallAvgLatency,
        uniqueCommandsExecuted: metrics.commands.size,
        topCommands: getTopCommands(5)
    }
}

/**
 * Executa healthcheck completo dos subsistemas (SQLite, Memória, Processo)
 */
function getHealthReport() {
    const mem = process.memoryUsage()
    let sqliteStatus = 'OK'
    let dbSizeBytes = 0

    try {
        const db = getDatabase()
        const check = db.prepare('SELECT 1 AS alive').get()
        if (!check || check.alive !== 1) sqliteStatus = 'ERROR'

        const dbPath = path.resolve(__dirname, '../../data/database.sqlite')
        if (fs.existsSync(dbPath)) {
            dbSizeBytes = fs.statSync(dbPath).size
        }
    } catch (err) {
        sqliteStatus = `ERROR: ${err.message}`
    }

    const uptimeSec = Math.floor(process.uptime())
    const hours = Math.floor(uptimeSec / 3600)
    const minutes = Math.floor((uptimeSec % 3600) / 60)
    const seconds = Math.floor(uptimeSec % 60)

    return {
        status: sqliteStatus === 'OK' ? 'HEALTHY' : 'DEGRADED',
        sqlite: {
            status: sqliteStatus,
            sizeKb: Math.round(dbSizeBytes / 1024)
        },
        memory: {
            rssMb: Math.round(mem.rss / 1024 / 1024),
            heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024)
        },
        system: {
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            nodeVersion: process.version,
            platform: `${os.type()} ${os.arch()}`,
            loadAvg: os.loadavg ? os.loadavg()[0].toFixed(2) : '0.00'
        }
    }
}

/**
 * Reseta as métricas (usado em testes)
 */
function resetMetrics() {
    metrics.startTime = Date.now()
    metrics.totalExecutions = 0
    metrics.successfulExecutions = 0
    metrics.failedExecutions = 0
    metrics.commands.clear()
}

module.exports = {
    recordExecution,
    getTopCommands,
    getMetricsSummary,
    getHealthReport,
    resetMetrics
}

