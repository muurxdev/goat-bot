/**
 * .curio232 — A história dos videogames
 *
 * A história dos videogames: 6 fichas consultáveis (Spacewar, Pong, Space Invaders, A quebra de 1983, Super Mario Bros., Tetris).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "videogames"

module.exports = {
    name: "curio232",
    aliases: ["cmd_curio232","alt_curio232","atalho_curio232","abrev_curio232","call_curio232","func_curio232"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A história dos videogames",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["spacewar — abre a ficha de spacewar","comparar spacewar, pong — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio232" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
