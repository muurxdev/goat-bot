/**
 * Comando .leituraano — LEITURA DO ANO
 *
 * Livros terminados nos últimos 365 dias.
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
    name: 'leituraano',
    aliases: ["livrosdoano"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Livros terminados nos últimos 365 dias',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const l = L.lidosNoPeriodo(sender, 365)
    let doc = cab('LEITURA DO ANO', '📅')
    return reply(F.tela(Object.assign({"emoji": "📅", "titulo": "Leitura do ano", "intro": "Aqui aparecem os livros terminados nos últimos 365 dias. Nenhum até agora.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Marque como lido cada livro que terminar: ele entra nesta lista na hora."]}], "proximos": [{"nome": "lido", "args": "1", "oque": "marcar o livro 1 como terminado"}, {"nome": "metaleitura", "args": "12", "oque": "definir a meta de 12 livros por ano"}]}, { prefix })))
    const paginas = l.reduce((a, x) => a + (x.paginas || 0), 0)
    doc += linha('Livros', String(l.length))
    doc += linha('Páginas', paginas.toLocaleString('pt-BR'))
    doc += linha('Média por mês', (l.length / 12).toFixed(1))
    doc += linha('Tempo estimado', horas(paginas / L.PAGINAS_POR_HORA))
    return reply(doc)
    }
}
