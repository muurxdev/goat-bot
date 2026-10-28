/**
 * Comando .constantegravidade — GRAVIDADE NA SUPERFÍCIE DA TERRA
 *
 * Constante física: Gravidade na superfície da Terra.
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
    name: 'constantegravidade',
    aliases: ["valorgravidade"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Constante física: Gravidade na superfície da Terra',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = K.CONSTANTES['gravidade']
    let doc = cab(c.nome.toUpperCase(), '🔬')
    doc += linha('Símbolo', c.simbolo)
    doc += linha('Valor', c.valor)
    doc += '\n_' + c.nota + '_'
    return reply(doc)
    }
}
