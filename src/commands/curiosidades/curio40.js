/**
 * .curio40 — Terremotos e as escalas que os medem
 *
 * Terremotos e as escalas que os medem: 6 fichas consultáveis (Valdívia, Alasca, Sumatra, Tohoku, Magnitude de momento, Escala de Mercalli).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "terremotos"

module.exports = {
    name: "curio40",
    aliases: ["cmd_curio40","alt_curio40","atalho_curio40","abrev_curio40","call_curio40","func_curio40"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Terremotos e as escalas que os medem",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["valdivia — abre a ficha de valdívia","comparar valdivia, alasca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio40" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
