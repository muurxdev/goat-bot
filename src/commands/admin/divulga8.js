/**
 * Comando .campanhahistorico — HISTÓRICO DE ENVIOS
 *
 * Todos os disparos registrados.
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
    name: 'campanhahistorico',
    aliases: ["historicoenvios","cmd_campanhahistorico","alt_campanhahistorico","atalho_campanhahistorico","abrev_campanhahistorico","call_campanhahistorico","func_campanhahistorico"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Todos os disparos registrados',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const h = D.historico(escopo)
    let doc = cab('HISTÓRICO DE ENVIOS', '📚')
    if (!h.length) return reply(F.tela({
        emoji: '📚', titulo: 'Histórico de envios', prefix,
        intro: 'Nenhum envio registrado ainda. Cada vez que você anota o disparo de uma campanha, ele aparece aqui com data, grupos alcançados e pessoas.',
        dica: 'Depois de mandar a divulgação nos grupos, anote o envio para o alcance ser somado.',
        proximos: [
            { nome: 'campanhas', oque: 'vê as campanhas e seus números' },
            { nome: 'campanhaenvio', args: '1', oque: 'anota o envio da campanha 1' }
        ]
    }))
    doc += linha('Registros', String(h.length)) + '\n'
    for (const e of h.slice(0, 15)) {
        doc += '┃ ' + quando(e.em) + ' · ' + e.campanha + '\n┃    ' + e.grupos + ' grupos · ' + num(e.pessoas) + ' pessoas\n'
    }
    return reply(doc)
    }
}
