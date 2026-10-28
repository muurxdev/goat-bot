/**
 * Comando .leiturames — LEITURA DO MÊS
 *
 * Livros terminados nos últimos 30 dias.
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
    name: 'leiturames',
    aliases: ["livrosdomes"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Livros terminados nos últimos 30 dias',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const l = L.lidosNoPeriodo(sender, 30)
    let doc = cab('LEITURA DO MÊS', '🗓️')
    return reply(F.tela(Object.assign({"emoji": "🗓️", "titulo": "Leitura do mês", "intro": "Aqui aparecem os livros terminados nos últimos 30 dias. Nenhum até agora.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Marque como lido cada livro que terminar: ele entra nesta lista na hora."]}], "proximos": [{"nome": "lido", "args": "1", "oque": "marcar o livro 1 como terminado"}, {"nome": "progressolivro", "oque": "ver quanto falta nos livros em leitura"}]}, { prefix })))
    doc += linha('Livros', String(l.length))
    doc += linha('Páginas', l.reduce((a, x) => a + (x.paginas || 0), 0).toLocaleString('pt-BR')) + '\n'
    for (const x of l) doc += '┃ ✅ ' + String(x.titulo).slice(0, 34) + '\n'
    return reply(doc)
    }
}
