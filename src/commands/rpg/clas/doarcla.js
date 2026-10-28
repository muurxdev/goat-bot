const clanService = require('../../../services/clanService')

module.exports = {
    name: 'doarcla',
    aliases: [],
    category: 'rpg',
    subcategory: 'Clãs & Guildas',
    description: 'Doe moedas ao cofre do clã para aumentar o nível e poder militar: .doarcla <valor>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso: `.doarcla <valor>`\nExemplo: `.doarcla 1000`')
        const amount = parseInt(args[0], 10)
        const res = clanService.donateToVault(sender, amount)
        if (!res.success) return reply(res.message)

        let txt = '🪙 *DOAÇÃO AO COFRE DO CLÃ CONFIRMADA!*\n\n'
        txt += `🛡️ *Clã:* \${res.clanName}\n`
        txt += `💰 *Valor Doado:* \${res.donated.toLocaleString('pt-BR')} moedas (+1 XP por moeda)\n`
        txt += `🏛️ *Novo Saldo do Cofre:* \${res.newVaultCoins.toLocaleString('pt-BR')} moedas\n`
        txt += `⭐ *Nível Atual do Clã:* Nível \${res.clanLevel}\n`
        txt += `👛 *Seu Saldo Restante:* \${res.userBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
