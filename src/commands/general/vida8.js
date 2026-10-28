/**
 * Comando .receitapao — PÃO CASEIRO
 *
 * Receita completa de pão caseiro.
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
    name: 'receitapao',
    aliases: ["modopao"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Receita completa de pão caseiro',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const r = L.RECEITAS['pao']
    let doc = cab('PÃO CASEIRO', '🍳')
    doc += linha('Rende', r.porcoes + (r.porcoes === 1 ? ' porção' : ' porções'))
    doc += linha('Tempo', '~' + r.tempo + ' min')
    doc += linha('Dificuldade', r.dificuldade)
    doc += linha('Tipo', r.tipo)
    doc += sep()
    doc += bloco('🧺 INGREDIENTES', r.ingredientes)
    doc += '\n╭━〔 👨‍🍳 MODO DE FAZER 〕━⬣\n'
    r.passos.forEach((p, i) => { doc += '┃ *' + (i + 1) + '.* ' + p + '\n' })
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '💡 *Segredo:* ' + r.dica
    doc += '\n\n📚 _Todas as receitas:_ `' + prefix + 'receitario`'
    return reply(doc)
    }
}
