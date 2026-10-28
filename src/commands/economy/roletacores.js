/**
 * Comando .roletacores — roleta de cores com odds distintas por cor.
 *
 * Era um stub: anunciava o ganho sem tocar no saldo. As chances aqui sao
 * explicitas e somam 100%, com a casa ficando com ~5%. Vermelho e preto
 * pagam 2x com 47,5% cada; o verde paga 14x com 5%.
 */

const economy = require('../../services/economyService')

const CORES = {
    vermelho: { emoji: '\u{1F534}', chance: 0.475, mult: 2 },
    preto: { emoji: '\u26AB', chance: 0.475, mult: 2 },
    verde: { emoji: '\u{1F7E2}', chance: 0.05, mult: 14 }
}

module.exports = {
    name: 'roletacores',
    aliases: ["roletacor","corroleta","cmd_roletacores","alt_roletacores","atalho_roletacores","abrev_roletacores","call_roletacores","func_roletacores"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Aposta numa cor da roleta: .roletacores <cor> <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const cor = (args[0] || '').toLowerCase()

        if (!CORES[cor]) {
            let ajuda = '\u{1F3A1} *ROLETA DE CORES*\n\n'
            ajuda += '\u{1F4CC} *Uso:* `.roletacores <cor> <valor>`\n\n'
            for (const [nome, c] of Object.entries(CORES)) {
                ajuda += `${c.emoji} *${nome}* \u2014 paga ${c.mult}x _(${(c.chance * 100).toFixed(1)}% de chance)_\n`
            }
            ajuda += '\n*Exemplo:* `.roletacores verde 1000`'
            return reply(ajuda)
        }

        // Sorteia pela faixa de probabilidade acumulada, nao pela cor escolhida.
        const r = Math.random()
        const sorteada = r < CORES.vermelho.chance ? 'vermelho'
            : r < CORES.vermelho.chance + CORES.preto.chance ? 'preto'
                : 'verde'

        const ganhou = sorteada === cor
        const res = economy.resolverAposta({
            sender, texto: args[1], ganhou, multiplicador: CORES[cor].mult
        })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: '   \u{1F3A1} *ROLETA DE CORES* \u{1F3A1}   ',
            linhas: [
                `\u{1F3AF} *Sua cor:* ${CORES[cor].emoji} ${cor.toUpperCase()} _(paga ${CORES[cor].mult}x)_`,
                `\u{1F3A1} *Caiu em:* ${CORES[sorteada].emoji} ${sorteada.toUpperCase()}`,
                ganhou ? '\u{1F389} *ACERTOU!*' : '\u{1F480} *NAO FOI DESSA VEZ*'
            ],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou
        }))
    }
}
