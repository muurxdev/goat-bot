/**
 * Comando .diagcategorias — COMANDOS POR CATEGORIA
 *
 * Distribuição dos comandos entre as categorias.
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
    name: 'diagcategorias',
    aliases: ["diagcats","cmd_diagcategorias","alt_diagcategorias","atalho_diagcategorias","abrev_diagcategorias","call_diagcategorias","func_diagcategorias"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Distribuição dos comandos entre as categorias',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const r = D.registroDeComandos()
    if (r.erro) return reply('❌ ' + r.erro)
    const maior = r.categorias[0] ? r.categorias[0][1] : 1
    let doc = cab('COMANDOS POR CATEGORIA', '📊')
    for (const [cat, n] of r.categorias) {
        const blocos = Math.max(1, Math.round(n / maior * 14))
        doc += '┃ ' + cat.padEnd(14) + '█'.repeat(blocos) + ' ' + n + '\n'
    }
    return reply(doc)
    }
}
