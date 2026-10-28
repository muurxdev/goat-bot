/**
 * .curio221 — Os gêneros do cinema e de onde saíram
 *
 * Os gêneros do cinema e de onde saíram: 6 fichas consultáveis (Faroeste, Noir, Musical, Terror, Ficção científica, Comédia pastelão).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "generoscinema"

module.exports = {
    name: "curio221",
    aliases: ["cmd_curio221","alt_curio221","atalho_curio221","abrev_curio221","call_curio221","func_curio221"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Os gêneros do cinema e de onde saíram",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["faroeste — abre a ficha de faroeste","comparar faroeste, noir — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio221" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
