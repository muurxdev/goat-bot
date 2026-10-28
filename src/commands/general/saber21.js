/**
 * Comando .paisirlanda — IRLANDA
 *
 * Ficha do país: Irlanda.
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
    name: 'paisirlanda',
    aliases: ["sobreirlanda"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Ficha do país: Irlanda',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = K.PAISES['irlanda']
    let doc = cab(p.nome.toUpperCase(), '🌎')
    doc += linha('Capital', p.capital)
    doc += linha('Continente', p.continente)
    doc += linha('Idioma', p.idioma)
    doc += linha('Moeda', p.moeda)
    doc += linha('Área', num(p.area) + ' km²')
    doc += linha('População', '~' + num(p.pop) + ' milhões')
    doc += linha('Código', p.iso)
    doc += '\n_População é aproximada e muda todo ano; o resto é estável._'
    return reply(doc)
    }
}
