/**
 * Comando .buscarmito — BUSCA MITOLÓGICA
 *
 * Procura deus ou criatura por nome, domínio ou trecho do mito.
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
    name: 'buscarmito',
    aliases: ["acharlenda"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Procura deus ou criatura por nome, domínio ou trecho do mito',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termo = args.join(' ')
    if (!termo) return reply('🔎 📌 Uso: `' + prefix + 'buscarmito serpente`')
    const achados = M.procurar(termo)
    if (!achados.length) return reply('🔎 Nada encontrado para `' + termo + '`.')
    let doc = cab('BUSCA: ' + termo.toUpperCase(), '🔎')
    doc += linha('Resultados', String(achados.length)) + '\n'
    for (const a of achados.slice(0, 25)) {
        const alvo = a.chave.normalize('NFD').replace(/[^a-z0-9]/gi, '').toLowerCase()
        doc += '┃ *' + a.nome + '* — ' + a.extra + '\n┃    `' + prefix + a.tipo + alvo + '`\n'
    }
    if (achados.length > 25) doc += '\n_+' + (achados.length - 25) + ' resultados. Refine a busca._'
    return reply(doc)
    }
}
