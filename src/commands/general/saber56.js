/**
 * Comando .elementoli — LÍTIO (Li)
 *
 * Elemento químico: Lítio (Li).
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
    name: 'elementoli',
    aliases: ["quimicalitio"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Elemento químico: Lítio (Li)',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = K.ELEMENTOS['li']
    let doc = cab(e.nome.toUpperCase() + ' (' + e.simbolo + ')', '⚗️')
    doc += linha('Número atômico', String(e.z))
    doc += linha('Símbolo', e.simbolo)
    doc += linha('Massa atômica', String(e.massa))
    doc += linha('Categoria', e.categoria)
    doc += linha('Estado a 25 °C', e.estado)
    doc += sep()
    doc += '💡 _' + e.curiosidade + '_'
    return reply(doc)
    }
}
