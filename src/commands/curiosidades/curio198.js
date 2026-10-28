/**
 * .curio198 — Crocodilos, jacarés e gaviais
 *
 * Crocodilos, jacarés e gaviais: 6 fichas consultáveis (Crocodilo-de-água-salgada, Crocodilo-do-nilo, Jacaré-açu, Jacaré-do-pantanal, Gavial-do-ganges, Aligátor-americano).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "crocodilianos"

module.exports = {
    name: "curio198",
    aliases: ["cmd_curio198","alt_curio198","atalho_curio198","abrev_curio198","call_curio198","func_curio198"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Crocodilos, jacarés e gaviais",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["salgada — abre a ficha de crocodilo-de-água-salgada","comparar salgada, nilo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio198" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
