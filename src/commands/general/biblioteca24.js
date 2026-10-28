/**
 * Comando .relatorioleitura — RELATÓRIO DE LEITURA
 *
 * Tudo sobre sua leitura em uma tela.
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
    name: 'relatorioleitura',
    aliases: ["relatorioestante"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Tudo sobre sua leitura em uma tela',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const e = L.estatisticas(sender)
    const m = L.meta(sender)
    let doc = cab('RELATÓRIO DE LEITURA', '🧾')
    return reply(F.tela(Object.assign({"emoji": "🧾", "titulo": "Relatório de leitura", "intro": "Este relatório junta estante, meta, ritmo e páginas numa tela só. Sua estante ainda está vazia.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Registre o primeiro livro com o título e, se quiser, o número de páginas depois da barra."]}], "proximos": [{"nome": "adicionarlivro", "args": "Dom Casmurro | 256", "oque": "colocar um livro na estante"}, {"nome": "metaleitura", "args": "12", "oque": "definir a meta de 12 livros por ano"}]}, { prefix })))
    doc += linha('Estante', e.total + ' livros')
    doc += linha('Concluídos', e.lidos + ' (' + ((e.lidos / e.total) * 100).toFixed(0) + '%)')
    doc += linha('Páginas', e.paginasLidas.toLocaleString('pt-BR'))
    doc += linha('Anotações', String(e.notas))
    if (e.diasPorLivro) doc += linha('Ritmo', e.diasPorLivro.toFixed(0) + ' dias/livro')
    if (m.livrosPorAno) {
        const noAno = L.lidosNoPeriodo(sender, 365).length
        doc += linha('Meta anual', noAno + '/' + m.livrosPorAno)
    }
    doc += '\n' + barra(e.total ? e.lidos / e.total : 0) + ' concluído'
    return reply(doc)
    }
}
