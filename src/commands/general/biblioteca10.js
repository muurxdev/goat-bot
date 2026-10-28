/**
 * Comando .estantelidos — LIVROS LIDOS
 *
 * Tudo que você já terminou.
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
    name: 'estantelidos',
    aliases: ["livroslidos"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Tudo que você já terminou',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const lidos = L.estante(sender).filter(l => l.situacao === 'lido')
    let doc = cab('LIVROS LIDOS', '✅')
    return reply(F.tela(Object.assign({"emoji": "✅", "titulo": "Livros lidos", "intro": "Aqui aparecem os livros que você terminou, com a data. Ainda não tem nenhum.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Quando acabar um livro, marque como lido pelo número dele na estante."]}], "proximos": [{"nome": "lido", "args": "1", "oque": "marcar o livro 1 como terminado"}, {"nome": "minhaestante", "oque": "ver os livros e seus números"}]}, { prefix })))
    const paginas = lidos.reduce((a, l) => a + (l.paginas || 0), 0)
    doc += linha('Livros', String(lidos.length))
    if (paginas) doc += linha('Páginas', paginas.toLocaleString('pt-BR'))
    doc += '\n'
    lidos.sort((a, b) => (b.terminadoEm || 0) - (a.terminadoEm || 0))
    for (const l of lidos.slice(0, 20)) {
        const data = l.terminadoEm ? new Date(l.terminadoEm).toLocaleDateString('pt-BR') : '—'
        doc += '┃ ✅ ' + String(l.titulo).slice(0, 30) + ' · ' + data + '\n'
    }
    return reply(doc)
    }
}
