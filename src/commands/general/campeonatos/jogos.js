const futebolService = require('../../../services/futebolService')

module.exports = {
    name: 'jogos',
    aliases: ['jogosdehoje', 'placar', 'placaraovivo', 'partidas'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Jogos do dia, placares ao vivo e rodada dos campeonatos',
    usage: '[brasileirao | champions | libertadores | premier | laliga | serieb]',
    examples: [
        ' — partidas do Brasileirão',
        'champions — jogos e placar da UEFA Champions League',
        'libertadores — jogos da Copa Libertadores',
        'premier — jogos da Premier League'
    ],
    cooldownMs: 2000,
    execute: async ({ reply, args = [] }) => {
        const target = (args[0] || 'brasileirao').toLowerCase().trim()
        const data = await futebolService.getScoreboard(target)
        return reply(futebolService.formatarJogos(data, target))
    }
}
