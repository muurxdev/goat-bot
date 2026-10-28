/**
 * .curio213 — Temperos e especiarias
 *
 * Temperos e especiarias: 6 fichas consultáveis (Pimenta-do-reino, Canela, Açafrão-verdadeiro, Baunilha, Cravo-da-índia, Pimenta-malagueta).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "temperos"

module.exports = {
    name: "curio213",
    aliases: ["cmd_curio213","alt_curio213","atalho_curio213","abrev_curio213","call_curio213","func_curio213"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Temperos e especiarias",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["pimentareino — abre a ficha de pimenta-do-reino","comparar pimentareino, canela — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio213" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
