const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatNumber } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const GUILD_ITEMS = {
    'espada guilda': { nome: '⚔️ Espada da Guilda', preco: 100, tipo: 'arma', bonus: '+15 Ataque', effect: 'atk' },
    'armadura guilda': { nome: '🛡️ Armadura da Guilda', preco: 150, tipo: 'armadura', bonus: '+15 Defesa', effect: 'def' },
    'pocao guilda': { nome: '🧪 Poção da Guilda', preco: 50, tipo: 'consumivel', bonus: 'Cura 50 HP', effect: 'heal' }
}

/** "120 moedas da guilda". */
const gc = n => `${formatNumber(n || 0)} ${Number(n) === 1 ? 'moeda' : 'moedas'} da guilda`

/** Uma linha por item, com o comando de compra pronto. */
const linhasItens = prefix => Object.entries(GUILD_ITEMS).flatMap(([key, item]) => [
    `• ${item.nome} — ${gc(item.preco)}`,
    `   ${item.bonus} · ${F.cmd(prefix, 'lojaguilda', 'comprar ' + key)}`
])

/** Tela para quem não tem guilda: explica a loja e como entrar numa. */
function telaSemGuilda(prefix) {
    return F.tela({
        emoji: '🏪',
        titulo: 'Loja da guilda',
        intro: 'Esta loja é só para membros de guilda. Você ainda não pertence a nenhuma, então não dá para comprar aqui.',
        secoes: [
            { emoji: '🛒', titulo: 'O que tem à venda', linhas: linhasItens(prefix) },
            { emoji: '🏰', titulo: 'Como entrar numa guilda', linhas: [
                `• ${F.cmd(prefix, 'guerraguilda', 'criar <nome>')} — fundar a sua (5.000 moedas)`,
                `• ${F.cmd(prefix, 'guilda')} — ver as guildas e como participar`
            ] }
        ],
        dica: 'As compras aqui usam moedas da guilda, não as moedas da carteira.',
        proximos: [
            { nome: 'guerraguilda', args: 'criar Pecados Capitais', oque: 'exemplo: fundar a guilda Pecados Capitais' },
            { nome: 'guilda', oque: 'ver as guildas' }
        ],
        prefix
    })
}

module.exports = {
    name: 'lojaguilda',
    aliases: ['guildshop', 'shopguilda', 'lojaclã'],
    category: 'rpg',
    subcategory: 'Economia',
    description: 'Loja exclusiva da guilda: compre itens com as moedas da guilda',
    usage: '[comprar <item> | meus]',
    examples: [
        ' — mostra os itens e o seu saldo da guilda',
        'comprar espada guilda — compra a Espada da Guilda',
        'meus — lista os itens da guilda na sua mochila'
    ],
    cooldownMs: 5000,
    execute: async ({ sender, reply, args, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const sub = (args[0] || '').toLowerCase()

        if (!sub || sub === 'loja' || sub === 'lista') {
            if (!user.guilda) return reply(telaSemGuilda(prefix), [sender])

            return reply(F.tela({
                emoji: '🏪',
                titulo: 'Loja da guilda',
                intro: `Guilda *${user.guilda}* · seu saldo: *${gc(user.guildCoins)}*.`,
                secoes: [{ emoji: '🛒', titulo: 'Itens à venda', linhas: linhasItens(prefix) }],
                dica: 'Copie o comando ao lado do item para comprar.',
                proximos: [
                    { nome: 'lojaguilda', args: 'comprar pocao guilda', oque: 'comprar a poção (cura 50 de vida)' },
                    { nome: 'lojaguilda', args: 'meus', oque: 'ver seus itens da guilda' }
                ],
                prefix
            }), [sender])
        }

        if (sub === 'comprar' || sub === 'buy') {
            if (!user.guilda) return reply(telaSemGuilda(prefix), [sender])

            const itemName = args.slice(1).join(' ').toLowerCase()

            if (!itemName || !GUILD_ITEMS[itemName]) {
                return reply(F.tela({
                    emoji: '❌',
                    titulo: itemName ? 'Não achei esse item' : 'Qual item?',
                    intro: itemName ? `"${args.slice(1).join(' ')}" não está à venda. Escolha um destes:` : 'Diga qual item você quer comprar. Estes estão à venda:',
                    secoes: [{ emoji: '🛒', titulo: 'Itens', linhas: linhasItens(prefix) }],
                    proximos: [{ nome: 'lojaguilda', args: 'comprar espada guilda', oque: 'exemplo de compra' }],
                    prefix
                }))
            }

            const item = GUILD_ITEMS[itemName]
            const guildCoins = user.guildCoins || 0

            if (guildCoins < item.preco) {
                return reply(F.tela({
                    emoji: '🪙',
                    titulo: 'Moedas da guilda insuficientes',
                    intro: `*${item.nome}* custa *${gc(item.preco)}* e você tem ${gc(guildCoins)}. Faltam *${gc(item.preco - guildCoins)}*.`,
                    dica: 'Moedas da guilda vêm das batalhas de guilda.',
                    proximos: [
                        { nome: 'guerraguilda', oque: 'ver as batalhas de guilda' },
                        { nome: 'lojaguilda', oque: 'voltar para a loja' }
                    ],
                    prefix
                }))
            }

            user.guildCoins = guildCoins - item.preco

            if (item.tipo === 'consumivel') {
                const maxHp = user.rpgHpMax || user.hpMax || 100
                user.rpgHp = Math.min(maxHp, (user.rpgHp || user.hp || 100) + 50)
                user.hp = user.rpgHp
            } else {
                if (!user.inventario) user.inventario = []
                user.inventario.push(item.nome)
            }

            await dataService.saveXpData(xpData)
            logger.info(`[LOJAGUILDA] ${sender} comprou ${itemName} da guilda`)

            const consumivel = item.tipo === 'consumivel'
            return reply(F.tela({
                emoji: '🎉',
                titulo: 'Compra realizada',
                intro: consumivel
                    ? `Você comprou e usou *${item.nome}*. Sua vida agora é *${formatNumber(user.rpgHp || user.hp || 100)}*.`
                    : `Você comprou *${item.nome}* e ele foi para a sua mochila.`,
                secoes: [{ emoji: '📜', titulo: 'Compra', linhas: [
                    F.campo('Item', item.nome),
                    F.campo('Bônus', item.bonus),
                    F.campo('Pago', gc(item.preco)),
                    F.campo('Saldo da guilda', gc(user.guildCoins))
                ] }],
                proximos: consumivel
                    ? [{ nome: 'hunt', oque: 'voltar a caçar' }, { nome: 'lojaguilda', oque: 'voltar para a loja' }]
                    : [{ nome: 'lojaguilda', args: 'meus', oque: 'ver seus itens da guilda' }, { nome: 'inv', oque: 'ver sua mochila' }],
                prefix
            }), [sender])
        }

        if (sub === 'meus' || sub === 'inventario') {
            const guildItems = (user.inventario || []).filter(i =>
                Object.values(GUILD_ITEMS).some(gi => gi.nome === i)
            )

            return reply(F.tela({
                emoji: '📦',
                titulo: 'Seus itens da guilda',
                intro: guildItems.length
                    ? `Você carrega *${guildItems.length}* item(ns) da loja da guilda.`
                    : 'Você não tem nenhum item da loja da guilda na mochila.',
                secoes: [
                    { emoji: '🏰', titulo: 'Guilda', linhas: [
                        F.campo('Guilda', user.guilda || 'nenhuma'),
                        F.campo('Saldo da guilda', gc(user.guildCoins))
                    ] },
                    { emoji: '🎒', titulo: 'Na mochila', linhas: F.lista(guildItems) }
                ],
                proximos: [{ nome: 'lojaguilda', oque: 'ver a loja' }],
                prefix
            }), [sender])
        }

        return reply(F.tela({
            emoji: '🏪',
            titulo: 'Loja da guilda',
            intro: `Não conheço a opção "${args[0]}". Veja o que dá para fazer:`,
            secoes: [{ emoji: '📋', titulo: 'Opções', linhas: [
                `• ${F.cmd(prefix, 'lojaguilda')} — ver os itens`,
                `• ${F.cmd(prefix, 'lojaguilda', 'comprar <item>')} — comprar um item`,
                `• ${F.cmd(prefix, 'lojaguilda', 'meus')} — ver seus itens da guilda`
            ] }],
            prefix
        }))
    }
}
