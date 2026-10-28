/**
 * Comando .diagusuarios — BASE DE USUÁRIOS
 *
 * Total, registrados, ativos e XP acumulado.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')

/** Cabeçalho padrão dos relatórios de diagnóstico. */
function cab(titulo, emoji) {
    return `╔══════════════════════════════╗\n║   ${emoji} *${titulo}*\n╚══════════════════════════════╝\n\n`
}

/** Uma linha rótulo → valor. */
function linha(rotulo, valor) {
    return `┃ *${rotulo}:* ${valor}\n`
}

/** Barra de proporção para leitura rápida. */
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    const cheios = Math.round(f * 20)
    return '[' + '█'.repeat(cheios) + '░'.repeat(20 - cheios) + '] ' + (f * 100).toFixed(0) + '%'
}

module.exports = {
    name: 'diagusuarios',
    aliases: ["diagusers","cmd_diagusuarios","alt_diagusuarios","atalho_diagusuarios","abrev_diagusuarios","call_diagusuarios","func_diagusuarios"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Total, registrados, ativos e XP acumulado',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const u = D.estatisticasDeUsuarios()
    if (u.erro) return reply('❌ ' + u.erro)
    const pctReg = u.total ? (u.registrados / u.total * 100) : 0
    let doc = cab('BASE DE USUÁRIOS', '👥')
    doc += linha('Total conhecido', Number(u.total).toLocaleString('pt-BR'))
    doc += linha('Registrados', u.registrados + ' (' + pctReg.toFixed(1) + '%)')
    doc += linha('Com atividade', String(u.ativos))
    doc += linha('Mensagens somadas', Number(u.mensagens).toLocaleString('pt-BR'))
    doc += linha('XP somado', Number(u.xpTotal).toLocaleString('pt-BR'))
    doc += linha('Maior nível', String(u.maiorNivel))
    doc += '\n' + barra(pctReg / 100) + ' registrados'
    return reply(doc)
    }
}
