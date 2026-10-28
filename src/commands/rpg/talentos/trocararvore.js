const talentService = require('../../../services/talentService')

module.exports = {
    name: 'trocararvore',
    category: 'rpg',
    subcategory: 'Habilidades',
    description: 'Alterna sua árvore de talentos: .trocararvore <guerreiro|mago|paladino|assassino|arqueiro>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Escolha uma classe: `.trocararvore guerreiro`, `mago`, `paladino`, `assassino` ou `arqueiro`.')
        const res = talentService.setTree(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '✨ *ÁRVORE DE TALENTOS ALTERADA COM SUCESSO!*\n\n'
        txt += `⚔️ *Nova Especialização:* \${res.treeName}\n\n`
        txt += '💡 Digite `.talentos` para conferir suas novas habilidades e alocar pontos.'
        return reply(txt.trim())
    }
}
