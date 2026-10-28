/**
 * Comando .socialperfil — SEU PERFIL SOCIAL
 *
 * Quantas conexões você tem e com quem.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialperfil',
    aliases: ["meuperfilsocial"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Quantas conexões você tem e com quem',
    examples: [" — mostra quantas conexões você tem e as mais fortes"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const conexoes = S.conexoesDe(from, sender, 5)
    if (!conexoes.length) {
        return reply(F.tela({
            emoji: '🪪', titulo: 'Seu perfil social',
            intro: 'Você ainda não trocou gestos com ninguém neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'Quantas pessoas estão ligadas a você, quantos gestos trocaram e qual é o seu vínculo mais forte.'
            ] }],
            dica: 'Marque alguém num gesto, como ' + F.cmd(prefix, 'cutucar', '@pessoa') + ', e o perfil começa a se formar.',
            proximos: [
                { nome: 'cutucar', args: '@pessoa', oque: 'primeiro gesto' },
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' }
            ],
            prefix
        }), [sender])
    }
    const soma = conexoes.reduce((a, c) => a + c.total, 0)
    return reply(F.tela({
        emoji: '🪪', titulo: 'Seu perfil social',
        intro: '@' + String(sender).split('@')[0] + ', seu vínculo mais forte é *' + S.nivelDe(conexoes[0].nota) + '*.',
        secoes: [
            { emoji: '📊', titulo: 'Números', linhas: [
                F.campo('Conexões', String(conexoes.length)),
                F.campo('Gestos trocados', String(soma))
            ] },
            { emoji: '🤝', titulo: 'Suas conexões', linhas: conexoes.map(c =>
                '• @' + String(c.outro).split('@')[0] + ' — ' + c.nota + '/100 · ' + c.total + (c.total === 1 ? ' gesto' : ' gestos')) }
        ],
        dica: 'Vínculo de mão dupla pontua mais: responda os gestos que recebe.',
        proximos: [
            { nome: 'socialconexoes', oque: 'lista completa de conexões' },
            { nome: 'afinidade', args: '@pessoa', oque: 'detalhes de um vínculo' }
        ],
        prefix
    }), [sender, ...conexoes.map(c => c.outro)])
    }
}
