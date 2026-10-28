/**
 * Comando .estanteresumo — RESUMO DA ESTANTE
 *
 * Visão rápida do estado da sua estante.
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
    name: 'estanteresumo',
    aliases: ["resumoestante"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Visão rápida do estado da sua estante',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const e = L.estatisticas(sender)
    let doc = cab('RESUMO DA ESTANTE', '📋')
    return reply(F.tela(Object.assign({"emoji": "📋", "titulo": "Resumo da estante", "intro": "Esta tela mostra num relance quantos livros estão na fila, em leitura e lidos. Sua estante ainda está vazia.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Registre o primeiro livro com o título e, se quiser, o número de páginas depois da barra."]}], "proximos": [{"nome": "adicionarlivro", "args": "Dom Casmurro | 256", "oque": "colocar um livro na estante"}, {"nome": "listasleitura", "oque": "ver listas de livros recomendados"}]}, { prefix })))
    for (const [chave, s] of Object.entries(L.SITUACOES)) {
        const n = chave === 'lido' ? e.lidos : chave === 'lendo' ? e.lendo : chave === 'fila' ? e.fila : e.parados
        doc += '┃ ' + s.emoji + ' ' + s.nome.padEnd(13) + n + '\n'
    }
    doc += sep() + linha('Total', String(e.total))
    return reply(doc)
    }
}
