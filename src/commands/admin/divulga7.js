/**
 * Comando .campanhaenvio — REGISTRAR ENVIO
 *
 * Anota que a campanha foi disparada.
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
    name: 'campanhaenvio',
    aliases: ["registrarenvio","cmd_campanhaenvio","alt_campanhaenvio","atalho_campanhaenvio","abrev_campanhaenvio","call_campanhaenvio","func_campanhaenvio"],
    adminOnly: true,
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Anota que a campanha foi disparada',
    usage: '<número ou nome>',
    examples: ['1 — anota o envio da campanha 1', 'Lançamento — pelo nome'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    if (!args.length) return reply(F.tela({
        emoji: '📨', titulo: 'Anotar envio de campanha', prefix,
        intro: 'Depois de divulgar, anote o envio: eu somo à campanha o alcance dos grupos onde estou.',
        secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'campanhaenvio', '<número ou nome>')] }],
        proximos: [
            { nome: 'campanhaenvio', args: '1', oque: 'anota o envio da campanha 1' },
            { nome: 'campanhas', oque: 'lista as campanhas com os números' }
        ]
    }))
    const alcance = D.alcancePotencial()
    const r = D.registrarEnvio(escopo, args.join(' '), { grupos: alcance.grupos, pessoas: alcance.pessoasConhecidas })
    if (!r.ok) return reply('❌ ' + r.erro + '\n\n📌 Veja os números na lista: `' + prefix + 'campanhas`')
    let doc = cab('ENVIO REGISTRADO', '📨')
    doc += linha('Campanha', r.campanha.nome)
    doc += linha('Envios', String(r.campanha.envios))
    doc += linha('Grupos alcançáveis', String(alcance.grupos))
    doc += linha('Alcance somado', num(r.campanha.alcance) + ' pessoas')
    return reply(doc)
    }
}
