/**
 * Comando .tempoparaler — TEMPO PARA LER
 *
 * Estima quanto tempo leva ler N páginas.
 */

const L = require('../../services/libraryService')

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

function linhaLivro(l, i) {
    const s = L.SITUACOES[l.situacao] || { emoji: '📕' }
    let t = '┃ ' + (i + 1) + '. ' + s.emoji + ' ' + String(l.titulo).slice(0, 34)
    if (l.paginas) t += ' (' + (l.pagina || 0) + '/' + l.paginas + ')'
    return t + '\n'
}
function semEstante(prefix) {
    return '_Sua estante está vazia._\n\n📌 Comece com: `' + prefix + 'adicionarlivro Código Limpo | 464`'
}
function partesDe(args) {
    // "Título do livro | 464" → título e número de páginas
    const bruto = args.join(' ')
    const [titulo, paginas] = bruto.split('|').map(s => s.trim())
    return { titulo: titulo || '', paginas: parseInt(paginas, 10) || 0 }
}
function horas(h) {
    if (!h) return '0h'
    const inteiro = Math.floor(h)
    const min = Math.round((h - inteiro) * 60)
    return (inteiro ? inteiro + 'h' : '') + (min ? ' ' + min + 'min' : '') || '0h'
}

module.exports = {
    name: 'tempoparaler',
    aliases: ["calcularleitura"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Estima quanto tempo leva ler N páginas',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const p = parseInt(String(args[0] || '').replace(/\D/g, ''), 10)
    if (!p) return reply('⏱️ 📌 Uso: `' + prefix + 'tempoparaler 464`')
    let doc = cab('TEMPO PARA LER', '⏱️')
    doc += linha('Páginas', String(p))
    doc += sep()
    for (const [nome, ritmo] of [['Devagar', 25], ['Médio', 40], ['Rápido', 60]]) {
        doc += '┃ ' + nome.padEnd(9) + horas(p / ritmo) + ' (' + ritmo + ' pág/h)\n'
    }
    doc += '\n_A 20 páginas por dia: ' + Math.ceil(p / 20) + ' dias._'
    return reply(doc)
    }
}
