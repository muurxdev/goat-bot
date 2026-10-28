/**
 * .curio110 — Pressão, do vácuo ao fundo do mar
 *
 * Pressão, do vácuo ao fundo do mar: 6 fichas consultáveis (Nível do mar, Topo do Everest, Panela de pressão, Mergulho a 30 m, Superfície de Vênus, Fundo das Marianas).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pressao"

module.exports = {
    name: "curio110",
    aliases: ["cmd_curio110","alt_curio110","atalho_curio110","abrev_curio110","call_curio110","func_curio110"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Pressão, do vácuo ao fundo do mar",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["nivelmar — abre a ficha de nível do mar","comparar nivelmar, everest — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio110" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
