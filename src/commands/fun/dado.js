/**
 * Comando .dado — rola dados no formato NdM (ex.: 2d6). Sem aposta (isso é .dadoaposta).
 */
const F = require('../../utils/formato')
module.exports = {
    name: 'dado',
    aliases: ['rolar', 'roll', 'dados', 'd6', 'd20'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Rola dados no formato NdM (ex.: .dado 2d6, .dado d20, .dado)',
    usage: '[quantidade]d<faces>',
    examples: [' — rola um dado de 6 faces', '2d6 — rola dois dados de 6 faces', 'd20 — rola um dado de 20 faces'],
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.' }) => {
        let spec = (args[0] || '1d6').toLowerCase().replace(/\s/g, '')
        const m = spec.match(/^(\d*)d(\d+)$/)
        if (!m) return reply(F.tela({
            emoji: '🎲',
            titulo: 'Não entendi esse dado',
            intro: 'Escreva quantos dados e quantas faces, separados por *d*.',
            secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                '• ' + F.cmd(prefix, 'dado', '2d6') + ' — dois dados de 6 faces',
                '• ' + F.cmd(prefix, 'dado', 'd20') + ' — um dado de 20 faces',
                '• ' + F.cmd(prefix, 'dado') + ' — um dado comum de 6 faces'
            ] }],
            dica: 'Até 20 dados por vez, com no máximo 1000 faces.',
            prefix
        }))
        const n = Math.min(parseInt(m[1] || '1', 10) || 1, 20)
        const faces = Math.min(parseInt(m[2], 10), 1000)
        if (faces < 2) return reply('🎲 O dado precisa de pelo menos *2 faces*.\n\nExemplo: ' + F.cmd(prefix, 'dado', '1d6'))
        const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * faces) + 1)
        const soma = rolls.reduce((a, b) => a + b, 0)
        return reply(F.tela({
            emoji: '🎲',
            titulo: `Total: ${soma}`,
            intro: `Rolei *${n}d${faces}* (${n} ${n === 1 ? 'dado' : 'dados'} de ${faces} faces).`,
            secoes: [{ emoji: '🎯', titulo: 'Resultado', linhas: [
                F.campo('Dados', rolls.map(r => `*${r}*`).join(' + ')),
                F.campo('Total', `*${soma}*`),
                n > 1 ? F.campo('Faixa possível', `${n} a ${n * faces}`) : null
            ] }],
            dica: 'Escolha quantidade e faces: ' + F.cmd(prefix, 'dado', '3d8') + ' rola três dados de 8.',
            proximos: [
                { nome: 'dado', args: `${n}d${faces}`, oque: 'rolar de novo' },
                { nome: 'dado20', oque: 'D20 com comentário de RPG' }
            ],
            prefix
        }))
    }
}
