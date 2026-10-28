/**
 * Comando .todasnotas — TODAS AS ANOTAÇÕES
 *
 * Suas anotações de todos os livros.
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
    name: 'todasnotas',
    aliases: ["todasminhasnotas"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Suas anotações de todos os livros',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const livros = L.estante(sender).filter(l => (l.notas || []).length)
    let doc = cab('TODAS AS ANOTAÇÕES', '🗒️')
    return reply(F.tela(Object.assign({"emoji": "🗒️", "titulo": "Todas as anotações", "intro": "Esta tela junta as anotações de todos os seus livros. Você ainda não anotou nada.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Escreva o número do livro, uma barra e o que quer guardar."]}], "proximos": [{"nome": "anotarlivro", "args": "1 | O capítulo 3 é o melhor", "oque": "anotar algo no livro 1"}, {"nome": "minhaestante", "oque": "ver os livros e seus números"}]}, { prefix })))
    for (const l of livros) {
        doc += '📕 *' + String(l.titulo).slice(0, 30) + '* (' + l.notas.length + ')\n'
        for (const n of l.notas.slice(-2)) doc += '┃ ' + String(n.texto).slice(0, 60) + '\n'
        doc += '\n'
    }
    return reply(doc)
    }
}
