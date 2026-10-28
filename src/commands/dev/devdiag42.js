/**
 * Comando .diagvariaveis — VARIÁVEIS DE AMBIENTE
 *
 * Quais variáveis existem — sem revelar valores.
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
    name: 'diagvariaveis',
    aliases: ["diagvars","cmd_diagvariaveis","alt_diagvariaveis","atalho_diagvariaveis","abrev_diagvariaveis","call_diagvariaveis","func_diagvariaveis"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quais variáveis existem — sem revelar valores',
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, args = [] }) => {
    // Só os nomes: revelar valores vazaria chaves e senhas no grupo.
    const nomes = Object.keys(process.env).sort()
    const sensiveis = nomes.filter(n => /KEY|TOKEN|SECRET|PASS|SENHA|CRED/i.test(n))
    let doc = cab('VARIÁVEIS DE AMBIENTE', '🔏')
    doc += linha('Definidas', String(nomes.length))
    doc += linha('Com valor sensível', String(sensiveis.length))
    doc += '\n╭━〔 📋 NOMES 〕━⬣\n'
    for (const n of nomes.slice(0, 30)) {
        doc += '┃ ' + n + (/KEY|TOKEN|SECRET|PASS|SENHA|CRED/i.test(n) ? ' 🔒' : '') + '\n'
    }
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
    doc += '\n_Valores nunca são exibidos: 🔒 marca o que guarda credencial._'
    return reply(doc)
    }
}
