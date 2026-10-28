/**
 * Comando .topindicacoes — QUEM MAIS TRAZ GENTE
 *
 * Ranking de indicações deste ambiente.
 */

const D = require('../../services/divulgacaoService')
const F = require('../../utils/formato')

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
    name: 'topindicacoes',
    aliases: ["rankingindicacoes","cmd_topindicacoes","alt_topindicacoes","atalho_topindicacoes","abrev_topindicacoes","call_topindicacoes","func_topindicacoes"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Ranking de indicações deste ambiente',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const r = D.rankingIndicacoes(escopo, 10)
    let doc = cab('QUEM MAIS TRAZ GENTE', '🏆')
    if (!r.length) return reply(F.tela({
        emoji: '🏆', titulo: 'Quem mais traz gente', prefix,
        intro: 'Nenhuma indicação registrada ainda. Cada pessoa tem um código; quem entra no grupo e usa esse código conta um ponto para quem indicou.',
        dica: 'Mande seu código junto com o convite do grupo.',
        proximos: [
            { nome: 'meucodigo', oque: 'pega o seu código de indicação' },
            { nome: 'usarcodigo', args: 'ABC123', oque: 'registra quem te trouxe' }
        ]
    }))
    const mencoes = []
    r.forEach((x, i) => {
        mencoes.push(x.jid)
        doc += '┃ ' + (i + 1) + '. +' + String(x.jid).split('@')[0].slice(0, 6) + '**** — ' + x.total + ' indicação(ões)\n'
    })
    return reply(doc, mencoes)
    }
}
