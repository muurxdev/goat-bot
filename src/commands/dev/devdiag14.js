/**
 * Comando .diagfragmentacao — FRAGMENTAÇÃO DO BANCO
 *
 * Espaço desperdiçado e se compensa compactar.
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
    name: 'diagfragmentacao',
    aliases: ["diagfrag","cmd_diagfragmentacao","alt_diagfragmentacao","atalho_diagfragmentacao","abrev_diagfragmentacao","call_diagfragmentacao","func_diagfragmentacao"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Espaço desperdiçado e se compensa compactar',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const b = D.arquivoDoBanco()
    if (b.erro) return reply('❌ ' + b.erro)
    const desperdicio = (b.paginasLivres || 0) * (b.bytesPorPagina || 0)
    const pct = b.bytes ? (desperdicio / b.bytes * 100) : 0
    let doc = cab('FRAGMENTAÇÃO DO BANCO', '🧩')
    doc += linha('Arquivo', D.tamanho(b.bytes))
    doc += linha('Espaço livre interno', D.tamanho(desperdicio) + ' (' + pct.toFixed(1) + '%)')
    doc += linha('Páginas livres', String(b.paginasLivres))
    doc += linha('Recomendação', pct > 25 ? '🟡 Compactar compensa' : '🟢 Sem necessidade')
    return reply(doc)
    }
}
