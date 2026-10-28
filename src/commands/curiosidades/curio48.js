/**
 * .curio48 — Enclaves, exclaves e pedaços soltos
 *
 * Enclaves, exclaves e pedaços soltos: 6 fichas consultáveis (Kaliningrado, Llívia, Ceuta e Melilla, Cabinda, Nakhchivan, Alasca).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "enclaves"

module.exports = {
    name: "curio48",
    aliases: ["cmd_curio48","alt_curio48","atalho_curio48","abrev_curio48","call_curio48","func_curio48"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Enclaves, exclaves e pedaços soltos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["kaliningrado — abre a ficha de kaliningrado","comparar kaliningrado, llivia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio48" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
