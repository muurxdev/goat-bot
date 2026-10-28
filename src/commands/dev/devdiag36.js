/**
 * Comando .diagdns — RESOLUÇÃO DE NOMES
 *
 * Verifica se a tradução de endereços funciona.
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
    name: 'diagdns',
    aliases: ["diagresolver","cmd_diagdns","alt_diagdns","atalho_diagdns","abrev_diagdns","call_diagdns","func_diagdns"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Verifica se a tradução de endereços funciona',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const alvo = (args[0] || 'google.com').replace(/^https?:\/\//, '').split('/')[0]
    const r = await D.resolverNome(alvo)
    let doc = cab('RESOLUÇÃO DE NOMES', '🧭')
    doc += linha('Nome consultado', r.nome)
    doc += linha('Resultado', r.ok ? '🟢 Resolvido' : '🔴 Falhou')
    if (r.ok) {
        doc += linha('Tempo', r.ms + ' ms')
        doc += '\n╭━〔 📍 ENDEREÇOS 〕━⬣\n'
        for (const e of r.enderecos) doc += '┃ ' + e + '\n'
        doc += '╰━━━━━━━━━━━━━━━━━━⬣'
    } else doc += linha('Falha', r.erro)
    return reply(doc)
    }
}
