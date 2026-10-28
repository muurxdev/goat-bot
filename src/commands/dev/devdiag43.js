/**
 * Comando .diagresumo — RESUMO GERAL
 *
 * Panorama de saúde em uma tela só.
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
    name: 'diagresumo',
    aliases: ["diagtudo","diagall","cmd_diagresumo","alt_diagresumo","atalho_diagresumo","abrev_diagresumo","call_diagresumo","func_diagresumo"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Panorama de saúde em uma tela só',
    cooldownMs: 4000,
    execute: async ({ reply, args = [] }) => {
    const m = D.memoria(), t = D.tempoDeVida(), b = D.arquivoDoBanco()
    const r = D.registroDeComandos(), u = D.estatisticasDeUsuarios()
    const laco = await D.atrasoDoLaco(5)
    let doc = cab('RESUMO GERAL', '🩻')
    doc += linha('No ar há', D.duracao(t.processoSegundos))
    doc += linha('Memória', D.tamanho(m.heapUsado) + ' heap / ' + D.tamanho(m.rss) + ' total')
    doc += linha('Atraso do laço', laco.mediaMs.toFixed(2) + ' ms')
    doc += linha('Banco', D.tamanho(b.bytes) + ' (' + String(b.journal).toUpperCase() + ')')
    doc += linha('Comandos', r.comandos + ' (' + r.chaves + ' chaves)')
    doc += linha('Registro', (!r.problemas.length && !r.colisoes.length) ? '🟢 Limpo' : '🟡 Com avisos')
    doc += linha('Usuários', u.registrados + ' registrados de ' + u.total)
    const alertas = []
    if (laco.mediaMs > 50) alertas.push('laço travando')
    if (r.problemas.length) alertas.push(r.problemas.length + ' arquivos com problema')
    if (r.colisoes.length) alertas.push(r.colisoes.length + ' colisões')
    if (m.heapUsado / m.heapTotal > 0.9) alertas.push('memória perto do limite')
    doc += '\n' + (alertas.length ? '🟡 *Atenção:* ' + alertas.join(', ') : '🟢 *Tudo dentro do esperado.*')
    return reply(doc)
    }
}
