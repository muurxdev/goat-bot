/**
 * Comando .doctor
 * Relatório de integridade do registro de comandos (colisões, aliases mortos,
 * conflitos e chaves desconhecidas). Espelha o validador de boot, sob demanda.
 */

const dispatcher = require('../../handlers/commandDispatcher')

module.exports = {
    name: 'doctor',
    aliases: ['cmddoctor', 'healthcmd'],
    category: 'owner',
    description: 'Relatório de integridade do registro de comandos (colisões e aliases)',
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        const report = dispatcher.getValidationReport()
        if (!report) {
            return reply('⚠️ Relatório de validação indisponível (recarregue os comandos).')
        }

        let doc = '╔══════════════════════════════╗\n'
        doc += '║   🩺 *DOCTOR — INTEGRIDADE* 🩺   ║\n'
        doc += '╚══════════════════════════════╝\n\n'

        doc += `📊 *Comandos:* ${dispatcher.getCommands().size} | *Aliases:* ${dispatcher.getAliases().size}\n`
        doc += `❌ *Erros:* ${report.errors.length} | ⚠️ *Avisos:* ${report.warnings.length}\n\n`

        doc += '╭━〔 📋 RESUMO 〕━⬣\n'
        doc += `┃ 🔁 Nomes duplicados: ${report.duplicateNames.length}\n`
        doc += `┃ 💀 Aliases mortos: ${report.aliasShadowedByName.length}\n`
        doc += `┃ ⚔️ Aliases em conflito: ${report.aliasConflicts.length}\n`
        doc += `┃ ❓ Chaves desconhecidas: ${report.unknownKeys.length}\n`
        doc += `┃ 🚫 Campos ausentes: ${report.missingFields.length}\n`
        doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'

        if (report.duplicateNames.length) {
            doc += '\n╭━〔 🔁 NOMES DUPLICADOS 〕━⬣\n'
            report.duplicateNames.slice(0, 10).forEach(d => {
                doc += `┃ '${d.name}': ${d.duplicate} vs ${d.kept}\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
        }

        if (report.unknownKeys.length) {
            doc += '\n╭━〔 ❓ CHAVES DESCONHECIDAS 〕━⬣\n'
            report.unknownKeys.slice(0, 15).forEach(u => {
                doc += `┃ ${u.name}: '${u.key}'\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
        }

        if (report.errors.length === 0 && report.warnings.length === 0) {
            doc += '\n✅ *Registro 100% limpo.*'
        }

        return reply(doc.trim())
    }
}
