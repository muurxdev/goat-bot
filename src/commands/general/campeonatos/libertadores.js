const futebolService = require('../../../services/futebolService')

module.exports = {
    name: 'libertadores',
    aliases: ['tabelalibertadores', 'copalibertadores'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Classificação completa e grupos da Copa Libertadores da América',
    usage: '[a | b | c | d | e | f | g | h]',
    examples: [
        ' — classificação completa de todos os 8 grupos',
        'a — exibe apenas a classificação do Grupo A',
        'b — exibe apenas a classificação do Grupo B'
    ],
    cooldownMs: 2000,
    execute: async ({ reply, args = [] }) => {
        const grupo = args[0] || null
        const data = await futebolService.getStandings('libertadores', grupo)
        return reply(futebolService.formatarTabela(data, { group: grupo }))
    }
}
