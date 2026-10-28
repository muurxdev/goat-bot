/**
 * .curio107 — Do átomo à galáxia, em degraus
 *
 * Do átomo à galáxia, em degraus: 6 fichas consultáveis (Próton, Átomo, Vírus, Bactéria, Célula humana, Terra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "tamanhos"

module.exports = {
    name: "curio107",
    aliases: ["cmd_curio107","alt_curio107","atalho_curio107","abrev_curio107","call_curio107","func_curio107"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Do átomo à galáxia, em degraus",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["proton — abre a ficha de próton","comparar proton, atomo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio107" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
