/**
 * Graceful Shutdown Manager
 * Gerencia o encerramento gracioso e idempotente do processo para SIGINT e SIGTERM
 */

const { closeDatabase } = require('../database/connection')
const { closeBot } = require('./connection')
const logger = require('./logger')

let isShuttingDown = false

/**
 * Executa o encerramento seguro e ordenado de todos os recursos
 * @param {string} signal - Sinal que disparou o shutdown (ex: 'SIGINT', 'SIGTERM', 'UNCAUGHT')
 * @param {number} exitCode - Código de saída do processo (padrão: 0)
 */
async function gracefulShutdown(signal = 'MANUAL', exitCode = 0) {
    if (isShuttingDown) {
        logger.warn(`[SHUTDOWN] Shutdown já em andamento. Ignorando chamada repetida (${signal}).`)
        return
    }

    isShuttingDown = true
    logger.info(`==================================================`)
    logger.info(`🛑 [SHUTDOWN] Recebido sinal ${signal}. Encerrando aplicação...`)
    logger.info(`==================================================`)

    const forceExitTimer = setTimeout(() => {
        logger.error('⚠️ [SHUTDOWN] Tempo limite de encerramento esgotado (5s). Forçando término.')
        process.exit(1)
    }, 5000)

    try {
        // 0. Parar workers em background
        try { require('../services/rentalWorker').stop() } catch (err) { logger.warn('[SHUTDOWN] falha ao parar rentalWorker: ' + err.message) }

        // 1. Fechar socket do WhatsApp
        logger.info('[SHUTDOWN] 1/2 Finalizando conexão do WhatsApp...')
        await closeBot()

        // 2. Fechar conexão do SQLite
        logger.info('[SHUTDOWN] 2/2 Fechando banco de dados SQLite...')
        closeDatabase()

        logger.info('✅ [SHUTDOWN] Todos os recursos foram liberados com sucesso. Até logo!')
    } catch (err) {
        logger.error('❌ [SHUTDOWN ERROR] Erro durante encerramento dos recursos:', err)
    } finally {
        clearTimeout(forceExitTimer)
        if (process.env.NODE_ENV !== 'test') {
            process.exit(exitCode)
        }
    }
}

/**
 * Registra os listeners de sinais do sistema operacional e exceções não tratadas
 */
function registerShutdownHandlers() {
    process.on('SIGINT', () => {
        gracefulShutdown('SIGINT', 0)
    })

    process.on('SIGTERM', () => {
        gracefulShutdown('SIGTERM', 0)
    })

    process.on('uncaughtException', (err) => {
        logger.error('💥 [FATAL] Exceção não capturada (uncaughtException):', err)
        gracefulShutdown('UNCAUGHT_EXCEPTION', 1)
    })

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('💥 [FATAL] Rejeição de Promise não tratada (unhandledRejection):', reason)
    })

    logger.info('[BOOT] Handlers de encerramento seguro (SIGINT/SIGTERM) registrados.')
}

module.exports = {
    gracefulShutdown,
    registerShutdownHandlers
}

