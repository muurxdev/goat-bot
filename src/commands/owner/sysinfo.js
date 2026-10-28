const securityService = require('../../services/securityService')

module.exports = {
    name: 'sysinfo',
    aliases: ['servidor', 'hostinfo', 'hardware'],
    category: 'owner',
    description: 'Exibe métricas detalhadas de hardware e uso de recursos',
    ownerOnly: true,
    execute: async ({ reply }) => {
        const m = securityService.getSystemMetrics()

        const info = `🖥️ *INFORMAÇÕES DETALHADAS DO SISTEMA*

⏱️ *Uptime:* ${m.uptime}
🧠 *Versão do motor:* ${m.nodeVersion}
⚙️ *Ambiente:* ${m.platform}
⚡ *CPUs:* ${m.cpus} núcleos

💾 *MEMÓRIA RAM:*
• *Processo (RSS):* ${m.ramUsedMb} MB
• *Heap Alocado:* ${m.heapUsedMb} MB
• *RAM Livre:* ${m.freeMemMb} MB / ${m.totalMemMb} MB

🛡️ *Segurança:*
• *Modo Manutenção:* ${securityService.isMaintenanceActive() ? 'Ativo 🔴' : 'Inativo 🟢'}
• *Usuários na Blacklist:* ${securityService.getBannedUsers().length}`

        await reply(info)
    }
}

