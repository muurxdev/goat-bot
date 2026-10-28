/**
 * Comando .diagmigracoes — MIGRAÇÕES APLICADAS
 *
 * Histórico de alterações de estrutura do banco.
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
    name: 'diagmigracoes',
    aliases: ["diagmigrations","cmd_diagmigracoes","alt_diagmigracoes","atalho_diagmigracoes","abrev_diagmigracoes","call_diagmigracoes","func_diagmigracoes"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Histórico de alterações de estrutura do banco',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const m = D.migracoes()
    if (m.erro) return reply('❌ ' + m.erro)
    let doc = cab('MIGRAÇÕES APLICADAS', '📜')
    for (const x of m) doc += '┃ ' + Object.values(x).filter(v => v !== null).join(' · ') + '\n'
    doc += '\n_Últimas ' + m.length + ' migrações._'
    return reply(doc)
    }
}
