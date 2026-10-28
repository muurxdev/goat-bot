/**
 * Comando .estanteesquecidos — ESQUECIDOS NA FILA
 *
 * Livros que estão há mais tempo esperando.
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
    name: 'estanteesquecidos',
    aliases: ["livrosparados"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Livros que estão há mais tempo esperando',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const fila = L.estante(sender).filter(l => l.situacao === 'fila')
    let doc = cab('ESQUECIDOS NA FILA', '🕸️')
    return reply(F.tela(Object.assign({"emoji": "🕸️", "titulo": "Esquecidos na fila", "intro": "Aqui aparecem os livros que estão há mais tempo esperando na fila. Sua fila está vazia.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Todo livro adicionado entra na fila; os mais antigos aparecem primeiro aqui."]}], "proximos": [{"nome": "adicionarlivro", "args": "Dom Casmurro | 256", "oque": "colocar um livro na estante"}, {"nome": "sugerirdaestante", "oque": "eu escolho o próximo livro da fila"}]}, { prefix })))
    fila.sort((a, b) => (a.adicionadoEm || 0) - (b.adicionadoEm || 0))
    for (const l of fila.slice(0, 12)) {
        const dias = Math.floor((Date.now() - (l.adicionadoEm || Date.now())) / 86400000)
        doc += '┃ ' + String(l.titulo).slice(0, 30).padEnd(32) + dias + 'd\n'
    }
    doc += '\n_Livro parado há muito tempo costuma ser livro que você não quer ler. Tudo bem tirar da fila._'
    return reply(doc)
    }
}
