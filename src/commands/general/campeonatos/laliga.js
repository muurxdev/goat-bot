const futebolService = require('../../../services/futebolService')

module.exports = {
    name: 'laliga',
    aliases: ['tabelalaliga', 'espanhol', 'ligaespanhola'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Tabela inteira em tempo real de La Liga Espanhola (todos os 20 clubes)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const data = await futebolService.getStandings('laliga')
        return reply(futebolService.formatarTabela(data))
    }
}
