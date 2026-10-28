/**
 * Comando .cartacuringa — tira uma carta do baralho; o premio depende dela.
 *
 * Diferente dos outros: nao e aposta binaria, e uma tabela de premios. Cartas
 * baixas devolvem menos que a aposta (prejuizo parcial), o Curinga paga 10x.
 */

const economy = require('../../services/economyService')

// Faixas cumulativas: cada entrada vale ate o seu `ate`.
const TABELA = [
    { ate: 0.40, nome: 'Carta baixa', emoji: '\u{1F0A2}', mult: 0 },
    { ate: 0.70, nome: 'Carta media', emoji: '\u{1F0A7}', mult: 1 },
    { ate: 0.88, nome: 'Figura', emoji: '\u{1F0AB}', mult: 2 },
    { ate: 0.97, nome: 'As', emoji: '\u{1F0A1}', mult: 4 },
    { ate: 1.00, nome: 'CURINGA', emoji: '\u{1F0CF}', mult: 10 }
]

module.exports = {
    name: 'cartacuringa',
    aliases: ["curinga","joker","cmd_cartacuringa","alt_cartacuringa","atalho_cartacuringa","abrev_cartacuringa","call_cartacuringa","func_cartacuringa"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Tire uma carta e ganhe conforme a tabela: .cartacuringa <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        if (!args[0]) {
            let ajuda = '\u{1F0CF} *CARTA CURINGA*\n\n\u{1F4CC} *Uso:* `.cartacuringa <valor>`\n\n*Tabela de premios:*\n'
            let anterior = 0
            for (const t of TABELA) {
                const chance = ((t.ate - anterior) * 100).toFixed(0)
                ajuda += `${t.emoji} ${t.nome} \u2014 ${t.mult}x _(${chance}%)_\n`
                anterior = t.ate
            }
            ajuda += '\n*Exemplo:* `.cartacuringa 2000`'
            return reply(ajuda)
        }

        const r = Math.random()
        const carta = TABELA.find(t => r < t.ate) || TABELA[TABELA.length - 1]

        const res = economy.resolverAposta({
            sender,
            texto: args[0],
            // mult 0 = perde tudo; qualquer coisa acima devolve pelo menos a aposta.
            ganhou: carta.mult > 0,
            multiplicador: carta.mult
        })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: '   \u{1F0CF} *CARTA CURINGA* \u{1F0CF}   ',
            linhas: [
                `\u{1F3B4} *Voce tirou:* ${carta.emoji} *${carta.nome}*`,
                `\u2716\uFE0F *Multiplicador:* ${carta.mult}x`,
                carta.mult >= 4 ? '\u{1F389} *QUE SORTE!*'
                    : carta.mult > 1 ? '\u{1F44D} *LUCRO*'
                        : carta.mult === 1 ? '\u{1F91D} *EMPATE*' : '\u{1F480} *PERDEU*'
            ],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou: carta.mult > 0
        }))
    }
}
