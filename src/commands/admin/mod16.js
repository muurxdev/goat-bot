/**
 * Comando .modbuscar — BUSCAR NO LIVRO
 *
 * Procura ocorrências por motivo ou ação.
 */

const M = require('../../services/moderationService')

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

/** Resolve o alvo: menção, resposta ou número digitado. */
function alvoDe(ctx) {
    const marcado = (ctx.mentionedJid || [])[0]
    if (marcado) return marcado
    if (ctx.quotedSender) return ctx.quotedSender
    const bruto = (ctx.args || []).find(a => /^\+?\d{8,15}$/.test(String(a).replace(/\D/g, '')))
    if (bruto) return String(bruto).replace(/\D/g, '') + '@s.whatsapp.net'
    return null
}
function pedeAlvo(prefix, cmd) {
    return '🎯 *Quem?*\n\nMarque a pessoa, responda a uma mensagem dela ou informe o número.\n\n📌 Exemplo: `' + prefix + cmd + ' @fulano`'
}
function quando(ms) {
    if (!ms) return 'sem data'
    return new Date(Number(ms)).toLocaleString('pt-BR')
}

module.exports = {
    name: 'modbuscar',
    aliases: ["buscarocorrencia","cmd_modbuscar","alt_modbuscar","atalho_modbuscar","abrev_modbuscar","call_modbuscar","func_modbuscar"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Procura ocorrências por motivo ou ação',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const termo = args.join(' ').trim().toLowerCase()
    if (!termo) return reply('🔍 📌 Uso: `' + prefix + 'modbuscar spam`')
    const achados = M.livro(from).filter(o =>
        String(o.motivo || '').toLowerCase().includes(termo) ||
        String(o.acao || '').toLowerCase().includes(termo) ||
        String(o.detalhe || '').toLowerCase().includes(termo))
    let doc = cab('BUSCAR NO LIVRO', '🔍')
    doc += linha('Termo', termo)
    doc += linha('Encontradas', String(achados.length))
    if (!achados.length) return reply(doc + '\n_Nada encontrado._')
    doc += '\n'
    for (const o of achados.slice(0, 12)) doc += '┃ ' + quando(o.em).slice(0, 10) + ' · ' + M.nomeCurto(o.alvo) + ' · ' + o.acao + '\n'
    return reply(doc)
    }
}
