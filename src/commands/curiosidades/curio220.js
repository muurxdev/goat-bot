/**
 * .curio220 — O cinema brasileiro
 *
 * O cinema brasileiro: 6 fichas consultáveis (Limite, Deus e o Diabo na Terra do Sol, Dona Flor e Seus Dois Maridos, Central do Brasil, Cidade de Deus, Ainda Estou Aqui).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cinemabrasileiro"

module.exports = {
    name: "curio220",
    aliases: ["cmd_curio220","alt_curio220","atalho_curio220","abrev_curio220","call_curio220","func_curio220"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O cinema brasileiro",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["limite — abre a ficha de limite","comparar limite, deusediabo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio220" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
