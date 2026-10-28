/**
 * Comando .adicionarlivro — ADICIONAR LIVRO
 *
 * Coloca um livro na sua estante.
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
    name: 'adicionarlivro',
    aliases: ["novolivro"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Coloca um livro na sua estante',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const { titulo, paginas } = partesDe(args)
    if (!titulo) return reply('➕ 📌 Uso: `' + prefix + 'adicionarlivro Código Limpo | 464`\n\n_O número depois da barra são as páginas (opcional)._')
    const r = L.adicionar(sender, titulo, 'fila', paginas)
    if (!r.ok) return reply('❌ ' + r.erro)
    let doc = cab('ADICIONAR LIVRO', '➕')
    doc += linha('Livro', r.livro.titulo)
    doc += linha('Posição', String(r.posicao))
    if (paginas) doc += linha('Páginas', String(paginas))
    doc += linha('Situação', '📥 Quero ler')
    doc += '\n📌 Comece a ler: `' + prefix + 'lendo ' + r.posicao + '`'
    return reply(doc)
    }
}
