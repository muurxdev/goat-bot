/**
 * .curio173 — A Guerra Fria
 *
 * A Guerra Fria: 6 fichas consultáveis (A cortina de ferro, OTAN e Pacto de Varsóvia, A Guerra da Coreia, A crise dos mísseis, A Guerra do Vietnã, O fim da Guerra Fria).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "guerrafria"

module.exports = {
    name: "curio173",
    aliases: ["cmd_curio173","alt_curio173","atalho_curio173","abrev_curio173","call_curio173","func_curio173"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Guerra Fria",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cortinadeferro — abre a ficha de a cortina de ferro","comparar cortinadeferro, aliancas — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio173" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
