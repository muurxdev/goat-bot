/**
 * Comando .saberajuda — GUIA DO CONHECIMENTO
 *
 * Todos os catálogos de conhecimento.
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
    name: 'saberajuda',
    aliases: ["guiaconhecimento"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Todos os catálogos de conhecimento',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('GUIA DO CONHECIMENTO', '🗺️')
    doc += linha('Países', String(Object.keys(K.PAISES).length))
    doc += linha('Elementos', String(Object.keys(K.ELEMENTOS).length))
    doc += linha('Constantes', String(Object.keys(K.CONSTANTES).length))
    doc += linha('Sistemas do corpo', String(Object.keys(K.CORPO).length))
    doc += '\n' + bloco('🌍 GEOGRAFIA', [
        '`' + prefix + 'paises` · `' + prefix + 'capitais`',
        '`' + prefix + 'maiorespaises` · `' + prefix + 'paisespopulosos`',
        '`' + prefix + 'moedasmundo` · `' + prefix + 'idiomasmundo`'
    ])
    doc += '\n' + bloco('⚗️ CIÊNCIA', [
        '`' + prefix + 'tabelaperiodica` · `' + prefix + 'elementospor`',
        '`' + prefix + 'constantes` · `' + prefix + 'corpohumano`'
    ])
    doc += '\n' + bloco('🔎 CONSULTA', [
        '`' + prefix + 'saberbuscar <termo>` · `' + prefix + 'compararpaises a b`'
    ])
    return reply(doc)
    }
}
