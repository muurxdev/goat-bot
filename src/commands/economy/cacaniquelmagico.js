/**
 * Comando .cacaniquelmagico — caca-niquel de 3 rolos.
 *
 * Tres iguais pagam o valor do simbolo; dois iguais devolvem 1,5x. Os simbolos
 * raros aparecem menos porque entram menos vezes na lista de sorteio.
 */

const economy = require('../../services/economyService')

// Repeticao define a frequencia: a cereja sai muito, o 7 quase nunca.
const ROLO = [
    '\u{1F352}', '\u{1F352}', '\u{1F352}', '\u{1F352}',
    '\u{1F34B}', '\u{1F34B}', '\u{1F34B}',
    '\u{1F514}', '\u{1F514}',
    '\u{1F48E}',
    '7\uFE0F\u20E3'
]

const PREMIO_TRIPLO = {
    '\u{1F352}': 5,
    '\u{1F34B}': 8,
    '\u{1F514}': 15,
    '\u{1F48E}': 40,
    '7\uFE0F\u20E3': 100
}

module.exports = {
    name: 'cacaniquelmagico',
    aliases: ["caniquel","slotmagico","cmd_cacaniquelmagico","alt_cacaniquelmagico","atalho_cacaniquelmagico","abrev_cacaniquelmagico","call_cacaniquelmagico","func_cacaniquelmagico"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Gire o caca-niquel magico: .cacaniquelmagico <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        if (!args[0]) {
            let ajuda = '\u{1F3B0} *CACA-NIQUEL MAGICO*\n\n\u{1F4CC} *Uso:* `.cacaniquelmagico <valor>`\n\n*Tres iguais pagam:*\n'
            for (const [s, m] of Object.entries(PREMIO_TRIPLO)) ajuda += `${s}${s}${s} \u2014 *${m}x*\n`
            ajuda += '\n\u{1F91D} _Dois iguais devolvem 1,5x._\n\n*Exemplo:* `.cacaniquelmagico 1000`'
            return reply(ajuda)
        }

        const giro = [0, 0, 0].map(() => ROLO[Math.floor(Math.random() * ROLO.length)])
        const [a, b, c] = giro

        let mult = 0
        let texto = '\u{1F480} *NADA DESSA VEZ*'
        if (a === b && b === c) {
            mult = PREMIO_TRIPLO[a] || 5
            texto = `\u{1F389} *TRIPLO ${a}! ${mult}x*`
        } else if (a === b || b === c || a === c) {
            mult = 1.5
            texto = '\u2728 *DOIS IGUAIS \u2014 1,5x*'
        }

        const res = economy.resolverAposta({
            sender, texto: args[0], ganhou: mult > 0, multiplicador: mult
        })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: ' \u{1F3B0} *CACA-NIQUEL MAGICO* \u{1F3B0} ',
            linhas: [`\u{1F3AC}  ${giro.join(' \u2502 ')}`, texto],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou: mult > 0
        }))
    }
}
