/**
 * Comando .receitario — RECEITUÁRIO
 *
 * Todas as receitas disponíveis, por tipo.
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
    name: 'receitario',
    aliases: ["listareceitas"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Todas as receitas disponíveis, por tipo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    if (filtro) {
        const achadas = L.receitasPorTipo(filtro)
        if (!achadas.length) return reply('📚 Nenhuma receita do tipo `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'receitario`')
        let doc = cab('RECEITAS: ' + filtro.toUpperCase(), '📚')
        for (const r of achadas) doc += '┃ *' + r.nome + '* — ' + r.tempo + ' min\n┃    `' + prefix + 'receita' + r.chave + '`\n'
        return reply(doc)
    }
    const porTipo = {}
    for (const [chave, r] of Object.entries(L.RECEITAS)) {
        if (!porTipo[r.tipo]) porTipo[r.tipo] = []
        porTipo[r.tipo].push({ chave, ...r })
    }
    let doc = cab('RECEITUÁRIO', '📚')
    doc += linha('Receitas', String(Object.keys(L.RECEITAS).length))
    doc += linha('Tipos', String(Object.keys(porTipo).length)) + '\n'
    for (const [tipo, lista] of Object.entries(porTipo)) {
        doc += bloco(tipo.toUpperCase(), lista.map(r => r.nome + ' — ' + r.tempo + ' min `' + prefix + 'receita' + r.chave + '`'))
    }
    doc += '\n💡 _Filtrar:_ `' + prefix + 'receitario doce`'
    return reply(doc)
    }
}
