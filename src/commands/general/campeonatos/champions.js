const futebolService = require('../../../services/futebolService')

module.exports = {
    name: 'champions',
    aliases: ['championsleague', 'tabelachampions', 'ucl'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Classificação completa em tempo real da UEFA Champions League (Fase de Liga de 36 clubes)',
    usage: '[8 | 24 | completo]',
    examples: [
        ' — classificação completa dos 36 clubes na fase de liga',
        '8 — exibe os 8 primeiros colocados (vagas diretas nas Oitavas)',
        '24 — exibe a zona dos playoffs (16-avos)'
    ],
    cooldownMs: 2000,
    execute: async ({ reply, args = [] }) => {
        const limite = args[0] ? parseInt(args[0], 10) : null
        const data = await futebolService.getStandings('champions')
        return reply(futebolService.formatarTabela(data, { limit: isNaN(limite) ? null : limite }))
    }
}
