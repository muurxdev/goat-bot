/**
 * Comando .lido — TERMINAR LIVRO
 *
 * Marca um livro como lido.
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
    name: 'lido',
    aliases: ["terminarlivro"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Marca um livro como lido',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    if (!args.length) return reply('✅ 📌 Uso: `' + prefix + 'lido 1`')
    const r = L.mudarSituacao(sender, args.join(' '), 'lido')
    if (!r.ok) return reply('❌ ' + r.erro)
    const e = L.estatisticas(sender)
    let doc = cab('LIVRO TERMINADO', '✅')
    doc += linha('Livro', r.livro.titulo)
    if (r.livro.paginas) doc += linha('Páginas', String(r.livro.paginas))
    doc += linha('Total lidos', String(e.lidos))
    doc += '\n🎉 _Mais um na conta._'
    return reply(doc)
    }
}
