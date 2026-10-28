/**
 * Comando .fighistorico — FIGURINHAS POR DIA
 *
 * Quantas você criou em cada dia.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

module.exports = {
    name: 'fighistorico',
    aliases: ["figurinhaspordia"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Quantas figurinhas você criou em cada um dos últimos 14 dias com registro',
    examples: [' — mostra seu histórico por dia'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, prefix = '.' }) => {
    const c = S.contagem(sender)
    const dias = Object.entries(c.porDia).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14)
    if (!dias.length) {
        return reply(F.tela({
            emoji: '📅',
            titulo: 'Figurinhas por dia',
            intro: 'Ainda não há nenhum dia registrado.',
            secoes: [
                { emoji: '📋', titulo: 'O que aparece aqui', linhas: ['Os últimos 14 dias em que você criou figurinhas, com uma barra comparando cada dia.'] },
                { emoji: '⌨️', titulo: 'Como começar', linhas: ['Mande ou responda a uma imagem com ' + F.cmd(prefix, 'fig') + '.'] }
            ],
            proximos: [{ nome: 'figcontador', oque: 'sua contagem total' }],
            prefix
        }))
    }
    const maior = Math.max(...dias.map(d => d[1]), 1)
    const linhas = dias.map(([dia, n]) => {
        const data = dia.split('-').reverse().slice(0, 2).join('/')
        return `• ${data} ${'▰'.repeat(Math.max(1, Math.round(n / maior * 10)))} *${n}*`
    })
    const melhor = dias.slice().sort((a, b) => b[1] - a[1])[0]
    return reply(F.tela({
        emoji: '📅',
        titulo: 'Figurinhas por dia',
        intro: `Seu melhor dia recente foi *${melhor[0].split('-').reverse().join('/')}*, com *${melhor[1]}*.`,
        secoes: [{ emoji: '📊', titulo: dias.length > 1 ? `Últimos ${dias.length} dias com registro` : 'Dia com registro', linhas }],
        proximos: [
            { nome: 'figestatisticas', oque: 'seu ritmo de criação' },
            { nome: 'figcontador', oque: 'sua contagem total' }
        ],
        prefix
    }))
    }
}
