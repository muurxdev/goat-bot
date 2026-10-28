/**
 * Comando .querroler — FILA DE LEITURA
 *
 * Livros que você quer ler depois.
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
    name: 'querroler',
    aliases: ["adicionarfila"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Livros que você quer ler depois',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    if (args.length) {
        const r = L.mudarSituacao(sender, args.join(' '), 'fila')
        if (!r.ok) return reply('❌ ' + r.erro)
        return reply('📥 *' + r.livro.titulo + '* voltou para a fila.')
    }
    const fila = L.estante(sender).filter(l => l.situacao === 'fila')
    let doc = cab('FILA DE LEITURA', '📥')
    return reply(F.tela(Object.assign({"emoji": "📥", "titulo": "Fila de leitura", "intro": "Aqui ficam os livros que você quer ler depois. Sua fila está vazia agora.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Todo livro adicionado entra direto na fila. Um livro que você começou também pode voltar para ela com o número dele."]}], "proximos": [{"nome": "adicionarlivro", "args": "Dom Casmurro | 256", "oque": "colocar um livro na estante"}, {"nome": "querroler", "args": "1", "oque": "devolver o livro 1 para a fila"}]}, { prefix })))
    fila.forEach((l, i) => { doc += linhaLivro(l, i) })
    return reply(doc)
    }
}
