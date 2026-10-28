const futebolService = require('../../../services/futebolService')

module.exports = {
    name: 'serieb',
    aliases: ['tabelaserieb', 'brasileiraob', 'tabelabrasileiraob'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Tabela inteira em tempo real do Brasileirão Série B (todos os 20 clubes)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const data = await futebolService.getStandings('serieb')
        return reply(futebolService.formatarTabela(data))
    }
}
