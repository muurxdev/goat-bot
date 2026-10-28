/**
 * Comando .anotarlivro — ANOTAR
 *
 * Guarda uma anotação sobre um livro.
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
    name: 'anotarlivro',
    aliases: ["novanota"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Guarda uma anotação sobre um livro',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    if (args.length < 2) return reply('✍️ 📌 Uso: `' + prefix + 'anotarlivro 1 | O capítulo 3 explica bem coesão`')
    const [alvo, ...resto] = args.join(' ').split('|')
    const texto = resto.join('|').trim()
    if (!texto) return reply('✍️ Separe o livro da anotação com uma barra: `' + prefix + 'anotarlivro 1 | sua anotação`')
    const r = L.anotar(sender, alvo.trim(), texto)
    if (!r.ok) return reply('❌ ' + r.erro)
    return reply('✍️ Anotação guardada em *' + r.livro.titulo + '* (' + r.total + ' no total).')
    }
}
