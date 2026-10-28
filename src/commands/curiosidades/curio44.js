/**
 * .curio44 — As grandes cordilheiras
 *
 * As grandes cordilheiras: 6 fichas consultáveis (Dorsal Meso-Oceânica, Andes, Montanhas Rochosas, Himalaia, Grande Cordilheira Divisória, Alpes).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cordilheiras"

module.exports = {
    name: "curio44",
    aliases: ["cmd_curio44","alt_curio44","atalho_curio44","abrev_curio44","call_curio44","func_curio44"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As grandes cordilheiras",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["dorsalmeso — abre a ficha de dorsal meso-oceânica","comparar dorsalmeso, andes — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio44" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
