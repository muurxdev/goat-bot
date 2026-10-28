/**
 * Comando .socialresumo — RESUMO SOCIAL
 *
 * Panorama dos vínculos do grupo.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialresumo',
    aliases: ["resumosocial"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Panorama dos vínculos do grupo',
    examples: [" — mostra o panorama dos vínculos do grupo"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const v = S.vinculos(from)
    const pares = Object.values(v)
    if (!pares.length) {
        return reply(F.tela({
            emoji: '📋', titulo: 'Resumo social',
            intro: 'Ainda não há vínculos: ninguém trocou gestos neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'Quantos pares têm vínculo, quantas pessoas participam, total de gestos e a dupla mais forte.'
            ] }],
            dica: 'Todo gesto marcando alguém entra na conta. Comece com ' + F.cmd(prefix, 'cutucar', '@pessoa') + '.',
            proximos: [
                { nome: 'socialajuda', oque: 'guia dos comandos sociais' },
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' }
            ],
            prefix
        }))
    }
    const totalGestos = pares.reduce((a, p) => a + (p.total || 0), 0)
    const pessoas = S.porPessoa(from).length
    const forte = S.duplas(from, 1)[0]
    const mencoes = forte ? [forte.a, forte.b] : []
    return reply(F.tela({
        emoji: '📋', titulo: 'Resumo social',
        intro: totalGestos + ' gestos trocados entre ' + pessoas + ' pessoas.',
        secoes: [
            { emoji: '📊', titulo: 'Números', linhas: [
                F.campo('Pares com vínculo', String(pares.length)),
                F.campo('Pessoas envolvidas', String(pessoas)),
                F.campo('Gestos trocados', String(totalGestos)),
                F.campo('Média por par', (totalGestos / pares.length).toFixed(1))
            ] },
            forte ? { emoji: '💞', titulo: 'Dupla mais forte', linhas: [
                '@' + String(forte.a).split('@')[0] + ' + @' + String(forte.b).split('@')[0],
                S.nivelDe(forte.nota) + ' · ' + forte.total + (forte.total === 1 ? ' gesto' : ' gestos')
            ] } : null
        ],
        proximos: [
            { nome: 'socialduplas', oque: 'ranking de duplas' },
            { nome: 'socialtop', oque: 'quem mais interage' }
        ],
        prefix
    }), mencoes)
    }
}
