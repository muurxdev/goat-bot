const futebolService = require('../../../services/futebolService')

module.exports = {
    name: 'brasileirao',
    aliases: ['seriea', 'tabelabrasileirao', 'tabelaseriea', 'brasileiraoa'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Tabela inteira em tempo real do Brasileirão Série A (todos os 20 clubes)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const data = await futebolService.getStandings('brasileirao')
        return reply(futebolService.formatarTabela(data))
    }
}
