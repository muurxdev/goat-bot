/**
 * .curio90 — As grandes rodovias brasileiras
 *
 * As grandes rodovias brasileiras: 6 fichas consultáveis (BR-116, BR-101, Transamazônica, a BR-230, BR-319, Sistema Anchieta-Imigrantes, Estrada Real).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "estradasbr"

module.exports = {
    name: "curio90",
    aliases: ["cmd_curio90","alt_curio90","atalho_curio90","abrev_curio90","call_curio90","func_curio90"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "As grandes rodovias brasileiras",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["br116 — abre a ficha de br-116","comparar br116, br101 — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio90" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
