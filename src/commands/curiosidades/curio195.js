/**
 * .curio195 — Aves que impressionam
 *
 * Aves que impressionam: 6 fichas consultáveis (Harpia, Albatroz-errante, Avestruz, Condor-dos-andes, Tuiuiú, Coruja-das-neves).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "aves"

module.exports = {
    name: "curio195",
    aliases: ["cmd_curio195","alt_curio195","atalho_curio195","abrev_curio195","call_curio195","func_curio195"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Aves que impressionam",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["harpia — abre a ficha de harpia","comparar harpia, albatroz — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio195" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
