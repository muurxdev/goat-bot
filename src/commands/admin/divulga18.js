/**
 * Comando .divulgacaoajuda — GUIA DA DIVULGAÇÃO
 *
 * Todos os comandos de divulgação.
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
    name: 'divulgacaoajuda',
    aliases: ["guiadivulgacao","cmd_divulgacaoajuda","alt_divulgacaoajuda","atalho_divulgacaoajuda","abrev_divulgacaoajuda","call_divulgacaoajuda","func_divulgacaoajuda"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Todos os comandos de divulgação',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    let doc = cab('GUIA DA DIVULGAÇÃO', '🗺️')
    doc += bloco('📢 CAMPANHAS', [
        '`' + prefix + 'campanhacriar` · `' + prefix + 'campanhas`',
        '`' + prefix + 'campanhatexto` · `' + prefix + 'campanhaver`',
        '`' + prefix + 'campanhaenvio` · `' + prefix + 'campanharesultado`'
    ])
    doc += '\n' + bloco('🔍 ANTES DE POSTAR', [
        '`' + prefix + 'avaliarpeca <texto>` — o que corrigir',
        '`' + prefix + 'formatospeca` — tamanho de cada tipo',
        '`' + prefix + 'melhorhorario` · `' + prefix + 'alcance`'
    ])
    doc += '\n' + bloco('🤝 INDICAÇÃO', [
        '`' + prefix + 'meucodigo` · `' + prefix + 'usarcodigo`',
        '`' + prefix + 'topindicacoes`'
    ])
    return reply(doc)
    }
}
