/**
 * Comando .campanhatexto — ESCREVER A PEÇA
 *
 * Define o texto de uma campanha.
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
    name: 'campanhatexto',
    aliases: ["editarcampanha","cmd_campanhatexto","alt_campanhatexto","atalho_campanhatexto","abrev_campanhatexto","call_campanhatexto","func_campanhatexto"],
    adminOnly: true,
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Define o texto de uma campanha',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const bruto = args.join(' ')
    if (!bruto.includes('|')) return reply('✏️ 📌 Uso: `' + prefix + 'campanhatexto 1 | o texto da peça`')
    const [ref, ...resto] = bruto.split('|')
    const texto = resto.join('|').trim()
    if (!texto) return reply('❌ O texto está vazio.')
    const r = D.atualizarCampanha(escopo, ref.trim(), { texto })
    if (!r.ok) return reply('❌ ' + r.erro)
    const a = D.avaliarPeca(texto, r.campanha.formato)
    let doc = cab('PEÇA SALVA', '✏️')
    doc += linha('Campanha', r.campanha.nome)
    doc += linha('Nota da peça', a.nota + '/100')
    if (a.problemas.length) doc += '\n' + bloco('⚠️ AJUSTE', a.problemas)
    else doc += '\n🟢 _Peça sem problemas aparentes._'
    return reply(doc)
    }
}
