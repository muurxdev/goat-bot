/**
 * Comando .diagrecursos — RECURSOS ABERTOS
 *
 * Conexões e operações pendentes no processo.
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
    name: 'diagrecursos',
    aliases: ["diaghandles","cmd_diagrecursos","alt_diagrecursos","atalho_diagrecursos","abrev_diagrecursos","call_diagrecursos","func_diagrecursos"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Conexões e operações pendentes no processo',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const r = D.recursosAtivos()
    if (r.erro) return reply('❌ ' + r.erro)
    let doc = cab('RECURSOS ABERTOS', '🔌')
    doc += linha('Conexões/timers ativos', r.handles === null ? 'indisponível' : String(r.handles))
    doc += linha('Operações pendentes', r.requisicoes === null ? 'indisponível' : String(r.requisicoes))
    doc += '\n_Crescimento contínuo desses números indica vazamento de recurso._'
    return reply(doc)
    }
}
