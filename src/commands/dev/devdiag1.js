/**
 * Comando .diagmemoria — MEMÓRIA DO PROCESSO
 *
 * Heap, RSS e memória do sistema.
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
    name: 'diagmemoria',
    aliases: ["diagmem","cmd_diagmemoria","alt_diagmemoria","atalho_diagmemoria","abrev_diagmemoria","call_diagmemoria","func_diagmemoria"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Heap, RSS e memória do sistema',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const m = D.memoria()
    if (m.erro) return reply('❌ ' + m.erro)
    const usoSis = 100 - (m.sistemaLivre / m.sistemaTotal * 100)
    let doc = cab('MEMÓRIA DO PROCESSO', '🧠')
    doc += linha('Heap usado', D.tamanho(m.heapUsado) + ' / ' + D.tamanho(m.heapTotal))
    doc += linha('RSS (total do processo)', D.tamanho(m.rss))
    doc += linha('Externo', D.tamanho(m.externo))
    doc += linha('ArrayBuffers', D.tamanho(m.arrayBuffers))
    doc += linha('Máquina livre', D.tamanho(m.sistemaLivre) + ' de ' + D.tamanho(m.sistemaTotal))
    doc += linha('Uso da máquina', usoSis.toFixed(1) + '%')
    doc += '\n' + barra(m.heapUsado / m.heapTotal)
    return reply(doc)
    }
}
