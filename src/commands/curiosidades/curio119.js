/**
 * .curio119 — As vacinas que mudaram o mundo
 *
 * As vacinas que mudaram o mundo: 6 fichas consultáveis (Varíola, Poliomielite, Raiva, Febre amarela, Sarampo, Tétano).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "vacinashistoria"

module.exports = {
    name: "curio119",
    aliases: ["cmd_curio119","alt_curio119","atalho_curio119","abrev_curio119","call_curio119","func_curio119"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "As vacinas que mudaram o mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["variola — abre a ficha de varíola","comparar variola, polio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio119" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
