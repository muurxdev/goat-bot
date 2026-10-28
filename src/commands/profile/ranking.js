const dataService = require('../../services/dataService')
const { getCargo } = require('../../utils/helpers')
const { formatNumber, moedas } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

const MODOS = {
    nivel: { emoji: '👑', titulo: 'Top 10 por nível' },
    coins: { emoji: '💰', titulo: 'Top 10 por moedas' },
    mensagens: { emoji: '💬', titulo: 'Top 10 por mensagens' }
}

module.exports = {
    name: 'ranking',
    aliases: ['top10'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Ranking geral: top 10 por nível, moedas ou mensagens',
    usage: '[coins | mensagens]',
    examples: [
        ' — top 10 por nível',
        'coins — top 10 mais ricos',
        'mensagens — top 10 que mais conversam'
    ],
    cooldownMs: 10000,
    execute: async ({ args, reply, prefix = '.' }) => {
        const modoArg = (args[0] || '').toLowerCase()
        const modo = modoArg === 'coins' ? 'coins' : (modoArg === 'messages' || modoArg === 'mensagens') ? 'mensagens' : 'nivel'
        const { emoji, titulo } = MODOS[modo]

        let ranking
        if (modo === 'coins') {
            ranking = dataService.userRepo.getTopCoins(10)
        } else if (modo === 'mensagens') {
            ranking = dataService.userRepo.getTopRank(10)
            ranking = ranking.sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0)).slice(0, 10)
        } else {
            ranking = dataService.userRepo.getTopRank(10)
        }

        const outros = Object.keys(MODOS).filter(m => m !== modo)
            .map(m => ({ nome: 'ranking', args: m === 'nivel' ? '' : m, oque: `ver o ${MODOS[m].titulo.toLowerCase()}` }))

        if (!ranking || ranking.length === 0) {
            return reply(F.tela({
                emoji,
                titulo,
                intro: 'Ainda não há jogadores no ranking. Quando houver, esta lista mostra os 10 primeiros com nível, moedas ou mensagens de cada um.',
                secoes: [{ emoji: '🎯', titulo: 'Como entrar na lista', linhas: [
                    `• ${F.cmd(prefix, 'daily')} — pegar XP e moedas do dia`,
                    `• ${F.cmd(prefix, 'hunt')} — caçar monstros e subir de nível`
                ] }],
                proximos: outros,
                prefix
            }))
        }

        const mentions = []
        const linhas = []
        ranking.forEach(([jid, u], i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`
            mentions.push(jid)
            const nome = u.name || u.displayNick || u.display_nick || '@' + jid.split('@')[0]
            if (modo === 'coins') {
                linhas.push(`${medal} *${nome}* — ${moedas(u.coins || 0)} · Nv. ${formatNumber(u.level || 1)}`)
            } else if (modo === 'mensagens') {
                linhas.push(`${medal} *${nome}* — ${formatNumber(u.messages || 0)} mensagens · Nv. ${formatNumber(u.level || 1)}`)
            } else {
                linhas.push(`${medal} *${nome}* — Nv. ${formatNumber(u.level || 1)} · ${formatNumber(u.xp || 0)} XP · ${getCargo(u.level || 1)}`)
            }
        })

        await reply(F.tela({
            emoji,
            titulo,
            intro: `Os ${formatNumber(ranking.length)} primeiros de todos os grupos.`,
            secoes: [{ emoji: '🏅', titulo: 'Pódio', linhas }],
            dica: 'Rankings deste grupo ficam em .rankxp, .rankcoins e .rankmsgs.',
            proximos: outros,
            prefix
        }), mentions)
    }
}
