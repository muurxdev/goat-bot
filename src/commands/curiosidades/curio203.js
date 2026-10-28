/**
 * .curio203 — Formigas e cupins
 *
 * Formigas e cupins: 6 fichas consultáveis (Saúva, Formiga-de-correição, Formiga-lava-pés, Tocandira, Cupim-catedral, Cupinzeiros da caatinga baiana).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "formigas"

module.exports = {
    name: "curio203",
    aliases: ["cmd_curio203","alt_curio203","atalho_curio203","abrev_curio203","call_curio203","func_curio203"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Formigas e cupins",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sauva — abre a ficha de saúva","comparar sauva, correicao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio203" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
