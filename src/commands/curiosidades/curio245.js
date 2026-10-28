/**
 * .curio245 — A moda através das décadas
 *
 * A moda através das décadas: 6 fichas consultáveis (O jeans, A garçonne dos anos 1920, O New Look, A minissaia, O visual punk, A ombreira dos anos 1980).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "moda"

module.exports = {
    name: "curio245",
    aliases: ["cmd_curio245","alt_curio245","atalho_curio245","abrev_curio245","call_curio245","func_curio245"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A moda através das décadas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["jeans — abre a ficha de o jeans","comparar jeans, anosvinte — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio245" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
