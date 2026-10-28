const clanService = require('../../../services/clanService')

module.exports = {
    name: 'conquistar',
    aliases: [],
    category: 'rpg',
    subcategory: 'Guerras Territoriais',
    description: 'Ordena ataque de conquista a um território de Reino: .conquistar <id>',
    cooldownMs: 4000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.conquistar <id do território>`\nConsulte os IDs com `.territorios`.')
        const res = clanService.captureTerritory(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '⚔️ *VITÓRIA NA GUERRA DE CONQUISTA!*\n\n'
        txt += `🏰 *Território Ocupado:* \${res.territoryName}\n`
        txt += `🛡️ *Novo Senhor Feudal:* Clã \${res.clanName}\n`
        txt += `⚡ *Bônus Ativo para o Clã:* +\${res.bonusXp}% XP e +\${res.bonusCoins}% Moedas\n\n`
        txt += '💡 O brasão do seu clã agora tremula nas muralhas da fortaleza!'
        return reply(txt.trim())
    }
}
