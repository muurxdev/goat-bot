/**
 * Comando .biglogaritmica — O(log n), complexidade logarítmica.
 *
 * Os dados vêm de services/devReferenceService.js; aqui só a apresentação.
 */

const R = require('../../services/devReferenceService')
const F = require('../../utils/formato')

module.exports = {
    name: 'biglogaritmica',
    aliases: ["complexidadelogaritmica","cmd_biglogaritmica","alt_biglogaritmica","atalho_biglogaritmica","abrev_biglogaritmica","call_biglogaritmica","func_biglogaritmica"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Explica a complexidade O(log n), que cresce bem devagar com a entrada',
    examples: [' — explica O(log n) com exemplo'],
    cooldownMs: 2500,
    execute: async ({ reply, prefix = '.' }) => {
    const c = R.COMPLEXIDADES['logaritmica']
    return reply(F.tela({
        emoji: '📈',
        titulo: `${c.notacao} — ${c.nome}`,
        intro: c.significado,
        secoes: [{
            emoji: '📋', titulo: 'Na prática',
            linhas: [
                F.campo('Exemplo', c.exemplo),
                F.campo('Com 1 milhão de itens', c.em1milhao),
                F.campo('Posição', 'segunda melhor, logo depois de O(1)')
            ]
        }],
        dica: 'Sempre que um algoritmo corta o problema pela metade a cada passo, ele é logarítmico.',
        proximos: [
            { nome: 'bigconstante', oque: 'O(1), a melhor' },
            { nome: 'biglinear', oque: 'O(n), a próxima' },
            { nome: 'refcomplexidades', oque: 'todas, da melhor para a pior' }
        ],
        prefix
    }))
    }
}
