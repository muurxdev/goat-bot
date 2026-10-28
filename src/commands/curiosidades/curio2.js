/**
 * .curio2 — As montanhas mais altas do mundo
 *
 * As montanhas mais altas do mundo: 6 fichas consultáveis (Everest, K2, Kangchenjunga, Lhotse, Makalu, Annapurna I).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "montanhas"

module.exports = {
    name: "curio2",
    aliases: ["cmd_curio2","alt_curio2","atalho_curio2","abrev_curio2","call_curio2","func_curio2"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As montanhas mais altas do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["everest — abre a ficha de everest","comparar everest, k2 — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio2" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
