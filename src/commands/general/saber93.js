/**
 * Comando .constanteluz — VELOCIDADE DA LUZ NO VÁCUO
 *
 * Constante física: Velocidade da luz no vácuo.
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
    name: 'constanteluz',
    aliases: ["valorluz"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Mostra o valor da velocidade da luz no vácuo',
    examples: [' — mostra o valor e o símbolo'],
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const F = require('../../utils/formato')
    const c = K.CONSTANTES['luz']
    const outras = Object.keys(K.CONSTANTES).filter(x => x !== 'luz')
    const sorteadas = outras.sort(() => Math.random() - 0.5).slice(0, 2)
    return reply(F.tela({
        emoji: '🔬',
        titulo: c.nome,
        intro: `*${c.valor}*`,
        secoes: [{ emoji: '📋', titulo: 'Ficha', linhas: [
            F.campo('Símbolo', c.simbolo),
            F.campo('Valor', c.valor)
        ] }],
        dica: c.nota,
        proximos: [
            { nome: 'constantes', oque: 'ver todas as constantes do catálogo' },
            ...sorteadas.map(x => ({ nome: 'constante' + x, oque: K.CONSTANTES[x].nome }))
        ],
        prefix
    }))
    }
}
