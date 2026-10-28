/**
 * Comando .bibliotecaajuda — GUIA DA ESTANTE
 *
 * Todos os comandos da biblioteca pessoal.
 */

const L = require('../../services/libraryService')

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
    name: 'bibliotecaajuda',
    aliases: ["guiaestante"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Todos os comandos da biblioteca pessoal',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    let doc = cab('GUIA DA ESTANTE', '🗺️')
    doc += bloco('📚 ESTANTE', [
        '`' + prefix + 'estante` · `' + prefix + 'adicionarlivro`',
        '`' + prefix + 'lendo` · `' + prefix + 'lido` · `' + prefix + 'querroler`',
        '`' + prefix + 'progresso` · `' + prefix + 'removerlivro`'
    ])
    doc += '\n' + bloco('📝 ANOTAÇÕES', ['`' + prefix + 'anotarlivro` · `' + prefix + 'notaslivro`'])
    doc += '\n' + bloco('📊 NÚMEROS', [
        '`' + prefix + 'estatisticasleitura` · `' + prefix + 'ritmoleitura`',
        '`' + prefix + 'metaleitura` · `' + prefix + 'metastatus`'
    ])
    doc += '\n' + bloco('🗂️ DESCOBRIR', ['`' + prefix + 'listasleitura` · `' + prefix + 'sugerirdaestante`'])
    return reply(doc)
    }
}
