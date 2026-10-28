/**
 * .curio171 — A crise de 1929 e a Grande Depressão
 *
 * A crise de 1929 e a Grande Depressão: 6 fichas consultáveis (A euforia dos anos 1920, A quebra da bolsa, A onda de quebra de bancos, O desemprego em massa, O New Deal, A guerra de tarifas).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "crise1929"

module.exports = {
    name: "curio171",
    aliases: ["cmd_curio171","alt_curio171","atalho_curio171","abrev_curio171","call_curio171","func_curio171"],
    category: "curiosidades",
    subcategory: "História",
    description: "A crise de 1929 e a Grande Depressão",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["euforia — abre a ficha de a euforia dos anos 1920","comparar euforia, quebra — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio171" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
