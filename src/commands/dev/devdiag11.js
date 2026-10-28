/**
 * Comando .diagindices — ÍNDICES DO BANCO
 *
 * Índices existentes e a que tabela pertencem.
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
    name: 'diagindices',
    aliases: ["diagindexes","cmd_diagindices","alt_diagindices","atalho_diagindices","abrev_diagindices","call_diagindices","func_diagindices"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Índices existentes e a que tabela pertencem',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const i = D.indices()
    if (i.erro) return reply('❌ ' + i.erro)
    let doc = cab('ÍNDICES DO BANCO', '🔎')
    let tabelaAtual = null
    for (const x of i.slice(0, 40)) {
        if (x.tbl_name !== tabelaAtual) { tabelaAtual = x.tbl_name; doc += '\n📁 ' + tabelaAtual + '\n' }
        doc += '┃ ' + x.name + '\n'
    }
    doc += '\n_' + i.length + ' índices._'
    return reply(doc)
    }
}
