/**
 * Comando .diagambiente — AMBIENTE DE EXECUÇÃO
 *
 * Plataforma, arquitetura e núcleos da máquina.
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
    name: 'diagambiente',
    aliases: ["diagenv","cmd_diagambiente","alt_diagambiente","atalho_diagambiente","abrev_diagambiente","call_diagambiente","func_diagambiente"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Plataforma, arquitetura e núcleos da máquina',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const a = D.ambiente()
    if (a.erro) return reply('❌ ' + a.erro)
    let doc = cab('AMBIENTE DE EXECUÇÃO', '🖥️')
    doc += linha('Plataforma', a.plataforma + ' / ' + a.arquitetura)
    doc += linha('Núcleos', String(a.nucleos))
    doc += linha('Processador', String(a.modelo).slice(0, 40))
    doc += linha('Modo', a.ambienteNode)
    doc += linha('Usuário', a.usuario)
    return reply(doc)
    }
}
