/**
 * Comando .pecarecrutamento — PEÇA: RECRUTAMENTO
 *
 * Modelo e regras de uma peça do tipo Recrutamento.
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
    name: 'pecarecrutamento',
    aliases: ["pecamodelorecrutamento","cmd_pecarecrutamento","alt_pecarecrutamento","atalho_pecarecrutamento","abrev_pecarecrutamento","call_pecarecrutamento","func_pecarecrutamento"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Modelo e regras de uma peça do tipo Recrutamento',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const f = D.FORMATOS['recrutamento']
    let doc = cab('PEÇA: RECRUTAMENTO', '📝')
    doc += linha('Limite', f.limite + ' caracteres')
    doc += linha('Regra de ouro', f.dica)
    const texto = args.join(' ').trim()
    if (texto) {
        const a = D.avaliarPeca(texto, 'recrutamento')
        doc += sep()
        doc += linha('Nota da sua peça', a.nota + '/100')
        if (a.problemas.length) doc += '\\n' + bloco('⚠️ CORRIJA', a.problemas)
        else doc += '\\n🟢 _Sem problemas aparentes._'
    } else {
        doc += '\\n💡 _Cole seu texto depois do comando para eu avaliar._'
    }
    return reply(doc)
    }
}
