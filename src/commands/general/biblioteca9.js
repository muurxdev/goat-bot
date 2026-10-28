/**
 * Comando .progressolivro — PROGRESSO DA LEITURA
 *
 * Quanto falta em cada livro que você está lendo.
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
    name: 'progressolivro',
    aliases: ["verprogresso"],
    category: 'general',
    subcategory: 'Livros & Leitura',
    description: 'Quanto falta em cada livro que você está lendo',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const lendo = L.estante(sender).filter(l => l.situacao === 'lendo')
    let doc = cab('PROGRESSO DA LEITURA', '📊')
    return reply(F.tela(Object.assign({"emoji": "📊", "titulo": "Progresso da leitura", "intro": "Esta tela mostra quanto falta em cada livro que você está lendo. Nenhum livro está marcado como em leitura agora.", "secoes": [{"emoji": "📌", "titulo": "Como começar", "linhas": ["Marque um livro da estante como em leitura e anote a página em que parou."]}], "proximos": [{"nome": "lendo", "args": "1", "oque": "marcar o livro 1 como em leitura"}, {"nome": "progresso", "args": "1 50", "oque": "anotar que parou na página 50"}, {"nome": "minhaestante", "oque": "ver os livros e seus números"}]}, { prefix })))
    for (const l of lendo) {
        doc += '📖 *' + String(l.titulo).slice(0, 32) + '*\n'
        if (l.paginas) {
            doc += barra(l.pagina / l.paginas) + '\n'
            const t = L.tempoRestante(l)
            doc += '_' + l.pagina + '/' + l.paginas + ' · faltam ~' + horas(t.horas) + '_\n\n'
        } else doc += '_página ' + (l.pagina || 0) + ' · total desconhecido_\n\n'
    }
    return reply(doc)
    }
}
