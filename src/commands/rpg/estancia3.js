/**
 * Comando .meulocal — ONDE VOCÊ ESTÁ
 *
 * Mostra o lugar da Estância onde você está.
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
    name: 'meulocal',
    aliases: ["localatual","meulugar"],
    category: 'rpg',
    subcategory: 'Estância',
    description: 'Mostra o lugar da Estância onde você está',
    cooldownMs: 4000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const lugar = E.localDe(user)
    if (!lugar) return reply('🧭 Você ainda não viajou.\n\n📌 Comece com `' + prefix + 'partir`')
    let doc = fichaLugar(lugar, prefix)
    doc += '\n\n' + linha('Viagens feitas', String(Number(user.estanciaVisitas) || 0))
    return reply(doc)
    }
}
