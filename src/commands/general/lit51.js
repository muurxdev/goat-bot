/**
 * Comando .roteiroleitura — POR ONDE COMEÇAR
 *
 * Roteiros de leitura por objetivo e tempo disponível.
 */

const L = require('../../services/literatureService')

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


module.exports = {
    name: 'roteiroleitura',
    aliases: ["porondecomecar","trilhaleitura"],
    category: 'general',
    subcategory: 'Literatura Brasileira',
    description: 'Roteiros de leitura por objetivo e tempo disponível',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const r = L.roteiro(args[0])
    let doc = cab('POR ONDE COMEÇAR', '🚪')
    doc += linha('Trilha', r.nome)
    doc += linha('Critério', r.criterio)
    doc += sep()
    let total = 0
    r.lista.forEach((o, i) => {
        total += o.paginas
        const a = L.AUTORES[o.autor]
        doc += '┃ *' + (i + 1) + '. ' + o.titulo + '*\n'
        doc += '┃    ' + a.nome + ' · ' + o.paginas + 'p · ' + o.dificuldade + '\n'
        doc += '┃    `' + prefix + 'obra' + o.chave + '`\n'
    })
    doc += '\n📏 *Total da trilha:* ' + total + ' páginas\n'
    doc += '_Lendo 20 páginas por dia, ' + Math.ceil(total / 20) + ' dias._\n\n'
    doc += bloco('🧭 OUTRAS TRILHAS', r.disponiveis.filter(d => d !== r.chave).map(d => '`' + prefix + 'roteiroleitura ' + d + '`'))
    return reply(doc)
    }
}
