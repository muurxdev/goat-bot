/**
 * Comando .diagescopos — AMBIENTES CONFIGURADOS
 *
 * Grupos e PVs com configuração própria.
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
    name: 'diagescopos',
    aliases: ["diagambientes","cmd_diagescopos","alt_diagescopos","atalho_diagescopos","abrev_diagescopos","call_diagescopos","func_diagescopos"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Grupos e PVs com configuração própria',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    const e = D.escoposConfigurados()
    if (e.erro) return reply('❌ ' + e.erro)
    let doc = cab('AMBIENTES CONFIGURADOS', '🌐')
    doc += linha('Ambientes com config', String(e.ambientes))
    doc += linha('Com Domínios ligados', String(e.comDominios))
    doc += '\n╭━〔 📋 AMOSTRA 〕━⬣\n'
    for (const x of e.porEscopo.slice(0, 15)) {
        doc += '┃ ' + String(x.escopo).split('@')[0].slice(0, 20).padEnd(22) + x.opcoes + ' opções\n'
    }
    doc += '╰━━━━━━━━━━━━━━━━━━⬣'
    return reply(doc)
    }
}
