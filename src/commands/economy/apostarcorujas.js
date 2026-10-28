/**
 * Comando .apostarcorujas — tres corujas, uma guarda o tesouro.
 *
 * Chance real de 1/3 pagando 2,8x (a casa fica com ~7%).
 */

const economy = require('../../services/economyService')

const CORUJAS = ['\u{1F989}', '\u{1F985}', '\u{1F426}']

module.exports = {
    name: 'apostarcorujas',
    aliases: ["corujas","apostacoruja","cmd_apostarcorujas","alt_apostarcorujas","atalho_apostarcorujas","abrev_apostarcorujas","call_apostarcorujas","func_apostarcorujas"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Escolha a coruja que guarda o tesouro: .apostarcorujas <1-3> <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const n = parseInt(args[0], 10)

        if (!Number.isInteger(n) || n < 1 || n > 3) {
            return reply(
                '\u{1F989} *AS TRES CORUJAS*\n\n' +
                '\u{1F4CC} *Uso:* `.apostarcorujas <1-3> <valor>`\n\n' +
                'Uma das tres guarda o tesouro. Acertar paga *2,8x*.\n' +
                '\u{1F4CA} _Chance real: 1 em 3 (33%)_\n\n' +
                '*Exemplo:* `.apostarcorujas 2 1500`'
            )
        }

        const certa = Math.floor(Math.random() * 3) + 1
        const ganhou = n === certa
        const fila = CORUJAS.map((c, i) => (i + 1 === certa ? '\u{1F4B0}' : c)).join('  ')

        const res = economy.resolverAposta({ sender, texto: args[1], ganhou, multiplicador: 2.8 })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: '   \u{1F989} *AS TRES CORUJAS* \u{1F989}   ',
            linhas: [
                `\u{1F3AF} *Voce escolheu:* a ${n}a`,
                `\u{1F50D} *O tesouro estava na:* ${certa}a`,
                `   ${fila}`,
                ganhou ? '\u{1F389} *ACHOU O TESOURO!*' : '\u{1F480} *NINHO VAZIO*'
            ],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou
        }))
    }
}
