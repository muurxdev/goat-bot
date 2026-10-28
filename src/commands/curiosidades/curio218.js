/**
 * .curio218 — A história da animação
 *
 * A história da animação: 6 fichas consultáveis (Gertie, o Dinossauro, As Aventuras do Príncipe Achmed, Branca de Neve e os Sete Anões, Astro Boy, Toy Story, Wallace e Gromit).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "animacao"

module.exports = {
    name: "curio218",
    aliases: ["cmd_curio218","alt_curio218","atalho_curio218","abrev_curio218","call_curio218","func_curio218"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A história da animação",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["gertie — abre a ficha de gertie, o dinossauro","comparar gertie, achmed — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio218" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
