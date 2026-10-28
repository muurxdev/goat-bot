/**
 * Comando .forcasenha — FORÇA DA SENHA
 *
 * Avalia quão resistente é uma senha.
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
    name: 'forcasenha',
    aliases: ["medirsenha","cmd_forcasenha","alt_forcasenha","atalho_forcasenha","abrev_forcasenha","call_forcasenha","func_forcasenha"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Avalia quão resistente é uma senha',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const senha = args.join(' ')
    if (!senha) return reply('🛡️ 📌 Uso: `' + prefix + 'forcasenha suaSenhaAqui`\n\n_Prefira testar uma senha parecida, não a real._')
    const f = F.forcaDaSenha(senha)
    let doc = cab('FORÇA DA SENHA', '🛡️')
    doc += linha('Tamanho', senha.length + ' caracteres')
    doc += linha('Conjunto usado', f.alfabeto + ' símbolos possíveis')
    doc += linha('Entropia', Math.round(f.bits) + ' bits')
    doc += linha('Nível', f.nivel)
    doc += linha('Tempo para quebrar', f.tempo)
    doc += '\n' + barra(Math.min(1, f.bits / 100))
    if (f.penalizada) doc += '\n\n🟡 _A nota caiu: há repetição ou sequência óbvia._'
    return reply(doc)
    }
}
