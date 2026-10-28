/**
 * Comando .baccarat — Jogador x Banca, na regra simplificada de 3 cartas.
 *
 * Pontuacao do baccarat: soma das cartas modulo 10, entao 7+8=15 vale 5.
 * Apostar na banca paga 1,95x (nao 2x) porque a banca tem vantagem estatistica
 * — e a comissao real do jogo, nao um numero inventado.
 */

const economy = require('../../services/economyService')

const APOSTAS = {
    jogador: { mult: 2, emoji: '\u{1F464}' },
    banca: { mult: 1.95, emoji: '\u{1F3DB}\uFE0F' },
    empate: { mult: 8, emoji: '\u{1F91D}' }
}

function mao() {
    const cartas = [0, 0, 0].map(() => Math.floor(Math.random() * 10) + 1)
    // No baccarat so o digito das unidades conta.
    return { cartas, total: cartas.reduce((s, c) => s + c, 0) % 10 }
}

module.exports = {
    name: 'baccarat',
    aliases: ["bacara","punto","cmd_baccarat","alt_baccarat","atalho_baccarat","abrev_baccarat","call_baccarat","func_baccarat"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Aposte em jogador, banca ou empate: .baccarat <opcao> <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const escolha = (args[0] || '').toLowerCase()

        if (!APOSTAS[escolha]) {
            let ajuda = '\u{1F3B4} *BACCARAT*\n\n\u{1F4CC} *Uso:* `.baccarat <jogador|banca|empate> <valor>`\n\n'
            for (const [k, v] of Object.entries(APOSTAS)) ajuda += `${v.emoji} *${k}* \u2014 paga ${v.mult}x\n`
            ajuda += '\n_A banca paga menos porque leva vantagem no jogo._\n\n*Exemplo:* `.baccarat banca 3000`'
            return reply(ajuda)
        }

        const j = mao()
        const b = mao()
        const vencedor = j.total > b.total ? 'jogador' : b.total > j.total ? 'banca' : 'empate'
        const ganhou = vencedor === escolha

        const res = economy.resolverAposta({
            sender, texto: args[1], ganhou, multiplicador: APOSTAS[escolha].mult
        })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: '     \u{1F3B4} *BACCARAT* \u{1F3B4}     ',
            linhas: [
                `\u{1F464} *Jogador:* ${j.cartas.join(' + ')} = *${j.total}*`,
                `\u{1F3DB}\uFE0F *Banca:* ${b.cartas.join(' + ')} = *${b.total}*`,
                `\u{1F3C6} *Venceu:* ${APOSTAS[vencedor].emoji} ${vencedor.toUpperCase()}`,
                ganhou ? '\u{1F389} *VOCE ACERTOU!*' : '\u{1F480} *ERROU A APOSTA*'
            ],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou
        }))
    }
}
