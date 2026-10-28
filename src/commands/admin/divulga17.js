/**
 * Comando .divulgacaopainel — PAINEL DA DIVULGAÇÃO
 *
 * Tudo da divulgação numa tela.
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
    name: 'divulgacaopainel',
    aliases: ["paineldivulgacao","cmd_divulgacaopainel","alt_divulgacaopainel","atalho_divulgacaopainel","abrev_divulgacaopainel","call_divulgacaopainel","func_divulgacaopainel"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Tudo da divulgação numa tela',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const lista = D.campanhas(escopo)
    const a = D.alcancePotencial()
    const ind = D.rankingIndicacoes(escopo, 999)
    let doc = cab('PAINEL DA DIVULGAÇÃO', '📊')
    doc += linha('Campanhas', String(lista.length))
    doc += linha('Ativas', String(lista.filter(c => c.situacao === 'ativa').length))
    doc += linha('Envios', String(lista.reduce((s, c) => s + (c.envios || 0), 0)))
    doc += linha('Alcance somado', num(lista.reduce((s, c) => s + (c.alcance || 0), 0)))
    doc += sep()
    doc += linha('Grupos alcançáveis', String(a.grupos))
    doc += linha('Pessoas conhecidas', num(a.pessoasConhecidas))
    doc += linha('Indicações', String(ind.reduce((s, x) => s + x.total, 0)))
    return reply(doc)
    }
}
