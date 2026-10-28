/**
 * .curio4 — Os oceanos e os mares do planeta
 *
 * Os oceanos e os mares do planeta: 6 fichas consultáveis (Oceano Pacífico, Oceano Atlântico, Oceano Índico, Oceano Antártico, Oceano Ártico, Fossa das Marianas).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "oceanos"

module.exports = {
    name: "curio4",
    aliases: ["cmd_curio4","alt_curio4","atalho_curio4","abrev_curio4","call_curio4","func_curio4"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os oceanos e os mares do planeta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["pacifico — abre a ficha de oceano pacífico","comparar pacifico, atlantico — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio4" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
