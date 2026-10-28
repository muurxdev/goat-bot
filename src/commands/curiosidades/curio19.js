/**
 * .curio19 — De onde vem o nome das moedas
 *
 * De onde vem o nome das moedas: 6 fichas consultáveis (Real, Dólar, Libra esterlina, Rúpia, Iene, Rublo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "moedas"

module.exports = {
    name: "curio19",
    aliases: ["cmd_curio19","alt_curio19","atalho_curio19","abrev_curio19","call_curio19","func_curio19"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "De onde vem o nome das moedas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["real — abre a ficha de real","comparar real, dolar — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio19" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
