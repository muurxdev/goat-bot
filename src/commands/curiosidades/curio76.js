/**
 * .curio76 — Gírias e palavras de cada estado
 *
 * Gírias e palavras de cada estado: 6 fichas consultáveis (Uai, Trem, Bah, Oxente, Égua, Mermão).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "girias"

module.exports = {
    name: "curio76",
    aliases: ["cmd_curio76","alt_curio76","atalho_curio76","abrev_curio76","call_curio76","func_curio76"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Gírias e palavras de cada estado",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["uai — abre a ficha de uai","comparar uai, trem — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio76" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
