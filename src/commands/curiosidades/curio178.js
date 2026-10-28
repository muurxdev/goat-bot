/**
 * .curio178 — A história do dinheiro
 *
 * A história do dinheiro: 6 fichas consultáveis (O escambo, A moeda cunhada, O papel-moeda, O padrão-ouro, O cartão de crédito, O dinheiro digital).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "dinheirohistoria"

module.exports = {
    name: "curio178",
    aliases: ["cmd_curio178","alt_curio178","atalho_curio178","abrev_curio178","call_curio178","func_curio178"],
    category: "curiosidades",
    subcategory: "História",
    description: "A história do dinheiro",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["escambo — abre a ficha de o escambo","comparar escambo, moedacunhada — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio178" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
