/**
 * .curio169 — A Primeira Guerra Mundial
 *
 * A Primeira Guerra Mundial: 6 fichas consultáveis (O atentado de Sarajevo, A guerra de trincheiras, Verdun e o Somme, As armas novas, A entrada dos Estados Unidos, O Tratado de Versalhes).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "primeiraguerra"

module.exports = {
    name: "curio169",
    aliases: ["cmd_curio169","alt_curio169","atalho_curio169","abrev_curio169","call_curio169","func_curio169"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Primeira Guerra Mundial",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sarajevo — abre a ficha de o atentado de sarajevo","comparar sarajevo, trincheiras — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio169" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
