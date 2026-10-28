/**
 * Comando .modajuda — GUIA DA GUARDA
 *
 * Todos os comandos de moderação disponíveis.
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
    name: 'modajuda',
    aliases: ["guiaguarda","cmd_modajuda","alt_modajuda","atalho_modajuda","abrev_modajuda","call_modajuda","func_modajuda"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Todos os comandos de moderação disponíveis',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    let doc = cab('GUIA DA GUARDA', '🗺️')
    doc += bloco('👁️ CONSULTA', [
        '`' + prefix + 'modficha` · `' + prefix + 'modhistorico`',
        '`' + prefix + 'modsilenciados` · `' + prefix + 'modrisco`',
        '`' + prefix + 'modreincidentes` · `' + prefix + 'modultimas`'
    ])
    doc += '\n' + bloco('📊 RELATÓRIOS', [
        '`' + prefix + 'modestatisticas` · `' + prefix + 'modrelatorio`',
        '`' + prefix + 'modacoes` · `' + prefix + 'modmotivosgrupo`'
    ])
    doc += '\n' + bloco('⚙️ AJUSTES', [
        '`' + prefix + 'modconfig` · `' + prefix + 'modlimite`',
        '`' + prefix + 'modpunicao` · `' + prefix + 'modisentar`'
    ])
    return reply(doc)
    }
}
