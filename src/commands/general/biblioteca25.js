/**
 * Comando .sugerirdaestante — O QUE LER DEPOIS
 *
 * Escolhe um livro da sua fila para você.
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
    name: 'sugerirdaestante',
    aliases: ["oquelerdepois"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Escolhe um livro da sua fila para você',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const fila = L.estante(sender).filter(l => l.situacao === 'fila')
    let doc = cab('O QUE LER DEPOIS', '💡')
    return reply(F.tela(Object.assign({"emoji": "💡", "titulo": "O que ler depois", "intro": "Eu escolho um livro da sua fila para você começar. Mas sua fila está vazia.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Adicione livros que quer ler; eles entram na fila. Sem ideias? Veja as listas recomendadas."]}], "proximos": [{"nome": "listasleitura", "oque": "ver listas de livros recomendados"}, {"nome": "adicionarlivro", "args": "Dom Casmurro | 256", "oque": "colocar um livro na estante"}]}, { prefix })))
    const escolhido = fila[Math.floor(Math.random() * fila.length)]
    doc += linha('Sugestão', escolhido.titulo)
    if (escolhido.paginas) doc += linha('Páginas', String(escolhido.paginas))
    doc += linha('Na fila desde', new Date(escolhido.adicionadoEm).toLocaleDateString('pt-BR'))
    doc += '\n_Escolhido entre os ' + fila.length + ' da sua fila._'
    return reply(doc)
    }
}
