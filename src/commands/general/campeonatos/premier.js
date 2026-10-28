const futebolService = require('../../../services/futebolService')

module.exports = {
    name: 'premier',
    aliases: ['premierleague', 'tabelapremier', 'ingles'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Tabela inteira em tempo real da Premier League Inglesa (todos os 20 clubes)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const data = await futebolService.getStandings('premier')
        return reply(futebolService.formatarTabela(data))
    }
}
