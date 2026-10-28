/**
 * .curio91 — Ferrovias e trens brasileiros
 *
 * Ferrovias e trens brasileiros: 6 fichas consultáveis (Estrada de Ferro Madeira-Mamoré, Estrada de Ferro Vitória a Minas, Estrada de Ferro Carajás, Serra Verde Express, Trem do Corcovado, Maria Fumaça da Serra Gaúcha).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "trensbr"

module.exports = {
    name: "curio91",
    aliases: ["cmd_curio91","alt_curio91","atalho_curio91","abrev_curio91","call_curio91","func_curio91"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Ferrovias e trens brasileiros",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["madeiramamore — abre a ficha de estrada de ferro madeira-mamoré","comparar madeiramamore, vitoriaminas — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio91" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
