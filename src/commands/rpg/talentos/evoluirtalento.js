const talentService = require('../../../services/talentService')

module.exports = {
    name: 'evoluirtalento',
    category: 'rpg',
    subcategory: 'Habilidades',
    description: 'Aloca 1 ponto de talento em uma habilidade da sua classe: .evoluirtalento <id>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.evoluirtalento <id da habilidade>`\nExemplo: `.evoluirtalento golpe_pesado`\nDigite `.talentos` para consultar sua árvore.')
        const res = talentService.allocatePoint(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '⭐ *HABILIDADE APERFEIÇOADA COM SUCESSO!*\n\n'
        txt += `⚔️ *Habilidade:* \${res.skillName}\n`
        txt += `📈 *Novo Nível:* Nível \${res.newLevel} / \${res.maxLevel}\n`
        txt += `✨ *Pontos de Talento Restantes:* \${res.remainingPoints} pts\n\n`
        txt += '💡 Seus atributos de combate em raids e duelos foram fortalecidos!'
        return reply(txt.trim())
    }
}
