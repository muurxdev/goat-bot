/**
 * Comando .campanhasituacao — SITUAÇÃO DA CAMPANHA
 *
 * Ativa, pausa ou encerra uma campanha.
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
    name: 'campanhasituacao',
    aliases: ["statuscampanha","cmd_campanhasituacao","alt_campanhasituacao","atalho_campanhasituacao","abrev_campanhasituacao","call_campanhasituacao","func_campanhasituacao"],
    adminOnly: true,
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Ativa, pausa ou encerra uma campanha',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    if (args.length < 2) {
        return reply('🔄 📌 Uso: `' + prefix + 'campanhasituacao 1 ativa`\n\nSituações: ' + Object.keys(D.SITUACOES).join(', '))
    }
    const situacao = String(args[args.length - 1]).toLowerCase()
    const ref = args.slice(0, -1).join(' ')
    const r = D.atualizarCampanha(escopo, ref, { situacao })
    if (!r.ok) return reply('❌ ' + r.erro)
    const s = D.SITUACOES[r.campanha.situacao]
    return reply('🔄 *' + r.campanha.nome + '* agora está ' + s.emoji + ' *' + s.nome + '*.')
    }
}
