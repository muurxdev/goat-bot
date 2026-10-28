const mountService = require('../../../services/mountService')

module.exports = {
    name: 'minhasmontarias',
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Exibe suas montarias e mascotes alojados no seu estábulo',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const list = mountService.getUserMounts(sender)
        if (list.length === 0) return reply('Você ainda não possui montarias. Visite o `.estabulo`!')

        let txt = '╔════════ 🐎 *MEU ESTÁBULO DE MONTARIAS* ════════╗\n\n'
        for (const m of list) {
            const eqText = m.equipped ? '⭐ *[EQUIPADA]*' : '⚪ [No estábulo]'
            txt += `🐴 *\${m.name}* (Nível \${m.level}) \${eqText}\n`
            txt += `   ├ ID da Montaria: \${m.id}\n`
            txt += `   ├ Energia / Stamina: \${m.stamina}%\n`
            txt += `   ├ Bônus de Velocidade: +\${Math.round(m.speed_bonus * 100)}%\n`
            txt += `   └ Alimentar: .alimentarmontaria ${m.id}\n\n`
        }

        txt += '💡 Equipe outra montaria com `.equiparmontaria <id>`.'
        return reply(txt.trim())
    }
}
