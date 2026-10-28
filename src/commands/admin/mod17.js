/**
 * Comando .modrelatorio — RELATÓRIO DO PERÍODO
 *
 * Consolidado de moderação de N dias.
 */

const M = require('../../services/moderationService')
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
    name: 'modrelatorio',
    aliases: ["relatoriomoderacao","cmd_modrelatorio","alt_modrelatorio","atalho_modrelatorio","abrev_modrelatorio","call_modrelatorio","func_modrelatorio"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Consolidado de moderação de N dias',
    usage: '[dias]',
    examples: [' — relatório dos últimos 30 dias', '7 — só a última semana', '90 — últimos três meses'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, isAdmin, mentionedJid, quotedSender, args = [], prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Este comando só funciona dentro de um grupo.')
    const dias = Math.min(365, Math.max(1, parseInt(args[0], 10) || 30))
    const acoes = M.porAcao(from, dias)
    const motivos = M.porMotivo(from, dias)
    const total = acoes.reduce((a, b) => a + b.total, 0)
    let doc = cab('RELATÓRIO DO PERÍODO', '🧾')
    doc += linha('Período', 'últimos ' + dias + ' dias')
    doc += linha('Ocorrências', String(total))
    if (!total) return reply(F.tela({
        emoji: '🧾', titulo: 'Relatório do período', prefix,
        intro: '🟢 Nenhuma ocorrência nos últimos ' + dias + ' dias. Com registros, o relatório separa o total por ação e por motivo.',
        secoes: [{ emoji: '📋', titulo: 'Período', linhas: [F.campo('Dias', String(dias)), F.campo('Ocorrências', '0')] }],
        dica: 'Informe outro período em dias, de 1 a 365.',
        proximos: [
            { nome: 'modrelatorio', args: '90', oque: 'relatório dos últimos 90 dias' },
            { nome: 'modtendencia', oque: 'vê se o grupo está melhorando' }
        ]
    }))
    doc += '\n' + bloco('⚖️ POR AÇÃO', acoes.map(a => a.acao + ' — ' + a.total))
    doc += '\n' + bloco('🏷️ POR MOTIVO', motivos.slice(0, 6).map(m => m.motivo + ' — ' + m.total))
    return reply(doc)
    }
}
