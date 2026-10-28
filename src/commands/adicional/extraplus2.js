/**
 * Comando .senhasimples — SENHA SEM SÍMBOLOS
 *
 * Senha forte só com letras e números.
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
    name: 'senhasimples',
    aliases: ["senhafacil","cmd_senhasimples","alt_senhasimples","atalho_senhasimples","abrev_senhasimples","call_senhasimples","func_senhasimples"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Senha forte só com letras e números',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const tam = Math.min(64, Math.max(8, parseInt(args[0], 10) || 14))
    const senha = F.gerarSenha({ tamanho: tam, simbolos: false, semAmbiguos: true })
    const f = F.forcaDaSenha(senha)
    let doc = cab('SENHA SEM SÍMBOLOS', '🔓')
    doc += '`' + senha + '`\n\n'
    doc += linha('Força', f.nivel)
    doc += linha('Tempo para quebrar', f.tempo)
    doc += '\n_Sem símbolos e sem caracteres que se confundem (0/O, 1/l). Boa para digitar em outro aparelho._'
    return reply(doc)
    }
}
