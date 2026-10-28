/**
 * .curio71 — O carnaval de cada canto do Brasil
 *
 * O carnaval de cada canto do Brasil: 6 fichas consultáveis (Rio de Janeiro, Salvador, Recife e Olinda, Ouro Preto, São Paulo, Frevo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "carnaval"

module.exports = {
    name: "curio71",
    aliases: ["cmd_curio71","alt_curio71","atalho_curio71","abrev_curio71","call_curio71","func_curio71"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "O carnaval de cada canto do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["rio — abre a ficha de rio de janeiro","comparar rio, salvador — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio71" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
