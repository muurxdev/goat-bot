const { mundos } = require('../../utils/constants')

module.exports = {
    name: 'mob',
    aliases: ['mobs', 'monstros'],
    category: 'rpg',
    description: 'Lista os monstros e loots de cada mundo (.mob lista / .mob loot)',
    execute: async ({ args, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''

        if (acao === 'lista') {
            let texto = '👾 *MOBS DISPONÍVEIS POR MUNDO*\n\n'
            Object.values(mundos).forEach(mundo => {
                texto += '🌍 *' + mundo.nome + '*\n'
                mundo.monstros.forEach(m => {
                    texto += '• ' + m.nome + ' (❤️ ' + m.hp + ' HP | ⚔️ ' + m.dano + ' Dano)\n'
                })
                texto += '\n'
            })
            return reply(texto)
        }

        if (acao === 'loot' || acao === 'loots') {
            let texto = '🎁 *TABELA DE LOOTS DOS MOBS*\n\n'
            Object.values(mundos).forEach(mundo => {
                texto += '🌍 *' + mundo.nome + '*\n'
                mundo.monstros.forEach(m => {
                    texto += '👾 *' + m.nome + ':*\n'
                    m.loot.forEach(l => {
                        texto += '  • ' + l.nome + ' (' + l.chance + '%)\n'
                    })
                })
                texto += '\n'
            })
            return reply(texto)
        }

        return reply('👾 *SISTEMA DE MOBS*\n\n• *.mob lista* — Ver todos os monstros por mundo\n• *.mob loot* — Ver a lista de drops de cada monstro\n• *.hunt* — Caçar monstros no mundo atual')
    }
}