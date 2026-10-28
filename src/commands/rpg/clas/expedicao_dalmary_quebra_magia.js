const economyService = require('../../../services/economyService')

module.exports = {
    name: 'expedicao_dalmary_quebra_magia',
    aliases: [],
    category: 'rpg',
    subcategory: 'Expedições de Caça',
    description: 'Expedição de caça com foco em quebra magia nos arredores de dalmary',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const earnedXp = Math.floor(Math.random() * 350 + 150)
        const earnedCoins = Math.floor(Math.random() * 200 + 100)

        user.xp = (user.xp || 0) + earnedXp
        user.coins = (user.coins || 0) + earnedCoins
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🌲 *EXPEDIÇÃO DE CAÇA CONCLUÍDA!*\n\n'
        txt += '📍 *Região Explorada:* DALMARY\n'
        txt += '⚔️ *Técnica Empregada:* QUEBRA MAGIA\n'
        txt += `⚡ *XP Adquirido:* +\${earnedXp} XP\n`
        txt += `💰 *Moedas Coletadas:* +\${earnedCoins} moedas\n`
        txt += `👛 *Saldo Atual:* \${user.coins.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
