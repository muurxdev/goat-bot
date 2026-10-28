/**
 * Comando .socialgestos — GESTOS MAIS USADOS
 *
 * Quais gestos o grupo mais faz.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialgestos',
    aliases: ["gestosusados"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Quais gestos o grupo mais faz',
    examples: [" — mostra quais gestos o grupo mais usa"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const g = S.gestosUsados(from)
    if (!g.length) {
        return reply(F.tela({
            emoji: '📊', titulo: 'Gestos mais usados',
            intro: 'Ainda não há contagem: ninguém trocou gestos neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'Os 15 gestos mais feitos no grupo, com uma barrinha comparando cada um.'
            ] }],
            dica: 'Existem ' + Object.keys(S.GESTOS).length + ' gestos. Veja todos em ' + F.cmd(prefix, 'socialcatalogo') + '.',
            proximos: [
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' },
                { nome: 'brindar', args: '@pessoa', oque: 'fazer o primeiro gesto' }
            ],
            prefix
        }))
    }
    const maior = g[0].total || 1
    const linhas = g.slice(0, 15).map(x => {
        const info = S.GESTOS[x.gesto]
        const nome = (S.TITULOS && S.TITULOS[x.gesto]) || x.gesto
        return (info?.emoji || '•') + ' ' + nome + ' ' + '▰'.repeat(Math.max(1, Math.round(x.total / maior * 10))) + ' ' + x.total
    })
    const top = S.GESTOS[g[0].gesto]
    return reply(F.tela({
        emoji: '📊', titulo: 'Gestos mais usados',
        intro: 'O favorito do grupo é ' + (top?.emoji || '') + ' *' + ((S.TITULOS && S.TITULOS[g[0].gesto]) || g[0].gesto) + '*, com ' + g[0].total + (g[0].total === 1 ? ' vez.' : ' vezes.'),
        secoes: [{ emoji: '🎭', titulo: 'Contagem', linhas }],
        dica: 'Gestos de cuidado valem mais afinidade: veja os pesos em ' + F.cmd(prefix, 'socialpeso') + '.',
        proximos: [
            { nome: 'socialcatalogo', oque: 'ver todos os gestos' },
            { nome: 'socialresumo', oque: 'panorama do grupo' }
        ],
        prefix
    }))
    }
}
