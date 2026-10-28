/**
 * .curio54 — Os lugares mais isolados do planeta
 *
 * Os lugares mais isolados do planeta: 6 fichas consultáveis (Ponto Nemo, Tristão da Cunha, Ilha Bouvet, Pitcairn, Ittoqqortoormiit, Polo euroasiático de inacessibilidade).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "remotos"

module.exports = {
    name: "curio54",
    aliases: ["cmd_curio54","alt_curio54","atalho_curio54","abrev_curio54","call_curio54","func_curio54"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os lugares mais isolados do planeta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["nemo — abre a ficha de ponto nemo","comparar nemo, tristao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio54" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
