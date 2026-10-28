/**
 * Comando .diagprocesso — PROCESSO EM EXECUÇÃO
 *
 * Identificador, caminho e argumentos do processo.
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
    name: 'diagprocesso',
    aliases: ["diagproc","cmd_diagprocesso","alt_diagprocesso","atalho_diagprocesso","abrev_diagprocesso","call_diagprocesso","func_diagprocesso"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Identificador, caminho e argumentos do processo',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const a = D.ambiente()
    let doc = cab('PROCESSO EM EXECUÇÃO', '🧾')
    doc += linha('Identificador', String(a.pid))
    doc += linha('Diretório', String(a.diretorio))
    doc += linha('Executável', String(process.execPath))
    doc += linha('Argumentos', process.argv.slice(1).map(x => x.split('/').pop()).join(' ').slice(0, 60))
    doc += linha('Modo', a.ambienteNode)
    return reply(doc)
    }
}
