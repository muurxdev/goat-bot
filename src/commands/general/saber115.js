/**
 * Comando .paiseseuropaeasia — PAÍSES: EUROPA E ÁSIA
 *
 * Países de Europa e Ásia no catálogo.
 */

const K = require('../../services/knowledgeService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }

module.exports = {
    name: 'paiseseuropaeasia',
    aliases: ["continenteeuropaeasia"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Lista os países entre a Europa e a Ásia com capital e população',
    examples: [' — lista os países da região com capital e população'],
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const F = require('../../utils/formato')
    const lista = K.porContinente("Europa e Ásia")
    if (!lista.length) {
        return reply(F.tela({
            emoji: '🗺️', titulo: 'Países: Europa e Ásia',
            intro: 'Ainda não tenho países dessa região no catálogo.',
            proximos: [{ nome: 'paises', oque: 'ver todos os países do catálogo' }],
            prefix
        }))
    }
    const num = (v) => Number(v || 0).toLocaleString('pt-BR')
    return reply(F.tela({
        emoji: '🗺️',
        titulo: 'Países: Europa e Ásia',
        intro: `Tenho *${lista.length}* país(es) dessa região no catálogo, do mais populoso para o menos.`,
        secoes: lista.map(p => ({
            emoji: '📍',
            titulo: p.nome,
            linhas: [
                F.campo('Capital', p.capital),
                F.campo('População', `${num(p.pop)} milhões`),
                F.campo('Idioma', p.idioma)
            ]
        })),
        dica: 'Cada país tem uma ficha completa, com moeda e área.',
        proximos: [
            ...lista.slice(0, 2).map(p => ({ nome: 'pais' + p.chave, oque: 'ficha completa de ' + p.nome })),
            { nome: 'paises', oque: 'ver todos os países do catálogo' }
        ],
        prefix
    }))
    }
}
