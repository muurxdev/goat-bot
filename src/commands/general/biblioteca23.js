/**
 * Comando .paginaslidas — PÁGINAS LIDAS
 *
 * Quantas páginas você já virou.
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
    name: 'paginaslidas',
    aliases: ["totalpaginas"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Quantas páginas você já virou',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const e = L.estatisticas(sender)
    let doc = cab('PÁGINAS LIDAS', '📄')
    return reply(F.tela(Object.assign({"emoji": "📄", "titulo": "Páginas lidas", "intro": "Aqui eu somo todas as páginas que você já virou. Ainda não tem nenhuma registrada.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Anote a página em que parou em cada livro: a soma aparece aqui."]}], "proximos": [{"nome": "progresso", "args": "1 50", "oque": "anotar que parou na página 50"}, {"nome": "minhaestante", "oque": "ver os livros e seus números"}]}, { prefix })))
    doc += linha('Total', e.paginasLidas.toLocaleString('pt-BR') + ' páginas')
    doc += linha('Tempo estimado', horas(e.paginasLidas / L.PAGINAS_POR_HORA))
    doc += linha('Equivale a', Math.round(e.paginasLidas / 300) + ' livros de 300 páginas')
    return reply(doc)
    }
}
