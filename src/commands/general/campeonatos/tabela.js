const futebolService = require('../../../services/futebolService')
const F = require('../../../utils/formato')

module.exports = {
    name: 'tabela',
    aliases: ['classificacao', 'standings'],
    category: 'general',
    subcategory: 'Futebol & Campeonatos',
    description: 'Tabela de classificação completa de qualquer campeonato mundial',
    usage: '[brasileirao | serieb | champions | premier | laliga | libertadores | italiano | alemao | frances] [grupo]',
    examples: [
        ' — tabela do Brasileirão Série A',
        'champions — tabela da UEFA Champions League',
        'libertadores — grupos da Copa Libertadores',
        'libertadores a — Grupo A da Copa Libertadores',
        'premier — tabela da Premier League Inglesa',
        'serieb — tabela do Brasileirão Série B'
    ],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const target = (args[0] || 'brasileirao').toLowerCase().trim()
        const grupo = args[1] || null
        const data = await futebolService.getStandings(target, grupo)
        if (!data.ok) {
            return reply(F.tela({
                emoji: '⚽',
                titulo: 'Campeonatos Disponíveis',
                intro: `Não encontrei a liga "${target}". Escolha uma das opções abaixo:`,
                secoes: [{
                    emoji: '🏆',
                    titulo: 'Ligas Suportadas',
                    linhas: [
                        `• \`${prefix}brasileirao\` — Brasileirão Série A`,
                        `• \`${prefix}serieb\` — Brasileirão Série B`,
                        `• \`${prefix}champions\` — UEFA Champions League`,
                        `• \`${prefix}libertadores\` — Copa Libertadores`,
                        `• \`${prefix}premier\` — Premier League`,
                        `• \`${prefix}laliga\` — La Liga Espanhola`
                    ]
                }],
                proximos: [
                    { nome: 'brasileirao', oque: 'ver classificação do Brasileirão' },
                    { nome: 'champions', oque: 'ver classificação da Champions League' },
                    { nome: 'libertadores', oque: 'ver grupos da Libertadores' }
                ],
                prefix
            }))
        }
        return reply(futebolService.formatarTabela(data, { group: grupo }))
    }
}
