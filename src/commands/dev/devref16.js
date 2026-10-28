/**
 * Comando .estruturaconjunto — CONJUNTO (SET)
 *
 * Estrutura de dados: Conjunto (set).
 */

const R = require('../../services/devReferenceService')

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
    name: 'estruturaconjunto',
    aliases: ["edconjunto","cmd_estruturaconjunto","alt_estruturaconjunto","atalho_estruturaconjunto","abrev_estruturaconjunto","call_estruturaconjunto","func_estruturaconjunto"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Estrutura de dados: Conjunto (set)',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = R.ESTRUTURAS['conjunto']
    let doc = cab(e.nome.toUpperCase(), '🧱')
    doc += linha('Acesso', e.acesso)
    doc += linha('Busca', e.busca)
    doc += linha('Inserção', e.insercao)
    doc += linha('Remoção', e.remocao)
    doc += sep()
    doc += linha('Use quando', e.quando)
    doc += linha('Cuidado', e.cuidado)
    return reply(doc)
    }
}
