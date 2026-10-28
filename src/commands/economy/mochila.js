const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatNumber, moedas, plural } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'mochila',
    aliases: ["bag","backpack","cmd_mochila","alt_mochila","atalho_mochila","abrev_mochila","call_mochila","func_mochila"],
    category: 'economy',
    subcategory: 'Itens',
    description: 'Veja quanto cabe na sua mochila e aumente o espaço com .mochila up',
    usage: '[up]',
    examples: [
        ' — mostra o espaço ocupado e o preço da próxima melhoria',
        'up — soma 10 espaços à mochila'
    ],
    execute: async ({ text, sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const capacidade = user.mochila || 20
        const ocupado = user.inventario?.length || 0
        const saldo = user.coins || 0
        const preco = capacidade * 20
        const opcao = (text || '').trim().toLowerCase()

        if (!opcao) {
            const cheia = ocupado >= capacidade
            return reply(F.tela({
                emoji: '🎒',
                titulo: 'Sua mochila',
                intro: cheia
                    ? 'Sua mochila está *cheia*: ' + formatNumber(ocupado) + ' de ' + plural(capacidade, 'espaço', 'espaços') + '. O próximo espólio vai ficar para trás.'
                    : 'Você está usando *' + formatNumber(ocupado) + ' de ' + plural(capacidade, 'espaço', 'espaços') + '*. Ainda cabem ' + formatNumber(capacidade - ocupado) + '.',
                secoes: [
                    { emoji: '📦', titulo: 'Espaço', linhas: [
                        F.campo('Ocupação', F.barra(ocupado / capacidade)),
                        F.campo('Livres', formatNumber(Math.max(0, capacidade - ocupado)))
                    ] },
                    { emoji: '⬆️', titulo: 'Próxima melhoria', linhas: [
                        F.campo('Ganho', '+10 espaços (fica com ' + formatNumber(capacidade + 10) + ')'),
                        F.campo('Preço', moedas(preco)),
                        F.campo('Seu saldo', moedas(saldo) + (saldo >= preco ? '' : ', faltam ' + moedas(preco - saldo)))
                    ] }
                ],
                dica: 'O preço da melhoria cresce junto com a mochila. Para saltos grandes, as mochilas da .shop saem mais em conta.',
                proximos: [
                    { nome: 'mochila', args: 'up', oque: 'somar 10 espaços por ' + moedas(preco) },
                    { nome: 'inv', oque: 'ver os itens que você carrega' },
                    { nome: 'shop', oque: 'ver as mochilas à venda' }
                ],
                prefix
            }))
        }

        if (opcao === 'up') {
            if (saldo < preco) {
                return reply(F.tela({
                    emoji: '🪙',
                    titulo: 'Moedas insuficientes',
                    intro: 'Aumentar a mochila custa *' + moedas(preco) + '* e você tem ' + moedas(saldo) + '. Faltam *' + moedas(preco - saldo) + '*.',
                    secoes: [{ emoji: '🎒', titulo: 'Mochila agora', linhas: [
                        F.campo('Ocupação', F.barra(ocupado / capacidade) + ' (' + formatNumber(ocupado) + ' de ' + formatNumber(capacidade) + ')')
                    ] }],
                    dica: 'Vender espólios libera espaço e ainda rende moedas.',
                    proximos: [
                        { nome: 'vender', args: 'loot', oque: 'vender espólios' },
                        { nome: 'trabalhar', oque: 'ganhar moedas trabalhando' },
                        { nome: 'hunt', oque: 'caçar monstros por moedas' }
                    ],
                    prefix
                }))
            }

            user.coins -= preco
            user.mochila = capacidade + 10
            await dataService.saveXpData(xpData)
            logger.info('[MOCHILA] User ' + sender + ' fez upgrade de mochila para ' + user.mochila)

            return reply(F.tela({
                emoji: '🎒',
                titulo: 'Mochila maior',
                intro: 'Sua mochila cresceu para *' + plural(user.mochila, 'espaço', 'espaços') + '*.',
                secoes: [{ emoji: '📜', titulo: 'Melhoria', linhas: [
                    F.campo('Capacidade', formatNumber(capacidade) + ' → ' + formatNumber(user.mochila)),
                    F.campo('Ocupação', F.barra(ocupado / user.mochila) + ' (' + formatNumber(ocupado) + ' de ' + formatNumber(user.mochila) + ')'),
                    F.campo('Custo', moedas(preco)),
                    F.campo('Saldo', moedas(user.coins)),
                    F.campo('Próxima melhoria', moedas(user.mochila * 20))
                ] }],
                proximos: [
                    { nome: 'hunt', oque: 'voltar a caçar com espaço sobrando' },
                    { nome: 'inv', oque: 'ver sua mochila' }
                ],
                prefix
            }))
        }

        return reply(F.tela({
            emoji: '❌',
            titulo: 'Não entendi',
            intro: '"' + text.trim() + '" não é uma opção da mochila.',
            secoes: [{ emoji: '📜', titulo: 'O que dá para fazer', linhas: [
                '• ' + F.cmd(prefix, 'mochila') + ' — ver o espaço ocupado',
                '• ' + F.cmd(prefix, 'mochila', 'up') + ' — somar 10 espaços por ' + moedas(preco)
            ] }],
            prefix
        }))
    }
}
