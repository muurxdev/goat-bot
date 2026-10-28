/**
 * Comando .socialduplas — DUPLAS DO GRUPO
 *
 * Os pares com maior vínculo neste grupo.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialduplas',
    aliases: ["topduplas"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Os pares com maior vínculo neste grupo',
    examples: [" — mostra as 10 duplas com vínculo mais forte"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const d = S.duplas(from, 10)
    if (!d.length) {
        return reply(F.tela({
            emoji: '👯', titulo: 'Duplas do grupo',
            intro: 'Ainda não há duplas: ninguém trocou gestos neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'Os 10 pares com mais afinidade, do mais forte ao mais fraco.',
                'A afinidade cresce quando duas pessoas trocam gestos entre si.'
            ] }],
            dica: 'Comece com um gesto simples, como ' + F.cmd(prefix, 'brindar', '@pessoa') + '.',
            proximos: [
                { nome: 'proteger', args: '@pessoa', oque: 'primeiro gesto para criar um vínculo' },
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' }
            ],
            prefix
        }))
    }
    const mencoes = []
    const linhas = d.map((p, i) => {
        mencoes.push(p.a, p.b)
        return (i + 1) + '. @' + String(p.a).split('@')[0] + ' + @' + String(p.b).split('@')[0] + '\n    ' + S.nivelDe(p.nota) + ' · ' + p.total + (p.total === 1 ? ' gesto' : ' gestos')
    })
    return reply(F.tela({
        emoji: '👯', titulo: 'Duplas do grupo',
        intro: 'Os ' + d.length + ' pares com vínculo mais forte agora.',
        secoes: [{ emoji: '🏆', titulo: 'Ranking', linhas }],
        dica: 'Gesto antigo perde valor com o tempo: para manter a dupla no topo, sigam trocando gestos.',
        proximos: [
            { nome: 'afinidade', args: '@pessoa', oque: 'ver o seu vínculo com alguém' },
            { nome: 'socialresumo', oque: 'panorama do grupo' }
        ],
        prefix
    }), mencoes)
    }
}
