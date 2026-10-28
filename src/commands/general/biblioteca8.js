/**
 * Comando .progresso — MARCAR PÁGINA
 *
 * Registra em que página você parou.
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
    name: 'progresso',
    aliases: ["marcarpagina"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Registra em que página você parou',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    if (args.length < 2) return reply('🔖 📌 Uso: `' + prefix + 'progresso 1 250`\n\n_(número do livro e página atual)_')
    const pagina = parseInt(args[args.length - 1], 10)
    const termo = args.slice(0, -1).join(' ')
    if (isNaN(pagina)) return reply('❌ A última parte precisa ser o número da página.')
    const r = L.marcarPagina(sender, termo, pagina)
    if (!r.ok) return reply('❌ ' + r.erro)
    const l = r.livro
    let doc = cab('MARCAR PÁGINA', '🔖')
    doc += linha('Livro', l.titulo)
    doc += linha('Página', l.paginas ? l.pagina + ' de ' + l.paginas : String(l.pagina))
    if (l.paginas) {
        doc += '\n' + barra(l.pagina / l.paginas) + '\n'
        const t = L.tempoRestante(l)
        if (t.restantes) doc += linha('Faltam', t.restantes + ' páginas (~' + horas(t.horas) + ')')
    }
    if (l.situacao === 'lido') doc += '\n🎉 _Livro concluído!_'
    return reply(doc)
    }
}
