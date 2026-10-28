/**
 * Comando .figestatisticas — NÚMEROS DAS FIGURINHAS
 *
 * Seu ritmo de criação de figurinhas.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

module.exports = {
    name: 'figestatisticas',
    aliases: ["numerosfigurinha"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Seu ritmo de criação de figurinhas: médias e melhor dia',
    examples: [' — mostra seus números'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, prefix = '.' }) => {
    const c = S.contagem(sender)
    if (!c.total) {
        return reply(F.tela({
            emoji: '📊',
            titulo: 'Números das figurinhas',
            intro: 'Você ainda não criou nenhuma figurinha.',
            secoes: [
                { emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Total, dias com criação, média por dia, seu melhor dia e a média desde a primeira figurinha.'] },
                { emoji: '⌨️', titulo: 'Como começar', linhas: ['Mande ou responda a uma imagem ou vídeo curto com ' + F.cmd(prefix, 'fig') + '.'] }
            ],
            proximos: [{ nome: 'figdicas', oque: 'como fazer uma figurinha boa' }],
            prefix
        }))
    }
    const dias = Object.keys(c.porDia).length || 1
    const valores = Object.values(c.porDia)
    const linhas = [
        F.campo('Total', String(c.total)),
        F.campo('Dias com criação', String(dias)),
        F.campo('Média por dia ativo', (valores.reduce((a, b) => a + b, 0) / dias).toFixed(1)),
        F.campo('Melhor dia', String(Math.max(...valores, 0)))
    ]
    if (c.primeira) {
        const diasTotais = Math.max(1, Math.floor((Date.now() - c.primeira) / 86400000))
        linhas.push(F.campo('Desde a primeira', diasTotais + ' dias'))
        linhas.push(F.campo('Média geral', (c.total / diasTotais).toFixed(2) + ' por dia'))
    }
    return reply(F.tela({
        emoji: '📊',
        titulo: 'Números das figurinhas',
        intro: `*${c.total}* figurinha(s) em *${dias}* dia(s) de criação.`,
        secoes: [{ emoji: '📋', titulo: 'Seus números', linhas }],
        proximos: [
            { nome: 'fighistorico', oque: 'figurinhas por dia' },
            { nome: 'packver', oque: 'seu pacote' }
        ],
        prefix
    }))
    }
}
