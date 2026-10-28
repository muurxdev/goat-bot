/**
 * Comando .figcontador — SUAS FIGURINHAS
 *
 * Quantas figurinhas você já criou.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

/** Tela de estado vazio compartilhada pelo contador. */
function vazio(prefix) {
    return F.tela({
        emoji: '🔢',
        titulo: 'Suas figurinhas',
        intro: 'Você ainda não criou nenhuma figurinha.',
        secoes: [
            { emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Quantas figurinhas você criou no total, hoje, nos últimos 7 e 30 dias e a data da primeira.'] },
            { emoji: '⌨️', titulo: 'Como criar', linhas: ['Mande ou responda a uma imagem ou vídeo curto com ' + F.cmd(prefix, 'fig') + '.'] }
        ],
        proximos: [{ nome: 'figpassoapasso', oque: 'passo a passo de uma figurinha boa' }],
        prefix
    })
}

module.exports = {
    name: 'figcontador',
    aliases: ["quantasfigurinhas"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Quantas figurinhas você já criou',
    examples: [' — mostra sua contagem'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, prefix = '.' }) => {
    const c = S.contagem(sender)
    if (!c.total) return reply(vazio(prefix))
    const hoje = S.feitasNoPeriodo(sender, 1)
    return reply(F.tela({
        emoji: '🔢',
        titulo: 'Suas figurinhas',
        intro: `Você já criou *${c.total}* figurinha(s)${hoje ? `, *${hoje}* hoje` : ''}.`,
        secoes: [{
            emoji: '📋', titulo: 'Contagem',
            linhas: [
                F.campo('Total', String(c.total)),
                F.campo('Hoje', String(hoje)),
                F.campo('Últimos 7 dias', String(S.feitasNoPeriodo(sender, 7))),
                F.campo('Últimos 30 dias', String(S.feitasNoPeriodo(sender, 30))),
                c.primeira ? F.campo('Primeira em', new Date(c.primeira).toLocaleDateString('pt-BR')) : null
            ]
        }],
        proximos: [
            { nome: 'fighistorico', oque: 'figurinhas por dia' },
            { nome: 'figestatisticas', oque: 'seu ritmo de criação' }
        ],
        prefix
    }))
    }
}
