const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorios',
    aliases: [],
    category: 'rpg',
    subcategory: 'Guerras Territoriais',
    description: 'Lista os territórios de Reino disputados pelos clãs',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const list = clanService.getTerritories()
        let txt = '╔════════ 🏰 *TERRITÓRIOS DE REINO* ════════╗\n\n'
        txt += 'Clãs que dominam territórios recebem bônus passivos de XP e moedas.\n\n'

        for (const t of list) {
            const dono = t.clanName ? `🛡️ *\${t.clanName}*` : '⚪ *Livre / Neutro*'
            txt += `📍 *\${t.name}* (\${t.id})\n`
            txt += `   ├ Domínio: \${dono}\n`
            txt += `   ├ Bônus: +\${Math.round(t.bonusXp * 100)}% XP | +\${Math.round(t.bonusCoins * 100)}% Moedas\n`
            txt += `   └ Conquistar: .conquistar ${t.id}\n\n`
        }

        txt += '💡 Guerras de conquista exigem que o clã tenha fundos no cofre (`.doarcla`).'
        return reply(txt.trim())
    }
}
