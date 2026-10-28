/**
 * .curio89 — As pontes brasileiras que impressionam
 *
 * As pontes brasileiras que impressionam: 6 fichas consultáveis (Ponte Rio-Niterói, Ponte Octávio Frias de Oliveira, Ponte Juscelino Kubitschek, Ponte Hercílio Luz, Ponte sobre o rio Negro, Ponte Newton Navarro).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pontesbr"

module.exports = {
    name: "curio89",
    aliases: ["cmd_curio89","alt_curio89","atalho_curio89","abrev_curio89","call_curio89","func_curio89"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "As pontes brasileiras que impressionam",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["rioniteroi — abre a ficha de ponte rio-niterói","comparar rioniteroi, estaiada — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio89" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
