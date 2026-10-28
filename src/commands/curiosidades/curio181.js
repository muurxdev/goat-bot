/**
 * .curio181 — Os menores vertebrados do mundo
 *
 * Os menores vertebrados do mundo: 6 fichas consultáveis (Rã da Papua-Nova Guiné, Beija-flor-abelha, Morcego-focinho-de-porco, Musaranho-etrusco, Peixe Paedocypris, Camaleão Brookesia nana).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "menoresanimais"

module.exports = {
    name: "curio181",
    aliases: ["cmd_curio181","alt_curio181","atalho_curio181","abrev_curio181","call_curio181","func_curio181"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os menores vertebrados do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["rapapua — abre a ficha de rã da papua-nova guiné","comparar rapapua, beijaflor — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio181" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
