/**
 * Comando .metastatus — SITUAÇÃO DA META
 *
 * Se você está no ritmo da sua meta anual.
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
    name: 'metastatus',
    aliases: ["statusmeta"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Se você está no ritmo da sua meta anual',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const m = L.meta(sender)
    let doc = cab('SITUAÇÃO DA META', '📈')
    return reply(F.tela(Object.assign({"emoji": "📈", "titulo": "Situação da meta", "intro": "Aqui eu comparo quantos livros você terminou com a meta do ano. Você ainda não definiu uma meta.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Escolha quantos livros quer ler por ano. Depois é só ir marcando os lidos."]}], "proximos": [{"nome": "metaleitura", "args": "12", "oque": "definir a meta de 12 livros por ano"}, {"nome": "lido", "args": "1", "oque": "marcar o livro 1 como terminado"}]}, { prefix })))
    const noAno = L.lidosNoPeriodo(sender, 365).length
    const diaDoAno = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    const esperado = (m.livrosPorAno / 365) * diaDoAno
    doc += linha('Meta', m.livrosPorAno + ' livros')
    doc += linha('Lidos', String(noAno))
    doc += linha('Esperado até hoje', esperado.toFixed(1))
    doc += '\n' + barra(noAno / m.livrosPorAno) + '\n'
    doc += '\n_' + (noAno >= esperado ? '🟢 Você está no ritmo.' : '🟡 Está atrasado em ' + (esperado - noAno).toFixed(1) + ' livro(s).') + '_'
    return reply(doc)
    }
}
