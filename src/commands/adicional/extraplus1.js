/**
 * Comando .criarsenha — SENHA GERADA
 *
 * Cria uma senha forte e aleatória.
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
    name: 'criarsenha',
    aliases: ["senhanova","cmd_criarsenha","alt_criarsenha","atalho_criarsenha","abrev_criarsenha","call_criarsenha","func_criarsenha"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Cria uma senha forte e aleatória',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const tam = Math.min(64, Math.max(8, parseInt(args[0], 10) || 16))
    const senha = F.gerarSenha({ tamanho: tam })
    const f = F.forcaDaSenha(senha)
    let doc = cab('SENHA GERADA', '🔐')
    doc += '`' + senha + '`\n\n'
    doc += linha('Tamanho', tam + ' caracteres')
    doc += linha('Força', f.nivel + ' (' + Math.round(f.bits) + ' bits)')
    doc += linha('Tempo para quebrar', f.tempo)
    // Senha gerada num grupo é senha que todo o grupo leu. O aviso genérico
    // ("fica no seu histórico") não diz isso, e alguém sai usando assim mesmo.
    doc += '\n' + (isGroup
        ? '🚫 *Não use esta senha.*\nVocê pediu num grupo, então todos os participantes acabaram de vê-la e ela ficou no histórico da conversa.\n\n📩 _Chame no privado e peça de novo, ou troque várias letras antes de usar._'
        : '_Copie e guarde num cofre de senhas. Esta mensagem fica no seu histórico._')
    return reply(doc)
    }
}
