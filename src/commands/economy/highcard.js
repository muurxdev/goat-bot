/**
 * Comando .highcard — sua carta contra a da casa, a maior vence.
 *
 * Empate devolve a aposta (multiplicador 1) em vez de o jogador perder: e a
 * regra padrao do jogo e evita a sensacao de roubo.
 */

const economy = require('../../services/economyService')

const VALORES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const NAIPES = ['\u2660\uFE0F', '\u2665\uFE0F', '\u2666\uFE0F', '\u2663\uFE0F']

function sortearCarta() {
    const i = Math.floor(Math.random() * VALORES.length)
    return { forca: i, texto: VALORES[i] + NAIPES[Math.floor(Math.random() * NAIPES.length)] }
}

module.exports = {
    name: 'highcard',
    aliases: ["cartaalta","cartamaior","cmd_highcard","alt_highcard","atalho_highcard","abrev_highcard","call_highcard","func_highcard"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Sua carta contra a da casa, a maior vence: .highcard <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        if (!args[0]) {
            return reply(
                '\u{1F0CF} *HIGH CARD*\n\n' +
                '\u{1F4CC} *Uso:* `.highcard <valor>`\n\n' +
                'Voce e a casa tiram uma carta. A maior vence e paga *2x*.\n' +
                '\u{1F91D} _Empate devolve a aposta._\n\n' +
                '*Exemplo:* `.highcard 5000`'
            )
        }

        const minha = sortearCarta()
        const casa = sortearCarta()
        const empate = minha.forca === casa.forca
        const ganhou = minha.forca > casa.forca

        const res = economy.resolverAposta({
            sender,
            texto: args[0],
            ganhou: ganhou || empate,
            // Empate: multiplicador 1 devolve o valor apostado, delta zero.
            multiplicador: empate ? 1 : 2
        })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: '     \u{1F0CF} *HIGH CARD* \u{1F0CF}     ',
            linhas: [
                `\u{1F464} *Sua carta:* ${minha.texto}`,
                `\u{1F3DB}\uFE0F *Carta da casa:* ${casa.texto}`,
                empate ? '\u{1F91D} *EMPATE \u2014 aposta devolvida*'
                    : (ganhou ? '\u{1F389} *VOCE VENCEU!*' : '\u{1F480} *A CASA VENCEU*')
            ],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou: ganhou || empate
        }))
    }
}
