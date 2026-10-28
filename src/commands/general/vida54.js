/**
 * Comando .oquecozinhar — O QUE COZINHAR HOJE
 *
 * Sugere uma receita completa para agora.
 */

const L = require('../../services/lifestyleService')

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
    name: 'oquecozinhar',
    aliases: ["sugestaoreceita"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Sugere uma receita completa para agora',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const chaves = Object.keys(L.RECEITAS)
    const chave = chaves[Math.floor(Math.random() * chaves.length)]
    const r = L.RECEITAS[chave]
    let doc = cab('O QUE COZINHAR HOJE', '🍽️')
    doc += '🎯 *' + r.nome + '*\n\n'
    doc += linha('Rende', r.porcoes + (r.porcoes === 1 ? ' porção' : ' porções'))
    doc += linha('Tempo', '~' + r.tempo + ' min')
    doc += linha('Precisa de', r.ingredientes.length + ' ingredientes')
    doc += sep()
    doc += bloco('🧺 NA DESPENSA', r.ingredientes)
    doc += '\n📖 _Modo de fazer completo:_ `' + prefix + 'receita' + chave + '`'
    return reply(doc)
    }
}
