/**
 * Comando .saberbuscar — BUSCAR NO CONHECIMENTO
 *
 * Procura em países, elementos, constantes e corpo.
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
    name: 'saberbuscar',
    aliases: ["buscarconhecimento"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Procura em países, elementos, constantes e corpo',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ').trim()
    if (!termo) return reply('🔎 📌 Uso: `' + prefix + 'saberbuscar ouro`')
    const achados = K.procurar(termo)
    let doc = cab('BUSCAR NO CONHECIMENTO', '🔎')
    doc += linha('Termo', termo)
    doc += linha('Encontrados', String(achados.length)) + '\n'
    if (!achados.length) return reply(doc + '_Nada encontrado nos catálogos._')
    for (const a of achados.slice(0, 20)) doc += '┃ [' + a.tipo + '] ' + a.nome + '\n'
    return reply(doc)
    }
}
