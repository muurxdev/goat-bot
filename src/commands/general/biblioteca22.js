/**
 * Comando .previsaotermino — QUANDO VOCÊ TERMINA
 *
 * Previsão de término do livro atual.
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
    name: 'previsaotermino',
    aliases: ["quandotermino"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Previsão de término do livro atual',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const lendo = L.estante(sender).filter(l => l.situacao === 'lendo' && l.paginas)
    let doc = cab('QUANDO VOCÊ TERMINA', '🔮')
    return reply(F.tela(Object.assign({"emoji": "🔮", "titulo": "Quando você termina", "intro": "Aqui eu prevejo quando você termina cada livro, pelo seu ritmo de páginas. Não achei livro em leitura com o total de páginas.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Adicione o livro com o número de páginas depois da barra, marque como em leitura e anote a página atual."]}], "proximos": [{"nome": "adicionarlivro", "args": "Dom Casmurro | 256", "oque": "colocar um livro na estante"}, {"nome": "lendo", "args": "1", "oque": "marcar o livro 1 como em leitura"}, {"nome": "progresso", "args": "1 50", "oque": "anotar que parou na página 50"}]}, { prefix })))
    for (const l of lendo) {
        const t = L.tempoRestante(l)
        doc += '📖 *' + String(l.titulo).slice(0, 30) + '*\n'
        doc += '┃ faltam ' + t.restantes + ' páginas (~' + horas(t.horas) + ')\n'
        doc += '┃ a 20 páginas/dia: ' + Math.ceil(t.restantes / 20) + ' dias\n'
        doc += '┃ a 50 páginas/dia: ' + Math.ceil(t.restantes / 50) + ' dias\n\n'
    }
    return reply(doc)
    }
}
