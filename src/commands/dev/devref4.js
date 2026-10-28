/**
 * Comando .biglinearitmica — O(n log n), complexidade linearítmica.
 *
 * Os dados vêm de services/devReferenceService.js; aqui só a apresentação.
 */

const R = require('../../services/devReferenceService')
const F = require('../../utils/formato')

module.exports = {
    name: 'biglinearitmica',
    aliases: ["complexidadelinearitmica","cmd_biglinearitmica","alt_biglinearitmica","atalho_biglinearitmica","abrev_biglinearitmica","call_biglinearitmica","func_biglinearitmica"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Explica a complexidade O(n log n), a das boas ordenações',
    examples: [' — explica O(n log n) com exemplo'],
    cooldownMs: 2500,
    execute: async ({ reply, prefix = '.' }) => {
    const c = R.COMPLEXIDADES['linearitmica']
    return reply(F.tela({
        emoji: '📈',
        titulo: `${c.notacao} — ${c.nome}`,
        intro: c.significado,
        secoes: [{
            emoji: '📋', titulo: 'Na prática',
            linhas: [
                F.campo('Exemplo', c.exemplo),
                F.campo('Com 1 milhão de itens', c.em1milhao),
                F.campo('Posição', 'entre O(n) e O(n²)')
            ]
        }],
        dica: 'Se você precisa ordenar, use a ordenação pronta da linguagem: ela já é O(n log n).',
        proximos: [
            { nome: 'biglinear', oque: 'O(n), a anterior' },
            { nome: 'bigquadratica', oque: 'O(n²), a próxima' },
            { nome: 'refcomplexidades', oque: 'todas, da melhor para a pior' }
        ],
        prefix
    }))
    }
}
