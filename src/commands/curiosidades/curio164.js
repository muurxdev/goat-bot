/**
 * .curio164 — A Revolução Industrial
 *
 * A Revolução Industrial: 6 fichas consultáveis (A máquina a vapor, A indústria do algodão, A ferrovia, A cidade operária, O trabalho de crianças, Os ludistas).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "revolucaoindustrial"

module.exports = {
    name: "curio164",
    aliases: ["cmd_curio164","alt_curio164","atalho_curio164","abrev_curio164","call_curio164","func_curio164"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Revolução Industrial",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["maquinavapor — abre a ficha de a máquina a vapor","comparar maquinavapor, algodao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio164" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
