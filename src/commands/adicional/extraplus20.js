/**
 * Comando .listaferiados — FERIADOS NACIONAIS
 *
 * Lista os feriados do ano.
 */

const F = require('../../services/toolsService')

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

function itensDe(args) {
    return (args || []).join(' ').split(/[;,\n]| \| /).map(s => s.trim()).filter(Boolean)
}
function pedeItens(prefix, cmd) {
    return '📋 *Informe as opções separadas por vírgula.*\n\n📌 Exemplo: `' + prefix + cmd + ' pizza, hambúrguer, sushi`'
}
function dataOuHoje(txt) {
    const d = F.lerData(txt)
    return d && !isNaN(d.getTime()) ? d : null
}
function fmt(d) { return d.toLocaleDateString('pt-BR') }

module.exports = {
    name: 'listaferiados',
    aliases: ["feriadosano","cmd_listaferiados","alt_listaferiados","atalho_listaferiados","abrev_listaferiados","call_listaferiados","func_listaferiados"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Lista os feriados do ano',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const ano = parseInt(args[0], 10) || new Date().getFullYear()
    if (ano < 1900 || ano > 2200) return reply('🇧🇷 Informe um ano entre 1900 e 2200.')
    const lista = F.feriados(ano)
    let doc = cab('FERIADOS DE ' + ano, '🇧🇷')
    for (const [data, nome] of lista) doc += '┃ ' + data + ' — ' + nome + '\n'
    doc += '\n_Inclui os móveis calculados a partir da Páscoa._'
    return reply(doc)
    }
}
