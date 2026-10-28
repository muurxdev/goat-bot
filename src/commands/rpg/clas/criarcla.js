const clanService = require('../../../services/clanService')

module.exports = {
    name: 'criarcla',
    aliases: [],
    category: 'rpg',
    subcategory: 'Clãs & Guildas',
    description: 'Funda um novo Clã de aventureiros no Reino: .criarcla <nome do clã>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.criarcla <nome do clã>`\nExemplo: `.criarcla Cavaleiros Central`')
        const name = args.join(' ')
        const res = clanService.createClan(sender, name)
        if (!res.success) return reply(res.message)

        let txt = '🛡️ *PARABÉNS! SEU CLÃ FOI FUNDADO COM HONRA!*\n\n'
        txt += `⚔️ *Nome do Clã:* \${res.clanName}\n`
        txt += `💰 *Custo Pago:* \${res.cost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* \${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Digite `.meucla` para abrir o painel da guilda e `.territorios` para disputar terras.'
        return reply(txt.trim())
    }
}
