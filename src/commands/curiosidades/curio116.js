/**
 * .curio116 — DNA e genética em números
 *
 * DNA e genética em números: 6 fichas consultáveis (Pares de base, Cromossomos, Genes, Duas pessoas quaisquer, Chimpanzé, A fita esticada).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "dna"

module.exports = {
    name: "curio116",
    aliases: ["cmd_curio116","alt_curio116","atalho_curio116","abrev_curio116","call_curio116","func_curio116"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "DNA e genética em números",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["paresdebase — abre a ficha de pares de base","comparar paresdebase, cromossomos — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio116" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
