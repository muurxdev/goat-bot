const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatNumber, moedas, plural } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const lojaItens = {
    'vip dev': { nome: 'VIP DEV', preco: 500 },
    'react master': { nome: 'React Master', preco: 1000 },
    'node wizard': { nome: 'Node Wizard', preco: 1500 },
    'full stack': { nome: 'Full Stack', preco: 2000 },
    'mochila pequena': { nome: '🎒 Mochila Pequena', preco: 500, espaco: 10 },
    'mochila media': { nome: '🎒 Mochila Média', preco: 1200, espaco: 25 },
    'mochila grande': { nome: '🎒 Mochila Grande', preco: 2500, espaco: 50 },
    'mochila lendaria': { nome: '🎒 Mochila Lendária', preco: 5000, espaco: 100 }
}

/** "Mochila Média" e "mochila media" chegam na mesma chave. */
const chaveDe = t => String(t || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ').trim()

/** Uma linha por item da loja, com o comando pronto. */
const linhaItem = (prefix, saldo) => ([chave, p]) =>
    '• ' + F.cmd(prefix, 'buy', chave) + ' — ' + p.nome + ', ' + moedas(p.preco) +
    (p.espaco ? ' (+' + plural(p.espaco, 'espaço', 'espaços') + ')' : '') +
    (saldo >= p.preco ? '' : ' · _faltam ' + formatNumber(p.preco - saldo) + '_')

module.exports = {
    name: 'buy',
    aliases: ["comprar","cmd_buy","alt_buy","atalho_buy","abrev_buy","call_buy","func_buy"],
    category: 'economy',
    subcategory: 'Mercado',
    description: 'Compre um item da loja (veja em .shop)',
    usage: '<nome do item>',
    examples: [
        'mochila pequena — soma 10 espaços à sua mochila',
        'mochila lendaria — soma 100 espaços',
        'vip dev — compra o título VIP DEV'
    ],
    execute: async ({ text, sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!Number.isFinite(user.coins) || user.coins < 0) {
            user.coins = 0
        }

        const entradas = Object.entries(lojaItens)

        if (!text || !text.trim()) {
            return reply(F.tela({
                emoji: '🛒',
                titulo: 'Comprar na loja',
                intro: 'Seu saldo: *' + moedas(user.coins) + '*. Diga o nome do item e ele vai direto para você.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'buy', '<nome do item>')] },
                    { emoji: '📜', titulo: 'Itens à venda', linhas: entradas.map(linhaItem(prefix, user.coins)) }
                ],
                proximos: [
                    { nome: 'shop', oque: 'ver a loja organizada' },
                    { nome: 'mochila', oque: 'ver o espaço da sua mochila' }
                ],
                prefix
            }))
        }

        const produto = lojaItens[chaveDe(text)]
        if (!produto) {
            return reply(F.tela({
                emoji: '❌',
                titulo: 'Não achei esse item',
                intro: '"' + text.trim() + '" não está à venda na loja. Use um dos nomes abaixo, por exemplo ' + F.cmd(prefix, 'buy', 'mochila pequena') + '.',
                secoes: [{ emoji: '📜', titulo: 'Itens à venda', linhas: entradas.map(linhaItem(prefix, user.coins)) }],
                dica: 'Armas e armaduras ficam em outras lojas: .shoparmas e .shoparmaduras.',
                proximos: [
                    { nome: 'shop', oque: 'ver a loja' },
                    { nome: 'shoparmas', oque: 'ver o arsenal de armas' }
                ],
                prefix
            }))
        }

        if (user.coins < produto.preco) {
            return reply(F.tela({
                emoji: '🪙',
                titulo: 'Moedas insuficientes',
                intro: '*' + produto.nome + '* custa *' + moedas(produto.preco) + '* e você tem ' + moedas(user.coins) + '. Faltam *' + moedas(produto.preco - user.coins) + '*.',
                secoes: [{ emoji: '📜', titulo: 'O item', linhas: [
                    F.campo('Preço', moedas(produto.preco)),
                    produto.espaco ? F.campo('Efeito', '+' + plural(produto.espaco, 'espaço', 'espaços') + ' na mochila') : null
                ] }],
                dica: produto.espaco ? 'O comando .mochila up também aumenta o espaço, em passos de 10.' : '',
                proximos: [
                    { nome: 'trabalhar', oque: 'ganhar moedas trabalhando' },
                    { nome: 'hunt', oque: 'caçar monstros por moedas' },
                    { nome: 'daily', oque: 'pegar a recompensa do dia' }
                ],
                prefix
            }))
        }

        if (produto.espaco) {
            const antes = user.mochila || 20
            user.coins -= produto.preco
            user.mochila = antes + produto.espaco
            await dataService.saveXpData(xpData)
            logger.info('[SHOP] User ' + sender + ' comprou ' + produto.nome)

            const ocupado = Array.isArray(user.inventario) ? user.inventario.length : 0
            return reply(F.tela({
                emoji: '🎒',
                titulo: 'Mochila maior',
                intro: 'Você comprou a *' + produto.nome + '* e ganhou *+' + plural(produto.espaco, 'espaço', 'espaços') + '*.',
                secoes: [{ emoji: '📜', titulo: 'Compra', linhas: [
                    F.campo('Capacidade', formatNumber(antes) + ' → ' + plural(user.mochila, 'espaço', 'espaços')),
                    F.campo('Ocupação', F.barra(ocupado / user.mochila) + ' (' + formatNumber(ocupado) + ' de ' + formatNumber(user.mochila) + ')'),
                    F.campo('Preço', moedas(produto.preco)),
                    F.campo('Saldo', moedas(user.coins))
                ] }],
                proximos: [
                    { nome: 'hunt', oque: 'encher a mochila de espólios' },
                    { nome: 'inv', oque: 'ver o que você carrega' }
                ],
                prefix
            }))
        }

        if (!user.inventario) user.inventario = []
        const capacidade = user.mochila || 20
        if (user.inventario.length >= capacidade) {
            return reply(F.tela({
                emoji: '🎒',
                titulo: 'Mochila cheia',
                intro: 'Não cabe *' + produto.nome + '*: sua mochila está com ' + formatNumber(user.inventario.length) + ' de ' + plural(capacidade, 'espaço', 'espaços') + '. Não cobrei nada.',
                secoes: [{ emoji: '📦', titulo: 'Espaço', linhas: [F.campo('Ocupação', F.barra(user.inventario.length / capacidade))] }],
                dica: 'Mochilas não ocupam espaço: compre uma e depois volte para este item.',
                proximos: [
                    { nome: 'vender', args: 'loot', oque: 'vender espólios para liberar espaço' },
                    { nome: 'buy', args: 'mochila pequena', oque: 'somar 10 espaços' },
                    { nome: 'bau', args: 'guardar <item>', oque: 'guardar um item no baú' }
                ],
                prefix
            }))
        }

        user.coins -= produto.preco
        user.inventario.push(produto.nome)
        await dataService.saveXpData(xpData)
        logger.info('[SHOP] User ' + sender + ' comprou ' + produto.nome)

        return reply(F.tela({
            emoji: '🛒',
            titulo: 'Compra feita',
            intro: 'Você comprou *' + produto.nome + '* por ' + moedas(produto.preco) + '. O item já está na sua mochila.',
            secoes: [{ emoji: '📜', titulo: 'Compra', linhas: [
                F.campo('Preço', moedas(produto.preco)),
                F.campo('Saldo', moedas(user.coins)),
                F.campo('Mochila', formatNumber(user.inventario.length) + ' de ' + plural(capacidade, 'espaço', 'espaços'))
            ] }],
            proximos: [
                { nome: 'inv', oque: 'ver sua mochila' },
                { nome: 'shop', oque: 'voltar para a loja' }
            ],
            prefix
        }))
    }
}

// Catálogo compartilhado com .shop, fora das chaves do schema do comando.
Object.defineProperty(module.exports, 'lojaItens', { value: lojaItens, enumerable: false })
