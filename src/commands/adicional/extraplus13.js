/**
 * Comando .corAleatoria — COR SORTEADA
 *
 * Gera uma cor aleatória com os códigos.
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
    name: 'corAleatoria',
    aliases: ["gerarcor","cmd_coraleatoria","alt_coraleatoria","atalho_coraleatoria","abrev_coraleatoria","call_coraleatoria","func_coraleatoria"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Gera uma cor aleatória com os códigos',
    examples: [' — sorteia uma cor com os códigos'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const c = F.corAleatoria()
    return reply(Fmt.tela({
        emoji: '🎨', titulo: 'Cor sorteada: ' + c.hex, prefix,
        intro: 'Uma cor ' + (c.clara ? 'clara' : 'escura') + ' para usar em arte, convite ou figurinha. Copie o código que seu aplicativo pedir.',
        secoes: [{ emoji: '🧾', titulo: 'Códigos', linhas: [
            Fmt.campo('Hexadecimal', c.hex),
            Fmt.campo('RGB', c.rgb),
            Fmt.campo('Tom', c.clara ? '☀️ Clara' : '🌙 Escura'),
            Fmt.campo('Texto por cima', c.clara ? 'use preto' : 'use branco')
        ] }],
        dica: 'Não gostou? Rode de novo: cada vez sai uma cor diferente.',
        proximos: [
            { nome: 'corAleatoria', oque: 'sorteia outra cor' },
            { nome: 'sortearcor', oque: 'sorteia entre cores com nome' }
        ]
    }))
    }
}
