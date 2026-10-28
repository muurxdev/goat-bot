/**
 * Comando .diagtabelas — TABELAS E LINHAS
 *
 * Quantidade de registros em cada tabela.
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
    name: 'diagtabelas',
    aliases: ["diagtables","cmd_diagtabelas","alt_diagtabelas","atalho_diagtabelas","abrev_diagtabelas","call_diagtabelas","func_diagtabelas"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quantidade de registros em cada tabela',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const t = D.tabelas()
    if (t.erro) return reply('❌ ' + t.erro)
    const ordenadas = [...t].sort((a, b) => (b.linhas || 0) - (a.linhas || 0))
    let doc = cab('TABELAS E LINHAS', '🗂️')
    for (const x of ordenadas.slice(0, 25)) {
        doc += '┃ ' + x.nome.padEnd(22) + (x.linhas === null ? 'erro' : x.linhas.toLocaleString('pt-BR')) + '\n'
    }
    doc += '\n_' + t.length + ' tabelas · ' + ordenadas.reduce((a, b) => a + (b.linhas || 0), 0).toLocaleString('pt-BR') + ' linhas no total._'
    return reply(doc)
    }
}
