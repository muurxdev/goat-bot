/**
 * Comando .diagcomandos — REGISTRO DE COMANDOS
 *
 * Quantos comandos, aliases e arquivos existem.
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
    name: 'diagcomandos',
    aliases: ["diagcmds","cmd_diagcomandos","alt_diagcomandos","atalho_diagcomandos","abrev_diagcomandos","call_diagcomandos","func_diagcomandos"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quantos comandos, aliases e arquivos existem',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const r = D.registroDeComandos()
    if (r.erro) return reply('❌ ' + r.erro)
    let doc = cab('REGISTRO DE COMANDOS', '🎛️')
    doc += linha('Arquivos varridos', String(r.arquivos))
    doc += linha('Comandos válidos', String(r.comandos))
    doc += linha('Chaves (nomes + aliases)', String(r.chaves))
    doc += linha('Arquivos com problema', String(r.problemas.length))
    doc += linha('Colisões', String(r.colisoes.length))
    doc += linha('Saúde', (!r.problemas.length && !r.colisoes.length) ? '🟢 Registro limpo' : '🟡 Ver .diagproblemas')
    return reply(doc)
    }
}
