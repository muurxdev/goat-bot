/**
 * Comando .vasculhar — EXPLORAR
 *
 * Enfrenta uma criatura do lugar onde você está.
 */

const E = require('../../services/estanciaService')
const dataService = require('../../services/dataService')
const Fmt = require('../../utils/formato')

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
    name: 'vasculhar',
    aliases: ["cacarestancia","explorarestancia"],
    category: 'rpg',
    subcategory: 'Estância',
    description: 'Enfrenta uma criatura do lugar onde você está',
    examples: [' — enfrenta uma criatura sorteada do lugar onde você está'],
    cooldownMs: 4000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
    const lugar = E.localDe(user)
    if (!lugar) {
        return reply(Fmt.tela({
            emoji: '🧭',
            titulo: 'Você ainda não viajou',
            intro: 'Para vasculhar, você precisa estar em algum lugar da Estância. Parta primeiro: cada viagem gera um mundo com criaturas e espólios próprios.',
            secoes: [{ emoji: '🗺️', titulo: 'Como começar', linhas: [
                `• ${Fmt.cmd(prefix, 'partir')} — viajar para um lugar sorteado`,
                `• ${Fmt.cmd(prefix, 'sugerirlugar')} — ver lugares bons para o seu nível`
            ] }],
            dica: 'Depois de chegar, cada vasculhada enfrenta uma criatura do lugar.',
            proximos: [
                { nome: 'partir', oque: 'viajar agora' },
                { nome: 'sugerirlugar', oque: 'escolher um lugar do seu nível' }
            ],
            prefix
        }))
    }

    const criatura = E.encontrar(lugar)
    if (!criatura) {
        return reply(Fmt.tela({
            emoji: '🌫️',
            titulo: 'Nada por aqui agora',
            intro: `Você vasculhou *${lugar.nome}* e não encontrou nenhuma criatura desta vez.`,
            proximos: [
                { nome: 'vasculhar', oque: 'procurar de novo' },
                { nome: 'partir', oque: 'viajar para outro lugar' }
            ],
            prefix
        }))
    }

    const { calcularDanoPlayer } = require('../../services/combatEngine')
    const combate = calcularDanoPlayer(user, criatura)
    const poderJogador = (user.level * 35) + combate.danoFinal + Math.floor(Math.random() * 80) + 120
    const poderCriatura = Math.floor(criatura.hp / 20) + criatura.dano + Math.floor(Math.random() * 40)
    const linhasDuelo = [
        Fmt.campo('Local', lugar.nome),
        Fmt.campo('Criatura', criatura.nome),
        Fmt.campo('Poder dela', num(poderCriatura)),
        Fmt.campo('Seu poder', num(poderJogador))
    ]

    if (poderJogador >= poderCriatura) {
        const { adicionarXp } = require('../../services/xpService')
        const { xpGanho } = adicionarXp(user, criatura.xp, { source: 'rpg' })
        user.coins = (user.coins || 0) + criatura.moedas
        user.wins = (user.wins || 0) + 1

        const item = E.sortearLoot(criatura)
        let perdeuLoot = false
        if (item) {
            if (!user.inventario) user.inventario = []
            if (user.inventario.length < (user.mochila || 20)) user.inventario.push(item.nome)
            else perdeuLoot = true
        }
        dataService.saveUser(user)

        return reply(Fmt.tela({
            emoji: lugar.bioma.emoji,
            titulo: 'Criatura vencida',
            intro: `Você derrotou *${criatura.nome}* em ${lugar.nome} e ganhou *+${num(xpGanho)} XP* e *${num(criatura.moedas)} moedas*.`,
            secoes: [
                { emoji: '⚔️', titulo: 'Combate', linhas: linhasDuelo },
                { emoji: '🎁', titulo: 'Recompensas', linhas: [
                    Fmt.campo('XP', '+' + num(xpGanho)),
                    Fmt.campo('Moedas', '+' + num(criatura.moedas)),
                    item ? Fmt.campo('Espólio', perdeuLoot ? `${item.nome}, perdido: mochila cheia` : `${item.nome} (${item.qualidade})`) : Fmt.campo('Espólio', 'nenhum desta vez')
                ] }
            ],
            dica: perdeuLoot ? 'Libere espaço na mochila para não perder os próximos espólios.' : 'Lugares mais difíceis pagam mais, mas as criaturas batem mais forte.',
            proximos: [
                { nome: 'vasculhar', oque: 'enfrentar outra criatura' },
                { nome: 'inv', oque: 'ver sua mochila' }
            ],
            prefix
        }))
    }

    const perda = Math.min(user.coins || 0, Math.floor(criatura.moedas * 0.2))
    user.coins = Math.max(0, (user.coins || 0) - perda)
    user.losses = (user.losses || 0) + 1
    dataService.saveUser(user)
    return reply(Fmt.tela({
        emoji: '💀',
        titulo: 'A criatura venceu',
        intro: `*${criatura.nome}* foi mais forte e você perdeu *${num(perda)} moedas*.`,
        secoes: [{ emoji: '⚔️', titulo: 'Combate', linhas: linhasDuelo }],
        dica: 'Suba de nível ou procure um lugar mais fraco.',
        proximos: [
            { nome: 'sugerirlugar', oque: 'achar um lugar do seu nível' },
            { nome: 'forjar', oque: 'fortalecer seus equipamentos' }
        ],
        prefix
    }))
    }
}
