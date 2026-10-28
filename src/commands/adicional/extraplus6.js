/**
 * Comando .gerarpin — PIN NUMÉRICO
 *
 * Gera um PIN só de números.
 */

const F = require('../../services/toolsService')
const Fmt = require('../../utils/formato')

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
    name: 'gerarpin',
    aliases: ["pinaleatorio","cmd_gerarpin","alt_gerarpin","atalho_gerarpin","abrev_gerarpin","call_gerarpin","func_gerarpin"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Gera um PIN só de números',
    usage: '[dígitos]',
    examples: [' — PIN com 6 dígitos', '8 — PIN com 8 dígitos'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const tam = Math.min(12, Math.max(4, parseInt(args[0], 10) || 6))
    const pin = F.gerarCodigo(tam, false)
    return reply(Fmt.tela({
        emoji: '🔢', titulo: 'PIN gerado', prefix,
        intro: '`' + pin + '`',
        secoes: [{ emoji: '🧾', titulo: 'Detalhes', linhas: [
            Fmt.campo('Dígitos', String(tam)),
            Fmt.campo('Combinações possíveis', Math.pow(10, tam).toLocaleString('pt-BR'))
        ] }],
        dica: 'Quanto mais dígitos, mais difícil de adivinhar. Escolha de 4 a 12.',
        proximos: [
            { nome: 'gerarpin', args: '8', oque: 'PIN com 8 dígitos' },
            { nome: 'gerarcodigo', oque: 'código com letras e números' }
        ]
    }))
    }
}
