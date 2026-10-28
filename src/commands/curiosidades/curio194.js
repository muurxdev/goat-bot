/**
 * .curio194 — Lobos, raposas e parentes
 *
 * Lobos, raposas e parentes: 6 fichas consultáveis (Lobo-cinzento, Raposa-vermelha, Lobo-guará, Licaão, Coiote, Cachorro-do-mato).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "canideos"

module.exports = {
    name: "curio194",
    aliases: ["cmd_curio194","alt_curio194","atalho_curio194","abrev_curio194","call_curio194","func_curio194"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Lobos, raposas e parentes",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["lobo — abre a ficha de lobo-cinzento","comparar lobo, raposa — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio194" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
