const dataService = require('../../services/dataService')
const { getCargo } = require('../../utils/helpers')
const { formatNumber } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

module.exports = {
    name: 'ranksemana',
    aliases: ['topsemana', 'semanal'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Exibe o top 10 usuários com maior XP acumulado na semana',
    examples: [' — mostra quem mais ganhou XP nesta semana'],
    execute: async ({ reply, prefix = '.' }) => {
        const ranking = dataService.userRepo.getTopWeekly(10)

        if (ranking.length === 0) {
            return reply(F.tela({
                emoji: '📅',
                titulo: 'Top da semana',
                intro: 'Ninguém ganhou XP nesta semana ainda. Quando ganharem, esta lista mostra os 10 que mais acumularam, com nível e patente.',
                secoes: [{ emoji: '🎯', titulo: 'Como entrar na lista', linhas: [
                    `• ${F.cmd(prefix, 'daily')} — pegar os 50 XP do dia`,
                    `• ${F.cmd(prefix, 'hunt')} — caçar monstros por XP`
                ] }],
                dica: 'O XP semanal zera toda semana: é a melhor chance de quem começou agora aparecer no topo.',
                proximos: [
                    { nome: 'rankxpsemanal', oque: 'ver o XP da semana só deste grupo' },
                    { nome: 'rank', oque: 'ver o seu nível' }
                ],
                prefix
            }))
        }

        const mentions = []
        const linhas = ranking.map((user, i) => {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`
            mentions.push(user[0])
            return `${medalha} @${user[0].split('@')[0]} — *${formatNumber(user[1].weeklyXp || 0)} XP* · Nv. ${formatNumber(user[1].level)} · ${getCargo(user[1].level)}`
        })

        await reply(F.tela({
            emoji: '📅',
            titulo: 'Top da semana',
            intro: `Os ${formatNumber(ranking.length)} que mais ganharam XP nesta semana.`,
            secoes: [{ emoji: '🏅', titulo: 'Pódio', linhas }],
            dica: 'O XP semanal zera toda semana: quem começou agora também pode chegar ao topo.',
            proximos: [
                { nome: 'daily', oque: 'pegar a recompensa diária' },
                { nome: 'hunt', oque: 'caçar por XP' }
            ],
            prefix
        }), mentions)
    }
}
