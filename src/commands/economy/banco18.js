/**
 * Comando .bancoquantofalta — QUANTO FALTA
 *
 * Distância entre o que você tem e sua meta.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')

function cab(titulo, emoji) {
    return `╔══════════════════════════════╗\n║   ${emoji} *${titulo}*\n╚══════════════════════════════╝\n\n`
}
function linha(rotulo, valor) { return `┃ *${rotulo}:* ${valor}\n` }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function vazio() { return '_Nenhuma movimentação registrada ainda._\n\nAs movimentações aparecem aqui conforme você deposita, saca e transfere.' }
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    const cheios = Math.round(f * 20)
    return '[' + '█'.repeat(cheios) + '░'.repeat(20 - cheios) + '] ' + (f * 100).toFixed(0) + '%'
}
function fatia(rotulo, fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '┃ ' + rotulo.padEnd(10) + '█'.repeat(Math.round(f * 12)).padEnd(12) + (f * 100).toFixed(1) + '%\n'
}
function movimento(l) {
    const entrada = B.ehEntrada(l)
    const data = String(l.created_at || '').slice(5, 16).replace('-', '/')
    return '┃ ' + (entrada ? '📥' : '📤') + ' ' + data + '  ' + (entrada ? '+' : '-') + B.moeda(Math.abs(Number(l.amount) || 0)) + '\n'
}

module.exports = {
    name: 'bancoquantofalta',
    aliases: ["faltaquanto","cmd_bancoquantofalta","alt_bancoquantofalta","atalho_bancoquantofalta","abrev_bancoquantofalta","call_bancoquantofalta","func_bancoquantofalta"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Distância entre o que você tem e sua meta',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)

    const prefs = B.lerPreferencias(user)
    const p = B.patrimonio(user)
    const alvo = parseInt(String(args[0] || '').replace(/\D/g, ''), 10) || prefs.meta
    if (!alvo) return reply('🎯 Defina uma meta com `' + prefix + 'bancometa <valor>` ou informe um valor: `' + prefix + 'bancoquantofalta 500000`')
    const r = B.diasAteMeta(p.banco || p.total, alvo)
    let doc = cab('QUANTO FALTA', '🎯')
    doc += linha('Objetivo', B.moeda(alvo))
    doc += linha('Você tem', B.moeda(p.total))
    if (r.alcancado) { doc += '\n🎉 *Meta alcançada!*'; return reply(doc) }
    doc += linha('Falta', B.moeda(r.falta))
    doc += linha('Progresso', ((p.total / alvo) * 100).toFixed(1) + '%')
    doc += '\n' + barra(p.total / alvo)
    if (r.dias) doc += '\n_Só com o rendimento do banco: ' + r.dias + ' dias._'
    return reply(doc)
    }
}
