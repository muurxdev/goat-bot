/**
 * .curio8 — Quedas de água e cataratas
 *
 * Quedas de água e cataratas: 6 fichas consultáveis (Salto Angel, Cataratas do Iguaçu, Cataratas Vitória, Cataratas do Niágara, Cataratas de Khone, Cataratas Tugela).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "quedas"

module.exports = {
    name: "curio8",
    aliases: ["cmd_curio8","alt_curio8","atalho_curio8","abrev_curio8","call_curio8","func_curio8"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Quedas de água e cataratas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["angel — abre a ficha de salto angel","comparar angel, iguacu — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio8" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
