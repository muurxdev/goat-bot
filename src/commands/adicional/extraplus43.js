/**
 * Comando .extraplusglossario — GLOSSÁRIO DAS FERRAMENTAS
 *
 * O que cada termo destas ferramentas significa.
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
    name: 'extraplusglossario',
    aliases: ["termosferramentas","cmd_extraplusglossario","alt_extraplusglossario","atalho_extraplusglossario","abrev_extraplusglossario","call_extraplusglossario","func_extraplusglossario"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'O que cada termo destas ferramentas significa',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    let doc = cab('GLOSSÁRIO DAS FERRAMENTAS', '📚')
    const termos = [
        ['Entropia', 'quantas tentativas seriam necessárias para adivinhar'],
        ['Frase-senha', 'senha feita de palavras, fácil de lembrar'],
        ['Luminância', 'o quanto uma cor reflete luz — decide o texto por cima'],
        ['Dia útil', 'dia que não cai em sábado nem domingo'],
        ['Feriado móvel', 'feriado cuja data muda todo ano, calculado pela Páscoa'],
        ['Endereço amigável', 'texto sem acento nem espaço, para usar em links']
    ]
    for (const [t, d] of termos) doc += '┃ *' + t + '* — ' + d + '\n'
    return reply(doc)
    }
}
