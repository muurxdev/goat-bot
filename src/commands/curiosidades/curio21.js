/**
 * .curio21 — Países sem saída para o mar
 *
 * Países sem saída para o mar: 6 fichas consultáveis (Bolívia, Paraguai, Cazaquistão, Mongólia, Uzbequistão, Suíça).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "semlitoral"

module.exports = {
    name: "curio21",
    aliases: ["cmd_curio21","alt_curio21","atalho_curio21","abrev_curio21","call_curio21","func_curio21"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Países sem saída para o mar",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["bolivia — abre a ficha de bolívia","comparar bolivia, paraguai — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio21" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
