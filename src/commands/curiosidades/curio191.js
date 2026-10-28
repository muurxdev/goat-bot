/**
 * .curio191 — Os grandes felinos
 *
 * Os grandes felinos: 6 fichas consultáveis (Leão, Tigre, Onça-pintada, Leopardo, Guepardo, Puma).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "felinos"

module.exports = {
    name: "curio191",
    aliases: ["cmd_curio191","alt_curio191","atalho_curio191","abrev_curio191","call_curio191","func_curio191"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os grandes felinos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["leao — abre a ficha de leão","comparar leao, tigre — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio191" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
