/**
 * .curio10 — As sete maravilhas do mundo antigo
 *
 * As sete maravilhas do mundo antigo: 7 fichas consultáveis (Grande Pirâmide de Gizé, Jardins Suspensos da Babilônia, Templo de Ártemis, Estátua de Zeus em Olímpia, Mausoléu de Halicarnasso, Colosso de Rodes, Farol de Alexandria).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "maravilhasantigas"

module.exports = {
    name: "curio10",
    aliases: ["cmd_curio10","alt_curio10","atalho_curio10","abrev_curio10","call_curio10","func_curio10"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As sete maravilhas do mundo antigo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["piramide — abre a ficha de grande pirâmide de gizé","comparar piramide, jardins — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio10" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
