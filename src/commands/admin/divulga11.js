/**
 * Comando .avaliarpeca — AVALIAR A PEÇA
 *
 * Diz o que corrigir num texto de divulgação.
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
    name: 'avaliarpeca',
    aliases: ["analisaranuncio","cmd_avaliarpeca","alt_avaliarpeca","atalho_avaliarpeca","abrev_avaliarpeca","call_avaliarpeca","func_avaliarpeca"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Diz o que corrigir num texto de divulgação',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const bruto = args.join(' ').trim()
    if (!bruto) return reply('🔍 📌 Uso: `' + prefix + 'avaliarpeca <o texto do seu anúncio>`')
    const [talvezFormato] = bruto.split(' ')
    const formato = D.FORMATOS[String(talvezFormato).toLowerCase()] ? String(talvezFormato).toLowerCase() : 'anuncio'
    const texto = formato === 'anuncio' && !D.FORMATOS[String(talvezFormato).toLowerCase()] ? bruto : bruto.replace(talvezFormato, '').trim()
    const a = D.avaliarPeca(texto || bruto, formato)
    let doc = cab('AVALIAR A PEÇA', '🔍')
    doc += linha('Formato', a.formato.nome)
    doc += linha('Nota', a.nota + '/100')
    doc += linha('Tamanho', a.caracteres + ' de ' + a.formato.limite)
    doc += '\n' + barra(a.nota / 100) + '\n'
    if (a.acertos.length) doc += '\n' + bloco('🟢 ESTÁ BOM', a.acertos)
    if (a.problemas.length) doc += '\n' + bloco('⚠️ CORRIJA', a.problemas)
    doc += '\n💡 _' + a.formato.dica + '_'
    return reply(doc)
    }
}
