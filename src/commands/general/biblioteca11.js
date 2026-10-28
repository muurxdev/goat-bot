/**
 * Comando .estanteabandonados — ABANDONADOS
 *
 * Livros que você parou de ler.
 */

const L = require('../../services/libraryService')
const F = require('../../utils/formato')

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
    name: 'estanteabandonados',
    aliases: ["livrosabandonados"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Livros que você parou de ler',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const p = L.estante(sender).filter(l => l.situacao === 'parado')
    let doc = cab('ABANDONADOS', '⏸️')
    return reply(F.tela(Object.assign({"emoji": "⏸️", "titulo": "Abandonados", "intro": "Aqui ficam os livros que você parou de ler. Nenhum por enquanto: você é persistente!", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Se desistir de um livro, marque pelo número dele. Dá para retomar depois."]}], "proximos": [{"nome": "abandonarlivro", "args": "1", "oque": "pausar o livro 1"}, {"nome": "querroler", "args": "1", "oque": "devolver um livro para a fila"}]}, { prefix })))
    p.forEach((l, i) => { doc += linhaLivro(l, i) })
    return reply(doc)
    }
}
