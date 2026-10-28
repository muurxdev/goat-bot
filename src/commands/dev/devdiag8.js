/**
 * Comando .diagbanco — ARQUIVO DO BANCO
 *
 * Tamanho, modo de escrita e páginas do banco.
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
    name: 'diagbanco',
    aliases: ["diagdb","cmd_diagbanco","alt_diagbanco","atalho_diagbanco","abrev_diagbanco","call_diagbanco","func_diagbanco"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Tamanho, modo de escrita e páginas do banco',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const b = D.arquivoDoBanco()
    if (b.erro) return reply('❌ ' + b.erro)
    let doc = cab('ARQUIVO DO BANCO', '💾')
    doc += linha('Tamanho', D.tamanho(b.bytes))
    doc += linha('Modo de escrita', String(b.journal).toUpperCase())
    doc += linha('Páginas', b.paginas + ' de ' + D.tamanho(b.bytesPorPagina) + ' cada')
    doc += linha('Páginas livres', String(b.paginasLivres))
    doc += linha('Última escrita', new Date(b.modificadoEm).toLocaleString('pt-BR'))
    return reply(doc)
    }
}
