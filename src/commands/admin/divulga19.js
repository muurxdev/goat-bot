/**
 * Comando .divulgacaoglossario — GLOSSÁRIO DA DIVULGAÇÃO
 *
 * O que cada termo de divulgação significa.
 */

const D = require('../../services/divulgacaoService')

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

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }
function quando(ms) { return ms ? new Date(Number(ms)).toLocaleString('pt-BR').slice(0, 16) : '—' }

/** Escopo da divulgação: o grupo onde o comando foi dado, ou o privado. */
function escopoDe(ctx) {
    return ctx.isGroup ? ctx.from : 'pv:' + String(ctx.sender || '').split('@')[0]
}

function linhaCampanha(c, i) {
    const s = D.SITUACOES[c.situacao] || { emoji: '❔' }
    let t = '┃ ' + (i + 1) + '. ' + s.emoji + ' *' + c.nome + '* _(' + c.formato + ')_\n'
    if (c.envios) t += '┃    ' + c.envios + ' envio(s) · ' + num(c.alcance) + ' pessoas alcançadas\n'
    return t
}
function semCampanhas(prefix) {
    return '_Nenhuma campanha neste ambiente._\n\n📌 Crie a primeira: `' + prefix + 'campanhacriar Lançamento`'
}

module.exports = {
    name: 'divulgacaoglossario',
    aliases: ["termosdivulgacao","cmd_divulgacaoglossario","alt_divulgacaoglossario","atalho_divulgacaoglossario","abrev_divulgacaoglossario","call_divulgacaoglossario","func_divulgacaoglossario"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'O que cada termo de divulgação significa',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    let doc = cab('GLOSSÁRIO DA DIVULGAÇÃO', '📚')
    const termos = [
        ['Campanha', 'um anúncio com nome, texto e histórico de envios'],
        ['Peça', 'o texto que vai ao ar'],
        ['Alcance', 'quantas pessoas o envio pode atingir'],
        ['Chamada para ação', 'a frase que diz o que a pessoa deve fazer'],
        ['Indicação', 'quem trouxe quem, pelo código'],
        ['Rascunho', 'campanha criada mas ainda não disparada']
    ]
    for (const [t, d] of termos) doc += '┃ *' + t + '* — ' + d + '\n'
    return reply(doc)
    }
}
