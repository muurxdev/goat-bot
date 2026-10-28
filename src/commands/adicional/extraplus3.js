/**
 * Comando .frasesenha — FRASE-SENHA
 *
 * Senha em palavras, fácil de lembrar.
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
    name: 'frasesenha',
    aliases: ["senhafrase","cmd_frasesenha","alt_frasesenha","atalho_frasesenha","abrev_frasesenha","call_frasesenha","func_frasesenha"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Senha em palavras, fácil de lembrar',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const n = Math.min(10, Math.max(3, parseInt(args[0], 10) || 4))
    const frase = F.gerarFraseSenha(n)
    const f = F.forcaDaSenha(frase)
    let doc = cab('FRASE-SENHA', '🗝️')
    doc += '`' + frase + '`\n\n'
    doc += linha('Palavras', String(n))
    doc += linha('Força', f.nivel)
    doc += linha('Tempo para quebrar', f.tempo)
    doc += '\n_Palavras soltas são mais fáceis de lembrar e tão difíceis de quebrar quanto símbolos embaralhados._'
    // Mesma regra do .criarsenha: pedida num grupo, a frase nasce pública.
    if (isGroup) doc += '\n\n🚫 *Não use esta frase como está.*\nVocê pediu num grupo, então todos acabaram de vê-la. Troque pelo menos duas palavras, ou peça outra no privado.'
    return reply(doc)
    }
}
