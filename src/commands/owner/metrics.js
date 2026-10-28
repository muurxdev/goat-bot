/**
 * Comando .metrics
 * Exibe telemetria em tempo real, throughput de comandos, latência média e taxa de sucesso
 */

const { getMetricsSummary } = require('../../services/telemetryService')
const { ROLES } = require('../../services/permissionService')

module.exports = {
    name: 'metrics',
    aliases: ['telemetry'],
    category: 'owner',
    minRole: ROLES.BOT_ADMIN,
    description: 'Exibe métricas de execução de comandos, latência média e taxa de sucesso',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const summary = getMetricsSummary()

        let msg = `📊 *TELEMETRIA & MÉTRICAS OPERACIONAIS*\n\n`
        msg += `⚡ *Total de Execuções:* ${summary.totalExecutions}\n`
        msg += `✅ *Sucessos:* ${summary.successfulExecutions}\n`
        msg += `❌ *Falhas:* ${summary.failedExecutions}\n`
        msg += `📈 *Taxa de Sucesso:* ${summary.successRatePercent}%\n`
        msg += `⏱️ *Latência Média Global:* ${summary.overallAvgLatencyMs}ms\n`
        msg += `🕒 *Tempo de Rastreamento:* ${summary.uptimeSeconds}s\n`
        msg += `📂 *Comandos Distintos Usados:* ${summary.uniqueCommandsExecuted}\n\n`

        if (summary.topCommands.length > 0) {
            msg += `🏆 *Top 5 Comandos Mais Populares:*\n`
            summary.topCommands.forEach((c, idx) => {
                msg += `${idx + 1}. \`.${c.name}\` — ${c.count}x (${c.avgLatencyMs}ms méd, ${c.errors} erros)\n`
            })
        }

        await reply(msg.trim())
    }
}

