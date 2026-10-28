/**
 * Comando .diagdados — PASTA DE DADOS
 *
 * Peso e arquivos da pasta de dados.
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
    name: 'diagdados',
    aliases: ["diagdatadir","cmd_diagdados","alt_diagdados","atalho_diagdados","abrev_diagdados","call_diagdados","func_diagdados"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Peso e arquivos da pasta de dados',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const r = D.pesoDoDiretorio('data')
    let doc = cab('PASTA DE DADOS', '📁')
    if (r.erro) return reply('❌ ' + r.erro)
    doc += linha('Arquivos', String(r.arquivos))
    doc += linha('Peso', D.tamanho(r.bytes))
    const recentes = D.arquivosRecentes('data', 10)
    doc += '\n╭━〔 🕐 MAIS RECENTES 〕━⬣\n'
    for (const a of recentes) doc += '┃ ' + a.nome.slice(0, 26).padEnd(28) + D.tamanho(a.bytes) + '\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣'
    return reply(doc)
    }
}
