/**
 * .curio240 — Esculturas famosas
 *
 * Esculturas famosas: 6 fichas consultáveis (Vênus de Milo, Exército de Terracota, Moai, Davi, O Pensador, Estátua da Liberdade).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "esculturas"

module.exports = {
    name: "curio240",
    aliases: ["cmd_curio240","alt_curio240","atalho_curio240","abrev_curio240","call_curio240","func_curio240"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Esculturas famosas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["venusdemilo — abre a ficha de vênus de milo","comparar venusdemilo, exercitodeterracota — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio240" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
