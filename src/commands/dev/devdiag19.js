/**
 * Comando .diagtelemetria — TELEMETRIA
 *
 * Execuções, falhas e latência média medidas.
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
    name: 'diagtelemetria',
    aliases: ["diagtelemetry","cmd_diagtelemetria","alt_diagtelemetria","atalho_diagtelemetria","abrev_diagtelemetria","call_diagtelemetria","func_diagtelemetria"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Execuções, falhas e latência média medidas',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const t = D.telemetria()
    if (t.erro) return reply('❌ ' + t.erro)
    const r = t.resumo || {}
    let doc = cab('TELEMETRIA', '📡')
    for (const [k, v] of Object.entries(r).slice(0, 12)) {
        if (v === null || typeof v === 'object') continue
        doc += linha(k, typeof v === 'number' ? v.toLocaleString('pt-BR') : String(v))
    }
    if (!Object.keys(r).length) doc += '_Nenhuma métrica coletada desde o último reinício._'
    return reply(doc)
    }
}
