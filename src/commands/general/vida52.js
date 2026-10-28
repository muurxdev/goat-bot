/**
 * Comando .buscarreceita — BUSCAR NA COZINHA
 *
 * Procura receita, esporte ou exercício por palavra.
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
    name: 'buscarreceita',
    aliases: ["acharprato"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Procura receita, esporte ou exercício por palavra',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ')
    if (!termo) return reply('🔎 📌 Uso: `' + prefix + 'buscarreceita ovo`')
    const achados = L.procurar(termo)
    if (!achados.length) return reply('🔎 Nada encontrado para `' + termo + '`.')
    let doc = cab('BUSCA: ' + termo.toUpperCase(), '🔎')
    doc += linha('Resultados', String(achados.length)) + '\n'
    const rota = { 'receita': 'receita', 'esporte': 'esporte', 'exercício': 'exercicio' }
    for (const a of achados) {
        const alvo = a.tipo === 'esporte' ? a.nome.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase() : a.chave
        doc += '┃ [' + a.tipo + '] *' + a.nome + '*\n┃    `' + prefix + rota[a.tipo] + alvo + '`\n'
    }
    return reply(doc)
    }
}
