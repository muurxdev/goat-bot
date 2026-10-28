/**
 * Comando .sugerirlugar — ONDE CAÇAR
 *
 * Sugere lugares adequados ao seu nível.
 */

const E = require('../../services/estanciaService')
const dataService = require('../../services/dataService')

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

/** Ficha de um lugar da Estância. */
function fichaLugar(l, prefix, detalhado = true) {
    let doc = cab(l.nome.toUpperCase(), l.bioma.emoji)
    doc += linha('Modo', l.modoEmoji + ' ' + l.modoNome)
    doc += linha('Semente', '`' + l.semente + '`')
    doc += linha('Nível', String(l.nivel))
    doc += linha('Bioma', l.bioma.nome)
    doc += linha('Fenômeno', l.fenomeno.nome + (l.fenomeno.nome !== 'Nenhum' ? ' — ' + l.fenomeno.efeito : ''))
    doc += linha('Perigo', 'x' + l.perigo)
    doc += linha('Riqueza', 'x' + l.riqueza)

    if (detalhado && l.criaturas.length) {
        doc += '\n' + bloco('👾 CRIATURAS', l.criaturas.map(c =>
            c.nome + ' — ' + num(c.hp) + ' HP · ' + num(c.dano) + ' dano · ' + num(c.xp) + ' XP'))
    }
    if (detalhado && l.chefe) {
        doc += '\n' + bloco('👑 GUARDIÃO', [
            l.chefe.nome,
            num(l.chefe.hp) + ' HP · ' + num(l.chefe.dano) + ' dano',
            num(l.chefe.xp) + ' XP · ' + num(l.chefe.moedas) + ' moedas'
        ])
    }
    return doc
}

/** Lista curta, para índices. */
function linhaLugar(l) {
    return '┃ ' + l.bioma.emoji + ' *' + l.nome + '* — nv ' + l.nivel + ' · semente `' + l.semente + '`\n'
}

module.exports = {
    name: 'sugerirlugar',
    aliases: ["ondeircacar"],
    category: 'rpg',
    subcategory: 'Estância',
    description: 'Sugere lugares adequados ao seu nível',
    cooldownMs: 4000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const nivel = Number(user.level) || 1
    const modo = String(args[0] || 'mundo').toLowerCase()
    const chave = E.MODOS[modo] ? modo : 'mundo'
    const achados = E.sugerirPara(nivel, chave, 6)
    let doc = cab('ONDE CAÇAR', '🎯')
    doc += linha('Seu nível', String(nivel))
    doc += linha('Modo', E.MODOS[chave].emoji + ' ' + E.MODOS[chave].nome) + '\n'
    if (!achados.length) return reply(doc + '_Não achei lugar na sua faixa agora. Tente outro modo._')
    for (const l of achados) doc += linhaLugar(l)
    doc += '\n💡 _Viaje com_ `' + prefix + 'partir <semente>`'
    return reply(doc)
    }
}
