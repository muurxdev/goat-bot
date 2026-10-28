/**
 * Comando .estantelimpar — LIMPAR ESTANTE
 *
 * Apaga todos os livros registrados.
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
    name: 'estantelimpar',
    aliases: ["zerarestante"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Apaga todos os livros registrados',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const livros = L.estante(sender)
    return reply(F.tela(Object.assign({"emoji": "🧹", "titulo": "Nada para apagar", "intro": "Sua estante já está vazia, então não tem livro nem anotação para remover.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Quando quiser recomeçar, adicione um livro."]}], "proximos": [{"nome": "adicionarlivro", "args": "Dom Casmurro | 256", "oque": "colocar um livro na estante"}, {"nome": "listasleitura", "oque": "ver listas de livros recomendados"}]}, { prefix })))
    if (String(args[0] || '').toLowerCase() !== 'confirmar') {
        return reply('🧹 Isso apaga *' + livros.length + '* livros e todas as anotações. Não tem volta.\n\nPara confirmar: `' + prefix + 'estantelimpar confirmar`')
    }
    require('../../services/profileDataService').deleteData(String(sender).split('@')[0].split(':')[0] + '@estante', 'biblioteca_estante')
    return reply('🧹 Estante zerada. ' + livros.length + ' livros removidos.')
    }
}
