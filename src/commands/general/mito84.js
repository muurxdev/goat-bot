/**
 * Comando .deusaleatorio — DEUS ALEATÓRIO
 *
 * Sorteia um deus do catálogo e conta o mito dele.
 */

const M = require('../../services/mythologyService')

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
    name: 'deusaleatorio',
    aliases: ["sorteardeus"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Sorteia um deus do catálogo e conta o mito dele',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const chaves = Object.keys(M.DEUSES)
    const k = chaves[Math.floor(Math.random() * chaves.length)]
    const d = M.DEUSES[k]
    const p = M.PANTEOES[d.panteao]
    let doc = cab('DEUS ALEATÓRIO', '🎲')
    doc += p.emoji + ' *' + d.nome + '* — ' + p.nome + '\n\n'
    doc += linha('Domínio', d.dominio)
    doc += linha('Símbolos', d.simbolo)
    doc += sep()
    doc += '📜 ' + d.mito
    doc += '\n\n📖 _Ficha completa:_ `' + prefix + 'deus' + k.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase() + '`'
    return reply(doc)
    }
}
