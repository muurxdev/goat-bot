const dataService = require('../../services/dataService')
const { moedas, plural } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')
const { lojaItens } = require('./buy')

module.exports = {
    name: 'shop',
    aliases: ["loja","cmd_shop","alt_shop","atalho_shop","abrev_shop","call_shop","func_shop"],
    category: 'economy',
    subcategory: 'Mercado',
    description: 'Mostra a loja de títulos e mochilas, com preço e comando de compra',
    examples: [' — mostra os itens à venda, seu saldo e o comando pronto para comprar'],
    execute: async ({ sender, reply, prefix = '.' }) => {
        let saldo = 0
        let capacidade = 20
        try {
            const user = dataService.getUser(sender)
            if (user) {
                saldo = Number.isFinite(user.coins) && user.coins > 0 ? user.coins : 0
                capacidade = user.mochila || 20
            }
        } catch (e) {
            logger.warn('[SHOP] Não consegui ler o saldo de ' + sender + ': ' + (e && e.message))
        }

        const entradas = Object.entries(lojaItens)
        const linhaDe = ([chave, p]) => {
            const cabe = saldo >= p.preco ? '' : ' · _faltam ' + moedas(p.preco - saldo) + '_'
            const extra = p.espaco ? '+' + plural(p.espaco, 'espaço', 'espaços') + ' na mochila · ' : ''
            return [
                '• *' + p.nome + '* — ' + moedas(p.preco) + cabe,
                '   ' + extra + F.cmd(prefix, 'buy', chave)
            ]
        }
        const titulos = entradas.filter(([, p]) => !p.espaco).flatMap(linhaDe)
        const mochilas = entradas.filter(([, p]) => p.espaco).flatMap(linhaDe)
        const acessivel = entradas.filter(([, p]) => p.preco <= saldo).sort((a, b) => b[1].preco - a[1].preco)[0]

        await reply(F.tela({
            emoji: '🛒',
            titulo: 'Loja da taverna',
            intro: 'Seu saldo: *' + moedas(saldo) + '*. Sua mochila tem *' + plural(capacidade, 'espaço', 'espaços') + '*.',
            secoes: [
                { emoji: '🏅', titulo: 'Títulos de coleção', linhas: titulos },
                { emoji: '🎒', titulo: 'Mochilas', linhas: mochilas }
            ],
            dica: 'Mochilas somam espaço à que você já tem. Títulos ocupam um espaço da mochila.',
            proximos: [
                acessivel ? { nome: 'buy', args: acessivel[0], oque: 'comprar ' + acessivel[1].nome } : { nome: 'trabalhar', oque: 'ganhar moedas trabalhando' },
                { nome: 'mochila', oque: 'ver o espaço ocupado' },
                { nome: 'shoparmas', oque: 'ver o arsenal de armas' }
            ],
            prefix
        }))
    }
}
