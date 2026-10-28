/**
 * Comando .apostacavalo — corrida com 5 cavalos, cada um com odd propria.
 *
 * O favorito paga pouco e vence muito; o azarao paga alto e raramente vence.
 * As chances somam 100% e os multiplicadores deixam ~6% para a casa.
 */

const economy = require('../../services/economyService')

const CAVALOS = [
    { nome: 'Relampago', emoji: '\u{1F40E}', chance: 0.35, mult: 2.6 },
    { nome: 'Trovao', emoji: '\u{1F3C7}', chance: 0.27, mult: 3.4 },
    { nome: 'Furacao', emoji: '\u{1F434}', chance: 0.20, mult: 4.6 },
    { nome: 'Sombra', emoji: '\u{1F984}', chance: 0.13, mult: 7 },
    { nome: 'Azarao', emoji: '\u{1F41D}', chance: 0.05, mult: 18 }
]

module.exports = {
    name: 'apostacavalo',
    aliases: ["corridacavalo","turfe","cmd_apostacavalo","alt_apostacavalo","atalho_apostacavalo","abrev_apostacavalo","call_apostacavalo","func_apostacavalo"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Aposta num cavalo da corrida: .apostacavalo <1-5> <valor>',
    cooldownMs: 4000,
    execute: async ({ sender, args, reply }) => {
        const n = parseInt(args[0], 10)

        if (!Number.isInteger(n) || n < 1 || n > CAVALOS.length) {
            let ajuda = '\u{1F3C7} *CORRIDA DE CAVALOS*\n\n\u{1F4CC} *Uso:* `.apostacavalo <1-5> <valor>`\n\n'
            CAVALOS.forEach((c, i) => {
                ajuda += `*${i + 1}.* ${c.emoji} ${c.nome} \u2014 paga ${c.mult}x _(${(c.chance * 100).toFixed(0)}%)_\n`
            })
            ajuda += '\n*Exemplo:* `.apostacavalo 5 1000`'
            return reply(ajuda)
        }

        const escolhido = CAVALOS[n - 1]

        // Sorteio ponderado: subtrai a chance de cada um ate zerar.
        let r = Math.random()
        let vencedor = CAVALOS[CAVALOS.length - 1]
        for (const c of CAVALOS) {
            if (r < c.chance) { vencedor = c; break }
            r -= c.chance
        }

        const ganhou = vencedor.nome === escolhido.nome
        const res = economy.resolverAposta({
            sender, texto: args[1], ganhou, multiplicador: escolhido.mult
        })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: '  \u{1F3C7} *CORRIDA DE CAVALOS* \u{1F3C7}  ',
            linhas: [
                `\u{1F3AF} *Seu cavalo:* ${escolhido.emoji} ${escolhido.nome} _(${escolhido.mult}x)_`,
                `\u{1F3C1} *Venceu:* ${vencedor.emoji} ${vencedor.nome}`,
                ganhou ? '\u{1F389} *SEU CAVALO CHEGOU EM PRIMEIRO!*' : '\u{1F480} *SEU CAVALO NAO VENCEU*'
            ],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou
        }))
    }
}
