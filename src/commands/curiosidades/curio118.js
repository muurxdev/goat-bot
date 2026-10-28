/**
 * .curio118 — Bactéria, vírus e fungo: quem é quem
 *
 * Bactéria, vírus e fungo: quem é quem: 6 fichas consultáveis (Bactéria, Vírus, Fungo, Protozoário, Príon, A vizinhança do corpo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "microbios"

module.exports = {
    name: "curio118",
    aliases: ["cmd_curio118","alt_curio118","atalho_curio118","abrev_curio118","call_curio118","func_curio118"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Bactéria, vírus e fungo: quem é quem",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["bacteria — abre a ficha de bactéria","comparar bacteria, virus — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio118" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
