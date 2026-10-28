/**
 * .curio243 — A história da fotografia
 *
 * A história da fotografia: 6 fichas consultáveis (A primeira imagem fixada, Daguerreótipo, A primeira Kodak, A câmera de 35 milímetros, Filme colorido de uso geral, A primeira câmera digital).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "fotografia"

module.exports = {
    name: "curio243",
    aliases: ["cmd_curio243","alt_curio243","atalho_curio243","abrev_curio243","call_curio243","func_curio243"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A história da fotografia",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["primeiraimagem — abre a ficha de a primeira imagem fixada","comparar primeiraimagem, daguerreotipo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio243" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
