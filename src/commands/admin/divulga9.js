/**
 * Comando .campanharesultado — RESULTADO DAS CAMPANHAS
 *
 * Qual campanha rendeu mais alcance.
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
    name: 'campanharesultado',
    aliases: ["resultadocampanhas","cmd_campanharesultado","alt_campanharesultado","atalho_campanharesultado","abrev_campanharesultado","call_campanharesultado","func_campanharesultado"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Qual campanha rendeu mais alcance',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const lista = D.campanhas(escopo).filter(c => c.envios > 0)
    let doc = cab('RESULTADO DAS CAMPANHAS', '📊')
    if (!lista.length) return reply(F.tela({
        emoji: '📊', titulo: 'Resultado das campanhas', prefix,
        intro: 'Nenhuma campanha foi disparada ainda. Quando houver envios anotados, eu comparo as campanhas pelo alcance e somo o total de pessoas.',
        proximos: [
            { nome: 'campanhacriar', args: 'Lançamento | anuncio | texto da peça', oque: 'cria uma campanha' },
            { nome: 'campanhaenvio', args: '1', oque: 'anota o disparo da campanha 1' }
        ]
    }))
    const ord = [...lista].sort((a, b) => (b.alcance || 0) - (a.alcance || 0))
    const maior = ord[0].alcance || 1
    for (const c of ord) {
        doc += '┃ ' + String(c.nome).slice(0, 16).padEnd(17) + '█'.repeat(Math.max(1, Math.round((c.alcance || 0) / maior * 10))) + ' ' + num(c.alcance) + '\n'
    }
    const total = lista.reduce((a, c) => a + (c.alcance || 0), 0)
    doc += '\n' + linha('Alcance somado', num(total) + ' pessoas')
    doc += linha('Envios totais', String(lista.reduce((a, c) => a + (c.envios || 0), 0)))
    return reply(doc)
    }
}
