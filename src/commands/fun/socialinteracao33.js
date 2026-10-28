/**
 * Comando .socialtop — MAIS SOCIÁVEIS
 *
 * Quem mais interage com o grupo.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialtop',
    aliases: ["maissociaveis"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Quem mais interage com o grupo',
    examples: [" — mostra as 10 pessoas que mais mandam gestos"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const p = S.porPessoa(from).sort((a, b) => b.enviados - a.enviados).slice(0, 10)
    if (!p.length) {
        return reply(F.tela({
            emoji: '🌟', titulo: 'Mais sociáveis',
            intro: 'Ainda não há ranking: ninguém trocou gestos neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'As 10 pessoas que mais enviam gestos, com quantas pessoas cada uma já alcançou.'
            ] }],
            dica: 'Quem fizer o primeiro gesto já entra no topo.',
            proximos: [
                { nome: 'animar', args: '@pessoa', oque: 'mandar um gesto agora' },
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' }
            ],
            prefix
        }))
    }
    const mencoes = p.map(x => x.jid)
    return reply(F.tela({
        emoji: '🌟', titulo: 'Mais sociáveis',
        intro: 'Quem mais distribui gestos no grupo.',
        secoes: [{ emoji: '🏆', titulo: 'Ranking', linhas: p.map((x, i) =>
            (i + 1) + '. @' + String(x.jid).split('@')[0] + ' — ' + x.enviados + (x.enviados === 1 ? ' gesto' : ' gestos') + ' · ' + x.parceiros + (x.parceiros === 1 ? ' pessoa' : ' pessoas')) }],
        dica: 'Veja também quem mais recebe gestos com ' + F.cmd(prefix, 'socialqueridos') + '.',
        proximos: [
            { nome: 'socialqueridos', oque: 'quem mais recebe gestos' },
            { nome: 'socialsolitarios', oque: 'quem aparece pouco' }
        ],
        prefix
    }), mencoes)
    }
}
