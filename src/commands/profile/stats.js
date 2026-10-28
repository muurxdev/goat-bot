const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatNumber, marcar } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

module.exports = {
    name: 'stats',
    aliases: ['estatisticas', 'pvpstats'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Exibe estatísticas de combate, vitórias e derrotas',
    examples: [' — mostra suas vitórias, derrotas e taxa de vitória'],
    execute: async ({ sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const wins = user.wins || 0
        const losses = user.losses || 0
        const total = wins + losses
        const taxa = total > 0 ? ((wins / total) * 100).toFixed(1) : 0

        const intro = total > 0
            ? `${marcar(sender)}, você venceu *${formatNumber(wins)}* de *${formatNumber(total)}* combates: *${taxa}%* de vitória.`
            : `${marcar(sender)}, você ainda não lutou. Vitórias e derrotas em caçadas, duelos e arena aparecem aqui.`

        await reply(F.tela({
            emoji: '⚔️',
            titulo: 'Estatísticas de combate',
            intro,
            secoes: [{ emoji: '📊', titulo: 'Seu histórico', linhas: [
                F.campo('Vitórias', formatNumber(wins)),
                F.campo('Derrotas', formatNumber(losses)),
                F.campo('Total de combates', formatNumber(total)),
                F.campo('Taxa de vitória', total > 0 ? `${F.barra(wins / total)}` : '—')
            ] }],
            dica: total > 0
                ? 'O ranking de aproveitamento só conta quem tem pelo menos 5 combates.'
                : 'Comece por uma caçada: é a luta mais fácil e já conta aqui.',
            proximos: [
                { nome: 'hunt', oque: 'caçar um monstro' },
                { nome: 'duelo', args: '@pessoa', oque: 'desafiar alguém' },
                { nome: 'rankaproveitamento', oque: 'ver quem mais vence' }
            ],
            prefix
        }), [sender])
    }
}
