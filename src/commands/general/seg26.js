/**
 * Comando .praticasseguranca — SEGURANÇA DIGITAL
 *
 * As práticas que protegem, ordenadas por impacto.
 */

const D = require('../../services/digitalSafetyService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}


module.exports = {
    name: 'praticasseguranca',
    aliases: ["segurancadigital","protegerconta"],
    category: 'general',
    subcategory: 'Segurança Digital',
    description: 'As práticas que protegem, ordenadas por impacto',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', isGroup, prefix = '.' }) => {
    const ordem = { 'altíssimo': 0, 'alto': 1, 'médio': 2, 'variável': 3 }
    const lista = Object.entries(D.CONCEITOS).sort((a, b) => (ordem[a[1].impacto] ?? 9) - (ordem[b[1].impacto] ?? 9))
    let doc = cab('SEGURANÇA DIGITAL', '🛡️')
    doc += linha('Práticas', String(lista.length)) + '\n'
    for (const [k, c] of lista) {
        doc += '┃ *' + c.nome + '*\n┃    proteção ' + c.impacto + ' · trabalho ' + c.dificuldade + '\n┃    `' + prefix + 'pratica' + k + '`\n'
    }
    doc += '\n🎯 *Se for fazer só três coisas*\n'
    doc += '┃ 1. Verificação em duas etapas no e-mail e no aplicativo de mensagem\n'
    doc += '┃ 2. Senha diferente em cada serviço\n'
    doc += '┃ 3. Sistema sempre atualizado\n\n'
    doc += '🚨 _Já aconteceu algo?_ `' + prefix + 'emergenciadigital`'
    return reply(doc)
    }
}
