/**
 * Comando .ritmoleitura — RITMO DE LEITURA
 *
 * Quantos dias você leva por livro.
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
    name: 'ritmoleitura',
    aliases: ["velocidadeleitura"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Quantos dias você leva por livro',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const e = L.estatisticas(sender)
    let doc = cab('RITMO DE LEITURA', '🏃')
    return reply(F.tela(Object.assign({"emoji": "🏃", "titulo": "Ritmo de leitura", "intro": "Aqui eu calculo quantos dias você leva, em média, para terminar um livro. Preciso de pelo menos um livro terminado.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Marque um livro como em leitura e depois como lido: eu conto os dias entre os dois."]}], "proximos": [{"nome": "lendo", "args": "1", "oque": "marcar o livro 1 como em leitura"}, {"nome": "lido", "args": "1", "oque": "marcar o livro 1 como terminado"}]}, { prefix })))
    doc += linha('Média por livro', e.diasPorLivro.toFixed(0) + ' dias')
    doc += linha('Livros por mês', (30 / e.diasPorLivro).toFixed(1))
    doc += linha('Livros por ano', (365 / e.diasPorLivro).toFixed(0))
    return reply(doc)
    }
}
