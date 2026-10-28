/**
 * Comando .campanhaver — DETALHE DA CAMPANHA
 *
 * Mostra tudo sobre uma campanha.
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
    name: 'campanhaver',
    aliases: ["detalhecampanha","cmd_campanhaver","alt_campanhaver","atalho_campanhaver","abrev_campanhaver","call_campanhaver","func_campanhaver"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Mostra tudo sobre uma campanha',
    usage: '<número ou nome>',
    examples: ['1 — detalhes da campanha 1', 'Lançamento — procura pelo nome'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const achado = D.acharCampanha(escopo, args.join(' '))
    if (!achado) return reply(F.tela({
        emoji: '🔎', titulo: args.length ? 'Campanha não encontrada' : 'Qual campanha?', prefix,
        intro: args.length
            ? 'Não achei a campanha "' + args.join(' ') + '". Use o número que aparece na lista ou o nome exato.'
            : 'Diga o número ou o nome da campanha que você quer ver. Mostro formato, situação, envios, alcance e o texto da peça.',
        proximos: [
            { nome: 'campanhas', oque: 'lista as campanhas com os números' },
            { nome: 'campanhaver', args: '1', oque: 'detalhes da campanha 1' }
        ]
    }))
    const c = achado.campanha
    const s = D.SITUACOES[c.situacao] || {}
    let doc = cab(String(c.nome), '📢')
    doc += linha('Formato', D.FORMATOS[c.formato]?.nome || c.formato)
    doc += linha('Situação', (s.emoji || '') + ' ' + (s.nome || c.situacao))
    doc += linha('Criada em', quando(c.criadaEm))
    doc += linha('Envios', String(c.envios || 0))
    doc += linha('Alcance somado', num(c.alcance) + ' pessoas')
    if (c.ultimoEnvio) doc += linha('Último envio', quando(c.ultimoEnvio))
    if (c.texto) doc += '\n📝 *A peça*\n' + c.texto
    else doc += '\n_Sem texto ainda._ `' + prefix + 'campanhatexto ' + (achado.indice + 1) + ' | ...`'
    return reply(doc)
    }
}
