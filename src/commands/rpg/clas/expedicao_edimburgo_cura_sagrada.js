const economyService = require('../../../services/economyService')

module.exports = {
    name: 'expedicao_edimburgo_cura_sagrada',
    aliases: [],
    category: 'rpg',
    subcategory: 'Expedições de Caça',
    description: 'Expedição de caça com foco em cura sagrada nos arredores de edimburgo',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const earnedXp = Math.floor(Math.random() * 350 + 150)
        const earnedCoins = Math.floor(Math.random() * 200 + 100)

        user.xp = (user.xp || 0) + earnedXp
        user.coins = (user.coins || 0) + earnedCoins
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🌲 *EXPEDIÇÃO DE CAÇA CONCLUÍDA!*\n\n'
        txt += '📍 *Região Explorada:* EDIMBURGO\n'
        txt += '⚔️ *Técnica Empregada:* CURA SAGRADA\n'
        txt += `⚡ *XP Adquirido:* +\${earnedXp} XP\n`
        txt += `💰 *Moedas Coletadas:* +\${earnedCoins} moedas\n`
        txt += `👛 *Saldo Atual:* \${user.coins.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
