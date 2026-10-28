const economyService = require('../../../services/economyService')

module.exports = {
    name: 'masmorra_floresta_fadas_tatica_guerra',
    category: 'rpg',
    subcategory: 'Masmorras & Covis',
    description: 'Incursão solo a uma masmorra infestada de monstros em floresta_fadas',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const xp = Math.floor(Math.random() * 400 + 200)
        const loot = Math.floor(Math.random() * 250 + 150)
        user.xp = (user.xp || 0) + xp
        user.coins = (user.coins || 0) + loot
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🏰 *INCURSÃO NA MASMORRA FINALIZADA!*\n\n'
        txt += '📍 *Masmorra:* Catacumbas de FLORESTA_FADAS\n'
        txt += '👹 *Monstro Derrotado:* Guardião das Trevas de TATICA GUERRA\n'
        txt += `⚡ *Recompensa:* +\${xp} XP | +\${loot} moedas\n`
        txt += `👛 *Saldo Atual:* \${user.coins.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
