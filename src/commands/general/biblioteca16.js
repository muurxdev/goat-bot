/**
 * Comando .metaleitura — META DE LEITURA
 *
 * Define quantos livros ler por ano.
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
    name: 'metaleitura',
    aliases: ["definirmetaleitura"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Define quantos livros ler por ano',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    if (!args[0]) {
        const m = L.meta(sender)
        return reply(F.tela({
            emoji: '🎯',
            titulo: m.livrosPorAno ? 'Meta anual: ' + m.livrosPorAno + ' livros' : 'Meta de leitura',
            intro: m.livrosPorAno
                ? 'Sua meta é ler ' + m.livrosPorAno + ' livros por ano, cerca de ' + (m.livrosPorAno / 12).toFixed(1).replace('.', ',') + ' por mês.'
                : 'Você ainda não definiu quantos livros quer ler por ano. Com a meta, eu aviso se está no ritmo.',
            secoes: [{ emoji: '✍️', titulo: m.livrosPorAno ? 'Para mudar' : 'Digite assim', linhas: [
                '• ' + F.cmd(prefix, 'metaleitura', '12') + ' — um livro por mês',
                '• ' + F.cmd(prefix, 'metaleitura', '24') + ' — dois livros por mês'
            ] }],
            proximos: [
                { nome: 'metastatus', oque: 'ver se você está no ritmo da meta' },
                { nome: 'lido', args: '1', oque: 'marcar um livro como terminado' }
            ],
            prefix
        }))
    }
    const n = parseInt(args[0], 10)
    if (!n || n < 1 || n > 500) return reply('❌ Informe entre 1 e 500 livros.')
    L.salvarMeta(sender, { livrosPorAno: n })
    return reply('🎯 *Meta definida:* ' + n + ' livros por ano (' + (n / 12).toFixed(1) + ' por mês).')
    }
}
