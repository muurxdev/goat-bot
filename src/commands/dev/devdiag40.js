/**
 * Comando .diagsistema — INFORMAÇÕES DA MÁQUINA
 *
 * Sistema, memória e carga da máquina.
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
    name: 'diagsistema',
    aliases: ["diagos","cmd_diagsistema","alt_diagsistema","atalho_diagsistema","abrev_diagsistema","call_diagsistema","func_diagsistema"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Sistema, memória e carga da máquina',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const a = D.ambiente(), m = D.memoria(), t = D.tempoDeVida()
    let doc = cab('INFORMAÇÕES DA MÁQUINA', '🏗️')
    doc += linha('Sistema', a.plataforma + ' ' + a.arquitetura)
    doc += linha('Processador', String(a.modelo).slice(0, 36))
    doc += linha('Núcleos', String(a.nucleos))
    doc += linha('Memória total', D.tamanho(m.sistemaTotal))
    doc += linha('Memória livre', D.tamanho(m.sistemaLivre))
    doc += linha('Máquina no ar há', D.duracao(t.maquinaSegundos))
    return reply(doc)
    }
}
