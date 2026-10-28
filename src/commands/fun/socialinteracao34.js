/**
 * Comando .socialqueridos — MAIS QUERIDOS
 *
 * Quem mais recebe gestos no grupo.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialqueridos',
    aliases: ["maisqueridos"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Quem mais recebe gestos no grupo',
    examples: [" — mostra as 10 pessoas que mais recebem gestos"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const p = S.porPessoa(from).sort((a, b) => b.recebidos - a.recebidos).slice(0, 10)
    if (!p.length) {
        return reply(F.tela({
            emoji: '💖', titulo: 'Mais queridos',
            intro: 'Ainda não há ranking: ninguém trocou gestos neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'As 10 pessoas que mais recebem gestos dos outros membros.'
            ] }],
            dica: 'Mande um gesto para alguém querido e ela já aparece aqui.',
            proximos: [
                { nome: 'homenagear', args: '@pessoa', oque: 'prestar uma homenagem' },
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' }
            ],
            prefix
        }))
    }
    const mencoes = p.map(x => x.jid)
    return reply(F.tela({
        emoji: '💖', titulo: 'Mais queridos',
        intro: 'Quem mais recebe carinho (e provocação) do grupo.',
        secoes: [{ emoji: '🏆', titulo: 'Ranking', linhas: p.map((x, i) =>
            (i + 1) + '. @' + String(x.jid).split('@')[0] + ' — ' + x.recebidos + (x.recebidos === 1 ? ' recebido' : ' recebidos')) }],
        dica: 'Quem aparece pouco merece um gesto: veja ' + F.cmd(prefix, 'socialsolitarios') + '.',
        proximos: [
            { nome: 'socialtop', oque: 'quem mais manda gestos' },
            { nome: 'socialduplas', oque: 'duplas mais fortes' }
        ],
        prefix
    }), mencoes)
    }
}
