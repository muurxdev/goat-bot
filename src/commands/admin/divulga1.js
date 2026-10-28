/**
 * Comando .campanhas — CAMPANHAS
 *
 * Todas as campanhas deste ambiente.
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
    name: 'campanhas',
    aliases: ["listacampanhas","cmd_campanhas","alt_campanhas","atalho_campanhas","abrev_campanhas","call_campanhas","func_campanhas"],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Todas as campanhas deste ambiente',
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.' }) => {
        const escopo = escopoDe({ from, isGroup, sender })
    const lista = D.campanhas(escopo)
    let doc = cab('CAMPANHAS', '📢')
    if (!lista.length) return reply(F.tela({
        emoji: '📢', titulo: 'Campanhas', prefix,
        intro: 'Nenhuma campanha criada aqui ainda. Uma campanha guarda o texto da divulgação, a situação (ativa, pausada, encerrada) e quantas pessoas ela alcançou.',
        dica: 'Veja os formatos de peça antes de escrever: cada um tem um tamanho ideal.',
        proximos: [
            { nome: 'campanhacriar', args: 'Lançamento | anuncio | texto da peça', oque: 'cria a primeira campanha' },
            { nome: 'formatospeca', oque: 'formatos de divulgação' },
            { nome: 'divulgacaoajuda', oque: 'todos os comandos de divulgação' }
        ]
    }))
    const ativas = lista.filter(c => c.situacao === 'ativa').length
    doc += linha('Campanhas', String(lista.length))
    doc += linha('Ativas', String(ativas)) + '\n'
    lista.forEach((c, i) => { doc += linhaCampanha(c, i) })
    doc += '\n💡 _Detalhe:_ `' + prefix + 'campanhaver 1`'
    return reply(doc)
    }
}
