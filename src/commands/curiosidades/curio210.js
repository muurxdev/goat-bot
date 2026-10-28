/**
 * .curio210 — Árvores brasileiras e suas histórias
 *
 * Árvores brasileiras e suas histórias: 6 fichas consultáveis (Pau-brasil, Ipê-amarelo, Castanheira-do-brasil, Seringueira, Sumaúma, Araucária).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "arvoresbr"

module.exports = {
    name: "curio210",
    aliases: ["cmd_curio210","alt_curio210","atalho_curio210","abrev_curio210","call_curio210","func_curio210"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Árvores brasileiras e suas histórias",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["paubrasil — abre a ficha de pau-brasil","comparar paubrasil, ipeamarelo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio210" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
