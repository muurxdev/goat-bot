/**
 * .curio70 — As grandes festas populares do Brasil
 *
 * As grandes festas populares do Brasil: 6 fichas consultáveis (Círio de Nazaré, Festival de Parintins, Bumba meu boi, Festa de Iemanjá, Oktoberfest de Blumenau, Cavalhadas).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "festas"

module.exports = {
    name: "curio70",
    aliases: ["cmd_curio70","alt_curio70","atalho_curio70","abrev_curio70","call_curio70","func_curio70"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "As grandes festas populares do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cirio — abre a ficha de círio de nazaré","comparar cirio, parintins — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio70" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
