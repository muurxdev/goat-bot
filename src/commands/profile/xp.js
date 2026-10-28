const dataService = require('../../services/dataService')
const { getXpProgress, getXpTips } = require('../../services/xpService')
const { getCargo, getRank } = require('../../utils/helpers')
const { formatNumber, marcar } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

module.exports = {
    name: 'xp',
    aliases: ['level', 'nivel', 'meuxp'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Mostra seu nível, quanto falta para o próximo e como ganhar mais XP',
    cooldownMs: 2000,
    usage: '[@pessoa]',
    examples: [' — seu próprio progresso', '@pessoa — o progresso de outra pessoa'],
    execute: async ({ info, sender, reply, prefix = '.' }) => {
        const alvo = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        const perfil = dataService.getUser(alvo) || dataService.initializeUser(alvo, {})
        const prog = getXpProgress(perfil)
        const nivel = perfil.level || 1

        const proprio = alvo === sender
        const doc = F.tela({
            emoji: '⭐',
            titulo: `Progresso de ${marcar(alvo)}`,
            intro: `Nível *${formatNumber(nivel)}* · faltam *${formatNumber(prog.faltam)} XP* para o nível ${formatNumber(nivel + 1)}.\n${prog.barra} ${prog.percent}%`,
            secoes: [
                { emoji: '🎖️', titulo: 'Posição', linhas: [
                    F.campo('Rank', getRank(nivel)),
                    F.campo('Patente', getCargo(nivel)),
                    F.campo('Poder', prog.poder),
                    F.campo('Vida máxima', `${formatNumber(perfil.hpMax || 100)} HP`)
                ] },
                { emoji: '📈', titulo: `Rumo ao nível ${formatNumber(nivel + 1)}`, linhas: [
                    F.campo('XP neste nível', `${formatNumber(prog.atual)} / ${formatNumber(prog.necessario)}`),
                    F.campo('Faltam', `${formatNumber(prog.faltam)} XP`)
                ] },
                { emoji: '🧭', titulo: 'De onde veio o XP', linhas: [
                    F.campo('Nos grupos', formatNumber(perfil.xpGroup || 0)),
                    F.campo('Na conversa privada', formatNumber(perfil.xpPv || 0)),
                    F.campo('Esta semana', formatNumber(perfil.weeklyXp || 0))
                ] },
                { emoji: '🚀', titulo: 'Como ganhar mais', linhas: getXpTips(prefix) }
            ],
            dica: proprio ? 'Marque alguém para ver o progresso da pessoa.' : '',
            proximos: [
                { nome: 'dossie', oque: 'perfil completo' },
                { nome: 'rank', oque: 'ranking do grupo' }
            ],
            prefix
        })

        await reply(doc, [alvo])
    }
}
