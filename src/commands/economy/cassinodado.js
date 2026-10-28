/**
 * Comando .cassinodado — aposta num numero do dado (1 a 6).
 *
 * Acertar o numero exato paga 5x, com chance real de 1/6. Era um stub que
 * anunciava premio sem mexer no saldo.
 */

const economy = require('../../services/economyService')

const FACES = ['\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685']

module.exports = {
    name: 'cassinodado',
    aliases: ["dadocassino","apostadado","cmd_cassinodado","alt_cassinodado","atalho_cassinodado","abrev_cassinodado","call_cassinodado","func_cassinodado"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Aposta num numero do dado: .cassinodado <1-6> <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const escolha = parseInt(args[0], 10)

        if (!Number.isInteger(escolha) || escolha < 1 || escolha > 6) {
            return reply(
                '\u{1F3B2} *CASSINO DO DADO*\n\n' +
                '\u{1F4CC} *Uso:* `.cassinodado <1-6> <valor>`\n\n' +
                '\u{1F3AF} Acertar o numero exato paga *5x*\n' +
                '\u{1F4CA} _Chance real: 1 em 6 (16,7%)_\n\n' +
                '*Exemplo:* `.cassinodado 4 2000`'
            )
        }

        const rolou = Math.floor(Math.random() * 6) + 1
        const ganhou = rolou === escolha

        const res = economy.resolverAposta({ sender, texto: args[1], ganhou, multiplicador: 5 })
        if (!res.ok) return reply(res.erro)

        return reply(economy.cartaoResultado({
            titulo: '   \u{1F3B2} *CASSINO DO DADO* \u{1F3B2}   ',
            linhas: [
                `\u{1F3AF} *Voce apostou no:* ${escolha}`,
                `\u{1F3B2} *O dado caiu em:* ${FACES[rolou - 1]} ${rolou}`,
                ganhou ? '\u{1F389} *NA MOSCA! 5x*' : '\u{1F480} *ERROU*'
            ],
            valor: res.valor, delta: res.delta, saldo: res.saldo, ganhou
        }))
    }
}
